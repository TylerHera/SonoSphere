'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function CollectionSearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '');

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm.trim()) {
      params.set('query', searchTerm.trim());
    } else {
      params.delete('query');
    }
    params.set('page', '1'); // Reset to page 1 on new search
    router.push(`/collection?${params.toString()}`);
  };

  useEffect(() => {
    // Optional: Sync searchTerm state if URL query param changes externally
    setSearchTerm(searchParams.get('query') || '');
  }, [searchParams]);

  return (
    <form onSubmit={handleSearch} className="flex items-center space-x-2 mb-6">
      <Input
        type="search"
        placeholder="Search Discogs for releases..."
        value={searchTerm}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        className="flex-grow"
      />
      <Button type="submit">Search</Button>
    </form>
  );
} 