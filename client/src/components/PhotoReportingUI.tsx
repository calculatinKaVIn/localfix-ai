import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/spinner';
import { trpc } from '@/lib/trpc';
import { Camera, Upload, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export interface PhotoReportingUIProps {
  onAnalysisComplete?: (analysis: any) => void;
  onImageUpload?: (imageUrl: string) => void;
}

export function PhotoReportingUI({ onAnalysisComplete, onImageUpload }: PhotoReportingUIProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: uploadAndAnalyze } = trpc.photoReporting.uploadAndAnalyzeImage.useMutation({
    onSuccess: (result: any) => {
      setIsAnalyzing(false);
      if (result.success) {
        setAnalysisResult(result);
        if (onAnalysisComplete) onAnalysisComplete(result);
        if (onImageUpload) onImageUpload(result.imageUrl);
        toast.success('Image analyzed successfully!');
      } else {
        toast.error(result.error || 'Failed to analyze image');
      }
    },
    onError: (error) => {
      setIsAnalyzing(false);
      toast.error('Failed to analyze image');
      console.error('Analysis error:', error);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyzeImage = async () => {
    if (!selectedFile || !preview) {
      toast.error('Please select an image first');
      return;
    }

    setIsAnalyzing(true);

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string)?.split(',')[1] || '';
      if (base64) {
        uploadAndAnalyze({
          imageData: base64,
          mimetype: selectedFile.type,
          size: selectedFile.size,
          filename: selectedFile.name,
        });
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleCameraCapture = () => {
    fileInputRef.current?.click();
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreview(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Photo Reporting
          </CardTitle>
          <CardDescription>
            Upload a photo of the issue and let AI analyze it automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Preview or Upload Area */}
          {!preview ? (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
              onClick={handleCameraCapture}>
              <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="font-medium">Click to upload or drag and drop</p>
              <p className="text-sm text-muted-foreground">PNG, JPG, WebP or GIF (max 10MB)</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Image Preview */}
              <div className="relative rounded-lg overflow-hidden bg-muted">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-64 object-cover"
                />
              </div>

              {/* Analysis Result */}
              {analysisResult && (
                <div className="space-y-3">
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Analysis complete! AI detected: <strong>{analysisResult.classification}</strong>
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-muted p-2 rounded">
                      <p className="text-muted-foreground">Severity</p>
                      <p className="font-semibold capitalize">{analysisResult.analysis.severity}</p>
                    </div>
                    <div className="bg-muted p-2 rounded">
                      <p className="text-muted-foreground">Confidence</p>
                      <p className="font-semibold">{analysisResult.analysis.confidence}%</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded p-3">
                    <p className="text-sm font-medium text-blue-900 mb-2">AI Description:</p>
                    <p className="text-sm text-blue-800 whitespace-pre-wrap">
                      {analysisResult.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {!analysisResult ? (
                  <>
                    <Button
                      onClick={handleAnalyzeImage}
                      disabled={isAnalyzing}
                      className="flex-1"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        'Analyze Image'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={resetForm}
                    >
                      Change Image
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      onClick={resetForm}
                      className="flex-1"
                    >
                      Upload Another
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        // This would be used to proceed to submit form
                        if (onAnalysisComplete) onAnalysisComplete(analysisResult);
                      }}
                    >
                      Use This Analysis
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Info Box */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Upload a clear photo of the issue. AI will automatically detect the problem type,
              severity, and generate a detailed report for city departments.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
