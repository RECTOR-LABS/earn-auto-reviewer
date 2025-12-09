'use client';

import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

export function UrlInput({ onSubmit, isLoading }: UrlInputProps) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-2xl">
      <Input
        type="url"
        placeholder="Paste GitHub URL (PR or repository)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={isLoading}
        className="flex-1"
      />
      <Button type="submit" disabled={isLoading || !url.trim()}>
        {isLoading ? 'Reviewing...' : 'Review'}
      </Button>
    </form>
  );
}
