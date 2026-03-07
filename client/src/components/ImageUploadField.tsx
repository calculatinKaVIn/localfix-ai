import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, X, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

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
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Use tRPC mutation for image upload
  const uploadImageMutation = trpc.problems.uploadImage.useMutation({
    onSuccess: (data) => {
      setUploadedUrl(data.imageUrl);
      onImageUpload(data.imageUrl);
      toast.success("Image uploaded successfully!");
    },
    onError: (error) => {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
      setPreview(null);
    },
  });

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

    // Upload file using tRPC
    try {
      const base64 = await fileToBase64(file);
      await uploadImageMutation.mutateAsync({
        imageData: base64,
        mimetype: file.type,
        size: file.size,
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      setPreview(null);
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
    setUploadedUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (preview && uploadedUrl) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-foreground">Problem Image</label>
        <Card className="card-elegant p-4 relative overflow-hidden border border-green-200 bg-green-50/50">
          <div className="relative w-full h-48 bg-background rounded-lg overflow-hidden shadow-sm">
            <img
              src={preview}
              alt="Problem preview"
              className="w-full h-full object-cover"
            />
            {!isLoading && (
              <button
                onClick={clearPreview}
                className="absolute top-2 right-2 bg-white/90 text-destructive rounded-full p-1.5 hover:bg-white transition-all shadow-md hover:shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-white/90 px-3 py-1.5 rounded-full shadow-md">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">Uploaded</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (preview) {
    return (
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-foreground">Problem Image</label>
        <Card className="card-elegant p-4 relative overflow-hidden border border-amber-200 bg-amber-50/50">
          <div className="relative w-full h-48 bg-background rounded-lg overflow-hidden shadow-sm">
            <img
              src={preview}
              alt="Problem preview"
              className="w-full h-full object-cover"
            />
            {uploadImageMutation.isPending ? (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                  <span className="text-white text-sm font-medium">Uploading...</span>
                </div>
              </div>
            ) : (
              <button
                onClick={clearPreview}
                className="absolute top-2 right-2 bg-white/90 text-destructive rounded-full p-1.5 hover:bg-white transition-all shadow-md hover:shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-foreground">Problem Image (Optional)</label>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={uploadImageMutation.isPending || isLoading}
      />

      <Card
        className="card-elegant p-8 border-2 border-dashed border-border cursor-pointer transition-all hover:border-primary/60 hover:bg-primary/5 active:border-primary active:bg-primary/10"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploadImageMutation.isPending && fileInputRef.current?.click()}
      >
        <div className="flex flex-col items-center justify-center text-center">
          {uploadImageMutation.isPending ? (
            <>
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-3" />
              <p className="font-semibold text-foreground">Uploading image...</p>
              <p className="text-xs text-muted-foreground mt-1">Please wait</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3 transition-colors group-hover:bg-primary/20">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <p className="font-semibold text-foreground mb-1">Click to upload or drag and drop</p>
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
