import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { trpc } from '@/lib/trpc';
import { AlertCircle, X } from 'lucide-react';

export interface LanguageDetectionBannerProps {
  text: string;
  onLanguageDetected?: (language: string, confidence: number) => void;
  onDismiss?: () => void;
}

export function LanguageDetectionBanner({
  text,
  onLanguageDetected,
  onDismiss,
}: LanguageDetectionBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [textToDetect, setTextToDetect] = useState<string | null>(null);

  // Use query to detect language (detectLanguage is a query, not a mutation)
  const { data: detectionResult } = trpc.translation.detectLanguage.useQuery(
    textToDetect ? { text: textToDetect } : { text: '' },
    { enabled: !!textToDetect && textToDetect.length > 0 }
  );

  useEffect(() => {
    if (text && text.length > 10 && !textToDetect) {
      setTextToDetect(text);
    }
  }, [text, textToDetect]);

  useEffect(() => {
    if (detectionResult && detectionResult.language !== 'en') {
      setDetectedLanguage(detectionResult.language);
      setConfidence(detectionResult.confidence);
      onLanguageDetected?.(detectionResult.language, detectionResult.confidence);
    }
  }, [detectionResult, onLanguageDetected]);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed || !detectedLanguage || detectedLanguage === 'en') {
    return null;
  }

  const languageNames: Record<string, string> = {
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    ru: 'Russian',
    zh: 'Chinese',
    ja: 'Japanese',
    ko: 'Korean',
    ar: 'Arabic',
    hi: 'Hindi',
  };

  const languageName = languageNames[detectedLanguage] || detectedLanguage;

  return (
    <Alert className="bg-blue-50 border-blue-200">
      <AlertCircle className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800">
        <div className="flex items-center justify-between">
          <span>
            We detected <strong>{languageName}</strong> ({confidence}% confidence). 
            Your report will be automatically translated to English for city departments.
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="ml-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
