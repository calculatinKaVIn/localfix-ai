import React from 'react';
import { ImageLoader } from '@/components/ImageLoader';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ImageThumbnailGalleryProps {
  images: string[];
  onImageClick?: (index: number) => void;
  maxThumbnails?: number;
  className?: string;
}

export function ImageThumbnailGallery({
  images,
  onImageClick,
  maxThumbnails = 3,
  className = '',
}: ImageThumbnailGalleryProps) {
  const [startIndex, setStartIndex] = React.useState(0);

  if (!images || images.length === 0) {
    return null;
  }

  const visibleImages = images.slice(startIndex, startIndex + maxThumbnails);
  const hasMore = images.length > maxThumbnails;
  const canScrollLeft = startIndex > 0;
  const canScrollRight = startIndex + maxThumbnails < images.length;

  const handleScrollLeft = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStartIndex(Math.max(0, startIndex - 1));
  };

  const handleScrollRight = (e: React.MouseEvent) => {
    e.stopPropagation();
    setStartIndex(Math.min(images.length - maxThumbnails, startIndex + 1));
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Left Arrow */}
      {hasMore && canScrollLeft && (
        <button
          onClick={handleScrollLeft}
          className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
      )}

      {/* Thumbnails */}
      <div className="flex gap-2">
        {visibleImages.map((imageUrl, index) => (
          <button
            key={`${startIndex + index}`}
            onClick={() => onImageClick?.(startIndex + index)}
            className="flex-shrink-0 w-12 h-12 rounded border-2 border-white/30 hover:border-white overflow-hidden transition-colors"
            title={`Image ${startIndex + index + 1} of ${images.length}`}
          >
            <ImageLoader
              src={imageUrl}
              alt={`Thumbnail ${startIndex + index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Right Arrow */}
      {hasMore && canScrollRight && (
        <button
          onClick={handleScrollRight}
          className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      )}

      {/* Image Count */}
      {hasMore && (
        <span className="flex-shrink-0 text-xs text-white/70 ml-1">
          {startIndex + 1}-{Math.min(startIndex + maxThumbnails, images.length)}/{images.length}
        </span>
      )}
    </div>
  );
}
