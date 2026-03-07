import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ImageLoader } from '@/components/ImageLoader';
import { ChevronLeft, ChevronRight, X, Download, Share2 } from 'lucide-react';

export interface ImageData {
  url: string;
  title?: string;
  description?: string;
  uploadedAt?: Date;
  uploader?: string;
}

export interface ImageModalProps {
  isOpen: boolean;
  images: ImageData[];
  currentIndex?: number;
  onClose: () => void;
  onImageChange?: (index: number) => void;
}

export function ImageModal({
  isOpen,
  images,
  currentIndex = 0,
  onClose,
  onImageChange,
}: ImageModalProps) {
  const [activeIndex, setActiveIndex] = useState(currentIndex);

  const currentImage = images[activeIndex];
  const hasMultiple = images.length > 1;

  const handlePrevious = () => {
    const newIndex = activeIndex === 0 ? images.length - 1 : activeIndex - 1;
    setActiveIndex(newIndex);
    onImageChange?.(newIndex);
  };

  const handleNext = () => {
    const newIndex = activeIndex === images.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(newIndex);
    onImageChange?.(newIndex);
  };

  const handleDownload = () => {
    if (currentImage?.url) {
      const link = document.createElement('a');
      link.href = currentImage.url;
      link.download = currentImage.title || 'image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = () => {
    if (currentImage?.url && navigator.share && typeof navigator.share === 'function') {
      navigator.share({
        title: currentImage.title || 'Problem Photo',
        text: currentImage.description || 'Check out this problem report',
        url: currentImage.url,
      }).catch(err => console.error('Share failed:', err));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 bg-black border-0">
        <DialogHeader className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black to-transparent p-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white">
              {currentImage?.title || 'Problem Photo'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Main Image */}
        <div className="relative w-full bg-black flex items-center justify-center min-h-[500px]">
          <ImageLoader
            src={currentImage?.url || ''}
            alt={currentImage?.title || 'Problem photo'}
            className="max-w-full max-h-[600px] object-contain"
          />

          {/* Navigation Arrows */}
          {hasMultiple && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-20"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 z-20"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}

          {/* Image Counter */}
          {hasMultiple && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {activeIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Image Info and Actions */}
        <div className="bg-gray-900 border-t border-gray-700 p-4 space-y-3">
          {/* Description */}
          {currentImage?.description && (
            <p className="text-sm text-gray-300">
              {currentImage.description}
            </p>
          )}

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="space-y-1">
              {currentImage?.uploader && (
                <p>Uploaded by: {currentImage.uploader}</p>
              )}
              {currentImage?.uploadedAt && (
                <p>
                  {new Date(currentImage.uploadedAt).toLocaleDateString()} at{' '}
                  {new Date(currentImage.uploadedAt).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            {typeof navigator.share === 'function' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="text-gray-300 border-gray-600 hover:bg-gray-800"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="text-gray-300 border-gray-600 hover:bg-gray-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
