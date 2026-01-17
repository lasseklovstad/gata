import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { captureException } from "@sentry/react-router";
import { z } from "zod";
import { zfd } from "zod-form-data";

import { getUsers, updateUser } from "~/.server/db/user";
import { createBlobSas } from "~/utils/azure.server";

export const migrateUserPicturesToBlobIntent = "migrateUserPicturesToBlob";
export const migrateUserPicturesToBlobSchema = zfd.formData({
   intent: zfd.text(z.literal(migrateUserPicturesToBlobIntent)),
});

interface MigrationResult {
   success: boolean;
   userId: string;
   error?: string;
}

interface MigrationProgress {
   total: number;
   completed: number;
   successful: number;
   failed: number;
   results: MigrationResult[];
}

/**
 * Checks if a picture URL is a local filesystem path
 */
function isLocalFilesystemPath(pictureUrl: string): boolean {
   return pictureUrl.startsWith("/picture/profile/");
}

/**
 * Uploads a file to Azure Blob Storage using a SAS token
 */
async function uploadToBlob(buffer: Buffer, contentType: string, blobUrl: string, sasToken: string): Promise<void> {
   const uploadUrl = `${blobUrl}?${sasToken}`;

   const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
         "x-ms-blob-type": "BlockBlob",
         "Content-Type": contentType,
      },
      body: buffer as unknown as BodyInit,
   });

   if (response.status === 409) {
      throw new Error("Blob already exists (conflict)");
   }

   if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} ${errorText}`);
   }
}

/**
 * Generates a SAS token for uploading a blob
 */
async function generateSasToken(containerName: string, blobName: string): Promise<string> {
   const expireInMs = 1000 * 60 * 5; // 5 minutes

   const fullUrl = await createBlobSas({
      accountKey: process.env.AZURE_BLOB_KEY,
      accountName: process.env.AZURE_BLOB_NAME,
      containerName,
      blobName,
      permissions: "cw", // create and write
      expiresOn: new Date(new Date().valueOf() + expireInMs),
      protocol: "https",
   });

   // Extract just the query parameters (SAS token) from the full URL
   const url = new URL(fullUrl);
   return url.search.substring(1); // Remove the leading '?'
}

/**
 * Gets the content type based on file extension
 */
function getContentType(filename: string): string {
   const ext = filename.toLowerCase().split(".").pop();
   const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
   };
   return mimeTypes[ext || ""] || "image/jpeg";
}

/**
 * Migrates a single user's picture from filesystem to Azure Blob Storage
 */
async function migrateSingleUserPicture(
   userId: string,
   pictureUrl: string,
   containerName: string
): Promise<{ success: boolean; newUrl?: string; error?: string }> {
   try {
      // Extract filename from path (e.g., "profile/abc123.jpg" -> "abc123.jpg")
      const filename = pictureUrl.replace("/picture/", "");
      const imagePath = resolve(`${process.env.IMAGE_DIR}/${filename}`);

      if (!existsSync(imagePath)) {
         return { success: false, error: `File not found: ${imagePath}` };
      }

      // Read file from filesystem
      const buffer = await readFile(imagePath);
      const contentType = getContentType(filename);

      // Generate new blob path
      const newCloudId = crypto.randomUUID();
      const blobName = `user/${userId}/${newCloudId}`;
      const newBlobUrl = `https://${process.env.AZURE_BLOB_NAME}.blob.core.windows.net/${containerName}/${blobName}`;
      const sasToken = await generateSasToken(containerName, blobName);

      // Upload to Azure Blob Storage
      await uploadToBlob(buffer, contentType, newBlobUrl, sasToken);

      return { success: true, newUrl: newBlobUrl };
   } catch (error) {
      captureException(error);
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
   }
}

/**
 * Migrates all user pictures from local filesystem to Azure Blob Storage
 */
export async function migrateAllUserPicturesToBlob(): Promise<MigrationProgress> {
   const containerName = process.env.NODE_ENV === "production" ? "gata" : "gata-local";
   const users = await getUsers();

   const progress: MigrationProgress = {
      total: users.length,
      completed: 0,
      successful: 0,
      failed: 0,
      results: [],
   };

   // Process users sequentially to avoid overwhelming the services
   for (const user of users) {
      try {
         // Migrate main picture if it's a local path
         if (isLocalFilesystemPath(user.picture)) {
            const result = await migrateSingleUserPicture(user.id, user.picture, containerName);
            if (result.success && result.newUrl) {
               await updateUser(user.id, { picture: result.newUrl });
            } else {
               throw new Error(result.error || "Failed to migrate picture");
            }
         }

         progress.completed++;
         progress.successful++;
         progress.results.push({ success: true, userId: user.id });
      } catch (error) {
         progress.completed++;
         progress.failed++;
         const errorMessage = error instanceof Error ? error.message : "Unknown error";
         progress.results.push({ success: false, userId: user.id, error: errorMessage });
         captureException(error);
      }
   }

   return progress;
}
