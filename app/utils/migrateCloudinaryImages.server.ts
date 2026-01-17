import { captureException } from "@sentry/react-router";
import { eq } from "drizzle-orm";

import { db } from "db/config.server";
import { cloudinaryImage, type CloudinaryImage } from "db/schema";
import { createBlobSas } from "~/utils/azure.server";

interface MigrationResult {
   success: boolean;
}

interface MigrationProgress {
   total: number;
   completed: number;
   successful: number;
   failed: number;
   results: MigrationResult[];
}

/**
 * Downloads a file from a URL and returns it as a Buffer
 */
async function downloadFile(url: string): Promise<{ buffer: Buffer; contentType: string }> {
   const response = await fetch(url);
   if (!response.ok) {
      throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
   }

   const arrayBuffer = await response.arrayBuffer();
   const buffer = Buffer.from(arrayBuffer);
   const contentType = response.headers.get("content-type") || "application/octet-stream";

   return { buffer, contentType };
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
 * Checks if a cloudUrl is a Cloudinary URL
 */
function isCloudinaryUrl(cloudUrl: string): boolean {
   return cloudUrl.includes("res.cloudinary.com");
}

/**
 * Migrates a single Cloudinary image to Azure Blob Storage
 */
async function migrateSingleImage(
   image: CloudinaryImage,
   eventId: number,
   containerName: string
): Promise<MigrationResult> {
   try {
      // Download from Cloudinary
      const { buffer, contentType } = await downloadFile(image.cloudUrl);
      const newCloudId = crypto.randomUUID();
      // Generate blob path and SAS token
      const blobName = `event/${eventId}/${newCloudId}`;
      const newBlobUrl = `https://${process.env.AZURE_BLOB_NAME}.blob.core.windows.net/${containerName}/${blobName}`;
      const sasToken = await generateSasToken(containerName, blobName);

      // Upload to Azure Blob Storage
      await uploadToBlob(buffer, contentType, newBlobUrl, sasToken);

      // Update database
      await db
         .update(cloudinaryImage)
         .set({ cloudUrl: newBlobUrl, cloudId: newCloudId, type: contentType })
         .where(eq(cloudinaryImage.cloudId, image.cloudId));

      return {
         success: true,
      };
   } catch (error) {
      captureException(error);
      return {
         success: false,
      };
   }
}

/**
 * Migrates all Cloudinary images for an event to Azure Blob Storage
 */
export async function migrateCloudinaryImagesToBlob(
   eventId: number,
   cloudinaryImages: CloudinaryImage[]
): Promise<MigrationProgress> {
   const containerName = process.env.NODE_ENV === "production" ? "gata" : "gata-local";

   // Filter to only Cloudinary URLs
   const imagesToMigrate = cloudinaryImages.filter((img) => isCloudinaryUrl(img.cloudUrl));

   const progress: MigrationProgress = {
      total: imagesToMigrate.length,
      completed: 0,
      successful: 0,
      failed: 0,
      results: [],
   };

   // Process images sequentially to avoid overwhelming the services
   for (const image of imagesToMigrate) {
      const result = await migrateSingleImage(image, eventId, containerName);

      progress.completed++;
      if (result.success) {
         progress.successful++;
      } else {
         progress.failed++;
      }
      progress.results.push(result);
   }

   return progress;
}
