import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  title?: string;
}

export default function ImageGallery({ images, title }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!images || images.length === 0) {
    return null;
  }

  const currentImage = selectedIndex !== null ? images[selectedIndex] : null;

  const handlePrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % images.length);
    }
  };

  return (
    <>
      {/* Thumbnail Grid */}
      <div>
        {title && <h3 className="text-lg font-semibold mb-3">{title}</h3>}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => setSelectedIndex(index)}
            >
              <img
                src={image}
                alt={`Problem image ${index + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  View
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {currentImage && selectedIndex !== null && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <Card className="card-elegant relative max-w-2xl w-full">
            {/* Close Button */}
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 right-4 z-10 bg-background rounded-full p-2 hover:bg-background/80 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Image */}
            <div className="relative aspect-video bg-background overflow-hidden rounded-t-lg">
              <img
                src={currentImage}
                alt={`Problem image ${selectedIndex + 1}`}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Navigation */}
            <div className="p-4 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={images.length <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <span className="text-sm text-muted-foreground">
                {selectedIndex + 1} / {images.length}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
                disabled={images.length <= 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
