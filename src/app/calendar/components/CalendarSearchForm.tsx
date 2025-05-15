"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search } from "lucide-react";

interface CalendarSearchFormProps {
  initialQuery?: string;
}

export function CalendarSearchForm({ initialQuery = '' }: CalendarSearchFormProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    // Update query state if initialQuery changes (e.g. browser back/forward)
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    if (!query.trim()) {
      current.delete("query");
    } else {
      current.set("query", query.trim());
    }
    // Reset page if you have pagination
    // current.delete("page"); 

    const search = current.toString();
    const newUrl = `${pathname}${search ? `?${search}` : ""}`;
    router.push(newUrl);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full md:max-w-sm">
      <Input
        type="search"
        placeholder="Search releases (e.g., artist, album)..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-grow"
      />
      <Button type="submit" size="icon" aria-label="Search releases">
        <Search className="h-4 w-4" />
      </Button>
    </form>
  );
} 