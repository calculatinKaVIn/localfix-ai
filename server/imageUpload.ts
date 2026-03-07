import { storagePut } from "./storage";
import { nanoid } from "nanoid";

/**
 * Allowed image file types
 */
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Maximum file size: 5MB
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Validate image file
 */
export function validateImageFile(file: {
  data: Buffer | Uint8Array | string;
  mimetype: string;
  size: number;
}): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(", ")}`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

/**
 * Upload image to S3 and return URL
 */
export async function uploadProblemImage(
  userId: number,
  imageData: Buffer | Uint8Array | string,
  mimetype: string
): Promise<string> {
  // Generate unique file name
  const fileId = nanoid();
  const extension = getFileExtension(mimetype);
  const fileName = `problems/${userId}/${fileId}.${extension}`;

  try {
    const result = await storagePut(fileName, imageData, mimetype);
    return result.url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image");
  }
}

/**
 * Get file extension from MIME type
 */
function getFileExtension(mimetype: string): string {
  const mimeToExt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };

  return mimeToExt[mimetype] || "jpg";
}
