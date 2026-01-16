import { captureException } from "@sentry/react-router";

import type { cloudinaryImage } from "db/schema";
import {
   getAllReportsWithOldFiles,
   batchInsertCloudImages,
   batchInsertReportFiles,
   updateReportContentOnly,
} from "~/.server/db/report";
import { createBlobSas } from "~/utils/azure.server";

interface MigrationResult {
   reportId: string;
   success: boolean;
   filesProcessed: number;
   error?: string;
}

interface MigrationProgress {
   totalReports: number;
   totalFiles: number;
   completed: number;
   successful: number;
   failed: number;
   results: MigrationResult[];
}

interface SlateImageElement {
   type: string;
   imageId?: string | null;
   size?: number;
   children: Array<{ text: string }>;
}

type SlateElement = SlateImageElement | { type: string; children: SlateElement[] };

interface OldReportFile {
   id: string;
   data: string | null;
   cloudUrl: string | null;
   cloudId: string | null;
   reportId: string;
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
function isCloudinaryUrl(cloudUrl: string | null | undefined): boolean {
   return !!cloudUrl && cloudUrl.includes("res.cloudinary.com");
}

/**
 * Extracts image dimensions from Cloudinary URL or returns defaults
 */
function extractImageDimensions(cloudUrl: string): { width: number; height: number } {
   // Try to extract dimensions from Cloudinary URL patterns
   // e.g., https://res.cloudinary.com/...upload/w_800,h_600,...
   const match = cloudUrl.match(/\/w_(\d+),h_(\d+)/);
   if (match) {
      return { width: parseInt(match[1]), height: parseInt(match[2]) };
   }
   // Default dimensions if not found
   return { width: 1000, height: 1000 };
}

/**
 * Migrates a single report's files from oldReportFiles to Azure Blob Storage
 */
async function migrateSingleReport(
   report: { id: string; content: string | null; oldFiles: OldReportFile[] },
   containerName: string
): Promise<MigrationResult> {
   const result: MigrationResult = {
      reportId: report.id,
      success: false,
      filesProcessed: 0,
   };

   try {
      const cloudImages: Array<typeof cloudinaryImage.$inferInsert> = [];
      const reportFileRecords: Array<{ reportId: string; fileId: string }> = [];
      const fileIdMapping: Map<string, string> = new Map(); // oldFileId -> azureBlobUrl

      // Process each old file
      for (const oldFile of report.oldFiles) {
         try {
            let buffer: Buffer;
            let contentType: string;
            const newCloudId = crypto.randomUUID();

            // Download file - either from base64 data or Cloudinary URL
            if (oldFile.data) {
               // Base64 encoded data
               buffer = Buffer.from(oldFile.data, "base64");
               contentType = "image/jpeg"; // Default, could be improved with detection
            } else if (oldFile.cloudUrl) {
               // Download from Cloudinary or other URL
               const downloaded = await downloadFile(oldFile.cloudUrl);
               buffer = downloaded.buffer;
               contentType = downloaded.contentType;
            } else {
               console.warn(`File ${oldFile.id} has no data or cloudUrl, skipping`);
               continue;
            }

            // Generate blob path and upload to Azure
            const blobName = `report/${report.id}/${newCloudId}`;
            const newBlobUrl = `https://${process.env.AZURE_BLOB_NAME}.blob.core.windows.net/${containerName}/${blobName}`;
            const sasToken = await generateSasToken(containerName, blobName);

            await uploadToBlob(buffer, contentType, newBlobUrl, sasToken);

            // Get dimensions
            let width = 1000;
            let height = 1000;
            if (oldFile.cloudUrl && isCloudinaryUrl(oldFile.cloudUrl)) {
               const dims = extractImageDimensions(oldFile.cloudUrl);
               width = dims.width;
               height = dims.height;
            }

            // Prepare records for batch insert
            cloudImages.push({
               cloudUrl: newBlobUrl,
               cloudId: newCloudId,
               width,
               height,
               isDeleted: false,
               type: contentType,
            });

            reportFileRecords.push({
               reportId: report.id,
               fileId: newCloudId,
            });

            // Map old file ID to new Azure Blob URL
            fileIdMapping.set(oldFile.id, newBlobUrl);

            result.filesProcessed++;
         } catch (fileError) {
            console.error(`Error processing file ${oldFile.id}:`, fileError);
            captureException(fileError);
            // Continue with other files
         }
      }

      // Batch insert into database
      if (cloudImages.length > 0) {
         await batchInsertCloudImages(cloudImages);
         await batchInsertReportFiles(reportFileRecords);
      }

      // Update content JSON to replace old file IDs with Azure Blob URLs
      if (report.content && fileIdMapping.size > 0) {
         try {
            const contentObj = JSON.parse(report.content) as SlateElement[];

            const updateContent = (elements: SlateElement[]): { updated: SlateElement[]; modified: boolean } => {
               let hasModified = false;
               const updated = elements.map((element) => {
                  if (element.type === "image" && "imageId" in element && element.imageId) {
                     const imageId = element.imageId;
                     // Check if imageId is an old file ID that we migrated
                     if (fileIdMapping.has(imageId)) {
                        hasModified = true;
                        return {
                           ...element,
                           imageId: fileIdMapping.get(imageId)!,
                        };
                     }
                  }
                  // Recursively process children if they exist
                  if ("children" in element && Array.isArray(element.children)) {
                     const childResult = updateContent(element.children as SlateElement[]);
                     if (childResult.modified) {
                        hasModified = true;
                        return {
                           ...element,
                           children: childResult.updated,
                        };
                     }
                  }
                  return element;
               });
               return { updated, modified: hasModified };
            };

            const result = updateContent(contentObj);

            if (result.modified) {
               await updateReportContentOnly(report.id, JSON.stringify(result.updated));
            }
         } catch (contentError) {
            console.error(`Error updating content for report ${report.id}:`, contentError);
            captureException(contentError);
            // Don't fail the whole migration if just content update fails
         }
      }

      result.success = true;
   } catch (error) {
      console.error(`Error migrating report ${report.id}:`, error);
      captureException(error);
      result.error = error instanceof Error ? error.message : "Unknown error";
   }

   return result;
}

/**
 * Migrates all report files from oldReportFiles to Azure Blob Storage
 */
export async function migrateAllReportFilesToBlob(): Promise<MigrationProgress> {
   const containerName = process.env.NODE_ENV === "production" ? "gata" : "gata-local";

   // Get all reports that have old files
   const reportsWithFiles = await getAllReportsWithOldFiles();

   const totalFiles = reportsWithFiles.reduce((sum, report) => sum + report.oldFiles.length, 0);

   const progress: MigrationProgress = {
      totalReports: reportsWithFiles.length,
      totalFiles,
      completed: 0,
      successful: 0,
      failed: 0,
      results: [],
   };

   // Process reports sequentially to avoid overwhelming the services
   for (const report of reportsWithFiles) {
      const result = await migrateSingleReport(report, containerName);

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
