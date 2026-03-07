import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { trpc } from '@/lib/trpc';
import { Globe } from 'lucide-react';

export interface LanguageSelectorProps {
  onLanguageChange?: (languageCode: string) => void;
  defaultLanguage?: string;
  showLabel?: boolean;
  compact?: boolean;
}

export function LanguageSelector({
  onLanguageChange,
  defaultLanguage = 'en',
  showLabel = true,
  compact = false,
}: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState(defaultLanguage);
  const { data: languages, isLoading } = trpc.translation.getSupportedLanguages.useQuery();

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    onLanguageChange?.(value);
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading languages...</div>;
  }

  if (compact) {
    return (
      <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[120px]">
          <Globe className="w-4 h-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages?.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {showLabel && (
        <label className="text-sm font-medium text-foreground flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Select Language
        </label>
      )}
      <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages?.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
