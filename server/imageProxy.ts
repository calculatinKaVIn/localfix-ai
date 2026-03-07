/**
 * Image Proxy Service
 * 
 * Handles image loading from CloudFront CDN with retry logic,
 * caching, and proper error handling
 */



interface ImageProxyOptions {
  url: string;
  maxRetries?: number;
  timeout?: number;
}

/**
 * Fetch image from CloudFront with retry logic and error handling
 */
export async function fetchImageWithRetry(
  url: string,
  maxRetries: number = 3,
  timeout: number = 10000
): Promise<Buffer | null> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "LocalFix-AI/1.0",
          "Accept": "image/*",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const buffer = await response.arrayBuffer();
      return Buffer.from(buffer);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        // Exponential backoff: 500ms, 1s, 2s
        const delay = Math.pow(2, attempt) * 500;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error(`[ImageProxy] Failed to fetch image after ${maxRetries + 1} attempts:`, lastError);
  return null;
}

/**
 * Validate image URL format
 */
export function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.protocol === "http:" ||
      urlObj.protocol === "https:" ||
      urlObj.hostname.includes("cloudfront.net") ||
      urlObj.hostname.includes("amazonaws.com")
    );
  } catch {
    return false;
  }
}

/**
 * Generate cache-busting URL for image retry
 */
export function generateCacheBustingUrl(url: string, attempt: number): string {
  try {
    const urlObj = new URL(url);
    // Use timestamp-based cache busting instead of query param
    // This works better with CloudFront
    urlObj.searchParams.set("_t", Date.now().toString());
    urlObj.searchParams.set("_attempt", attempt.toString());
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Get image metadata (size, type) without downloading full image
 */
export async function getImageMetadata(url: string): Promise<{
  contentType: string;
  contentLength: number;
  cacheControl: string;
} | null> {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      headers: {
        "User-Agent": "LocalFix-AI/1.0",
      },
    });

    if (!response.ok) {
      return null;
    }

    return {
      contentType: response.headers.get("content-type") || "image/jpeg",
      contentLength: parseInt(response.headers.get("content-length") || "0"),
      cacheControl: response.headers.get("cache-control") || "public",
    };
  } catch (error) {
    console.error("[ImageProxy] Failed to get image metadata:", error);
    return null;
  }
}

/**
 * Optimize image URL for reliable loading
 * - Adds cache-busting parameters
 * - Validates URL format
 * - Ensures proper headers
 */
export function optimizeImageUrl(url: string): string {
  if (!isValidImageUrl(url)) {
    console.warn("[ImageProxy] Invalid image URL:", url);
    return url;
  }

  try {
    const urlObj = new URL(url);
    
    // Add cache-busting timestamp
    urlObj.searchParams.set("_v", Date.now().toString());
    
    // Ensure CloudFront caching is optimized
    if (urlObj.hostname.includes("cloudfront.net")) {
      // CloudFront respects Cache-Control headers
      // Add version parameter for cache invalidation
      urlObj.searchParams.set("_cf", "1");
    }

    return urlObj.toString();
  } catch {
    return url;
  }
}
