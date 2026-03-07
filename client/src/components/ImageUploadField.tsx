import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Extract base64 data (remove data:image/...;base64, prefix)
      const base64 = result.split(",")[1] || result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface ImageUploadFieldProps {
  onImageUpload: (imageUrl: string) => void;
  isLoading?: boolean;
}

export default function ImageUploadField({ onImageUpload, isLoading }: ImageUploadFieldProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const response = await fetch("/api/trpc/problems.uploadImage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageData: base64,
          mimetype: file.type,
          size: file.size,
        }),
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      if (data.result?.data?.imageUrl) {
        onImageUpload(data.result.data.imageUrl);
        toast.success("Image uploaded successfully");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("border-primary", "bg-primary/5");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("border-primary", "bg-primary/5");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-primary", "bg-primary/5");

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (preview) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-semibold">Problem Image</label>
        <Card className="card-elegant p-4 relative overflow-hidden">
          <div className="relative w-full h-48 bg-background rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Problem preview"
              className="w-full h-full object-cover"
            />
            {!isLoading && (
              <button
                onClick={clearPreview}
                className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">Image uploaded successfully</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold">Problem Image (Optional)</label>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={uploading || isLoading}
      />

      <Card
        className="card-elegant p-8 border-2 border-dashed border-border cursor-pointer transition-all hover:border-primary/50 hover:bg-primary/5"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center text-center">
          {uploading ? (
            <>
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-3" />
              <p className="font-medium">Uploading image...</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <p className="font-medium mb-1">Click to upload or drag and drop</p>
              <p className="text-sm text-muted-foreground">
                PNG, JPG, WebP, GIF (Max 5MB)
              </p>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
