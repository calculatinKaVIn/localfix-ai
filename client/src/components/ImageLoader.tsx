import { useState, useEffect, useRef } from "react";
import { AlertCircle, Image as ImageIcon, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImageLoaderProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackText?: string;
  maxRetries?: number;
}

/**
 * ImageLoader component with robust error handling, retry logic, and fallback UI
 * Handles image loading failures gracefully with multiple retry attempts
 */
export function ImageLoader({
  src,
  alt,
  className = "w-full rounded-lg",
  onLoad,
  onError,
  fallbackText = "Image failed to load",
  maxRetries = 3,
}: ImageLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      setHasError(true);
      return;
    }

    setIsLoading(true);
    setHasError(false);
    setRetryCount(0);
  }, [src]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setHasError(false);
    setRetryCount(0);
    onLoad?.();
  };

  const handleImageError = () => {
    // Retry logic: exponential backoff
    if (retryCount < maxRetries) {
      const delay = Math.pow(2, retryCount) * 500; // 500ms, 1s, 2s, 4s
      retryTimeoutRef.current = setTimeout(() => {
        setRetryCount((prev) => prev + 1);
        // Force reload by updating src
        if (imgRef.current) {
          imgRef.current.src = `${src}?retry=${retryCount + 1}`;
        }
      }, delay);
    } else {
      setIsLoading(false);
      setHasError(true);
      onError?.();
    }
  };

  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  if (!src) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center min-h-[200px]`}>
        <div className="text-center">
          <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No image provided</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {fallbackText}
          {retryCount >= maxRetries && ` (Retried ${maxRetries} times)`}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`${className} bg-gray-100 flex items-center justify-center min-h-[200px] absolute inset-0`}>
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            <p className="text-xs text-gray-500">
              {retryCount > 0 ? `Retrying (${retryCount}/${maxRetries})...` : "Loading image..."}
            </p>
          </div>
        </div>
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={className}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{ opacity: isLoading ? 0 : 1, transition: "opacity 0.3s ease-in-out" }}
      />
    </div>
  );
}
