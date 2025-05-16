'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useRouter, useSearchParams } from 'next/navigation';
// import { toast } from 'sonner'; // Temporarily commented out
import { LocalAlbumCard } from './components/LocalAlbumCard';
import { AddVinylItemForm } from './components/AddVinylItemForm';
import { EditVinylItemForm } from './components/EditVinylItemForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Matches the PaginatedVinylItemsResult from the backend service and Prisma VinylItem
interface VinylItemFromAPI {
  id: number;
  userId: string;
  discogs_id?: number | null;
  title: string;
  artist_main: string;
  artists_extra?: any | null; // Prisma Json?
  release_title?: string | null;
  year?: number | null;
  formats?: any | null; // Prisma Json?
  labels?: any | null; // Prisma Json?
  genres?: string[] | null;
  styles?: string[] | null;
  cover_url_small?: string | null;
  cover_url_large?: string | null;
  notes?: string | null;
  custom_tags?: string[] | null;
  added_at: string; // DateTime
  updated_at: string; // DateTime
  folder?: string | null; // Added folder
}

interface PaginatedCollectionResponse {
  data: VinylItemFromAPI[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ITEMS_PER_PAGE = 12; // Adjust as needed, good for a 3 or 4 column grid

function CollectionClientContent() {
  const { user, session } = useAuth();
  const [collectionItems, setCollectionItems] = useState<VinylItemFromAPI[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<VinylItemFromAPI | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter states
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('search') || '',
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get('status') || '',
  ); // ALL, OWNED, WISHLIST
  const [genreFilter, setGenreFilter] = useState(
    searchParams.get('genre') || '',
  );
  // Sort states
  const [sortBy, setSortBy] = useState(
    searchParams.get('sortBy') || 'added_at',
  );
  const [sortOrder, setSortOrder] = useState(
    searchParams.get('sortOrder') || 'desc',
  );
  // Tag filter state
  const [tagsFilter, setTagsFilter] = useState(searchParams.get('tags') || '');
  // Folder filter state
  const [folderFilter, setFolderFilter] = useState(
    searchParams.get('folder') || '',
  ); // Added folderFilter state

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchCollection = useCallback(
    async (
      page: number,
      currentSearch?: string,
      currentStatus?: string,
      currentGenre?: string,
      currentSortBy?: string,
      currentSortOrder?: string,
      currentTags?: string,
      currentFolder?: string,
    ) => {
      if (!user || !session?.access_token || !apiBaseUrl) {
        setError('User not authenticated or API configuration missing.');
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      queryParams.append('page', String(page));
      queryParams.append('limit', String(ITEMS_PER_PAGE));
      if (currentSearch) queryParams.append('search', currentSearch);
      if (currentStatus && currentStatus !== 'ALL')
        queryParams.append('status', currentStatus); // API expects OWNED or WISHLIST
      if (currentGenre) queryParams.append('genre', currentGenre);
      if (currentSortBy) queryParams.append('sortBy', currentSortBy);
      if (currentSortOrder) queryParams.append('sortOrder', currentSortOrder);
      if (currentTags) queryParams.append('tags', currentTags);
      if (currentFolder) queryParams.append('folder', currentFolder); // Added folder to queryParams

      // Update browser URL
      const newUrl = `/collection?${queryParams.toString()}`;
      router.replace(newUrl, { scroll: false });

      try {
        const response = await fetch(
          `${apiBaseUrl}/vinyl-items?${queryParams.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message ||
              `Failed to fetch collection: ${response.statusText}`,
          );
        }

        const result: PaginatedCollectionResponse = await response.json();
        setCollectionItems(result.data);
        setTotalPages(result.totalPages || 1); // Ensure totalPages is at least 1
        setCurrentPage(result.page);
      } catch (e: any) {
        console.error('Error fetching collection:', e);
        setError(e.message || 'An unexpected error occurred.');
        // toast.error(e.message || "Failed to load collection.");
      } finally {
        setIsLoading(false);
      }
    },
    [user, session, apiBaseUrl, router],
  );

  useEffect(() => {
    // Initialize currentPage from URL searchParams if available
    const pageFromUrl = Number(searchParams.get('page')) || 1;
    setCurrentPage(pageFromUrl);
    // Initial fetch based on URL params
    if (user) {
      fetchCollection(
        pageFromUrl,
        searchTerm,
        statusFilter,
        genreFilter,
        sortBy,
        sortOrder,
        tagsFilter,
        folderFilter,
      );
    } else {
      setIsLoading(false);
      setError('Please log in to view your collection.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, session, apiBaseUrl, router]); // Only re-run if user/session/apiBaseUrl changes; fetchCollection handles params

  const handleFilterChange = () => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
    fetchCollection(
      1,
      searchTerm,
      statusFilter,
      genreFilter,
      sortBy,
      sortOrder,
      tagsFilter,
      folderFilter,
    );
  };

  const handleTagFilterClick = (tag: string) => {
    setTagsFilter(tag);
    setCurrentPage(1);
    fetchCollection(
      1,
      searchTerm,
      statusFilter,
      genreFilter,
      sortBy,
      sortOrder,
      tag,
      folderFilter,
    );
  };

  const handleFolderFilterClick = (folder: string) => {
    setFolderFilter(folder);
    setCurrentPage(1);
    fetchCollection(
      1,
      searchTerm,
      statusFilter,
      genreFilter,
      sortBy,
      sortOrder,
      tagsFilter,
      folder,
    );
  };

  const handleItemAdded = () => {
    fetchCollection(
      1,
      searchTerm,
      statusFilter,
      genreFilter,
      sortBy,
      sortOrder,
      tagsFilter,
      folderFilter,
    );
    setShowAddForm(false);
  };

  const handleItemUpdated = () => {
    fetchCollection(
      currentPage,
      searchTerm,
      statusFilter,
      genreFilter,
      sortBy,
      sortOrder,
      tagsFilter,
      folderFilter,
    );
    setShowEditForm(false);
    setItemToEdit(null);
  };

  const handleEdit = (item: VinylItemFromAPI) => {
    setItemToEdit(item);
    setShowEditForm(true);
  };

  const handleDeleteConfirm = (itemId: number) => {
    setItemToDelete(itemId);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete || !session?.access_token || !apiBaseUrl) return;

    setIsLoading(true); // Indicate activity
    try {
      const response = await fetch(
        `${apiBaseUrl}/vinyl-items/${itemToDelete}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete item.');
      }
      // toast.success("Item deleted successfully!");
      fetchCollection(
        currentPage,
        searchTerm,
        statusFilter,
        genreFilter,
        sortBy,
        sortOrder,
        tagsFilter,
        folderFilter,
      ); // Refresh collection
    } catch (e: any) {
      console.error('Error deleting item:', e);
      // toast.error(e.message || "Failed to delete item.");
    } finally {
      setShowDeleteDialog(false);
      setItemToDelete(null);
      setIsLoading(false);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchCollection(
        nextPage,
        searchTerm,
        statusFilter,
        genreFilter,
        sortBy,
        sortOrder,
        tagsFilter,
        folderFilter,
      );
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      fetchCollection(
        prevPage,
        searchTerm,
        statusFilter,
        genreFilter,
        sortBy,
        sortOrder,
        tagsFilter,
        folderFilter,
      );
    }
  };

  if (isLoading && collectionItems.length === 0 && !error) {
    return (
      <div className="p-4 md:p-6 text-center">Loading your collection...</div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 text-center text-destructive">{error}</div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 md:p-6 text-center">
        <p>Please log in to manage your collection.</p>
        <Button asChild className="mt-4">
          <a href="/login">Login</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Collection</h1>
        <Button onClick={() => setShowAddForm(true)}>Add New Vinyl</Button>
      </div>

      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-lg bg-muted/40 items-end">
        <div className="md:col-span-2">
          <Label htmlFor="search-collection">Search</Label>
          <Input
            id="search-collection"
            placeholder="Search by title, artist..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFilterChange()}
          />
        </div>
        <div>
          <Label htmlFor="status-filter">Status</Label>
          <Select
            value={statusFilter}
            onValueChange={(value: string) =>
              setStatusFilter(value === 'ALL' ? '' : value)
            }
          >
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="OWNED">Owned</SelectItem>
              <SelectItem value="WISHLIST">Wishlist</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="genre-filter">Genre</Label>
          <Input
            id="genre-filter"
            placeholder="Filter by genre..."
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFilterChange()}
          />
        </div>
        <div>
          <Label htmlFor="tags-filter">Tags (comma-sep)</Label>
          <Input
            id="tags-filter"
            placeholder="Filter by tags..."
            value={tagsFilter}
            onChange={(e) => setTagsFilter(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFilterChange()}
          />
        </div>
        <div>
          <Label htmlFor="folder-filter">Folder</Label>
          <Input
            id="folder-filter"
            placeholder="Filter by folder..."
            value={folderFilter}
            onChange={(e) => setFolderFilter(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleFilterChange()}
          />
        </div>
        <div>
          <Label htmlFor="sort-by">Sort By</Label>
          <Select
            value={sortBy}
            onValueChange={(value: string) => setSortBy(value)}
          >
            <SelectTrigger id="sort-by">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="added_at">Date Added</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="artist_main">Artist</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="sort-order">Order</Label>
          <Select
            value={sortOrder}
            onValueChange={(value: string) => setSortOrder(value)}
          >
            <SelectTrigger id="sort-order">
              <SelectValue placeholder="Order..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-5 flex justify-end">
          <Button onClick={handleFilterChange}>Apply Filters & Sort</Button>
        </div>
      </div>

      {/* Forms will be rendered here, potentially in Dialogs */}
      {/* Ensure AddVinylItemForm is only mounted or its internal state reset when shown, 
          or pass isOpen to control the Dialog visibility directly within AddVinylItemForm */}
      <AddVinylItemForm
        isOpen={showAddForm} // Control Dialog visibility from parent
        accessToken={session?.access_token || ''}
        onFormSubmit={handleItemAdded}
        onCancel={() => setShowAddForm(false)}
      />
      {/* Ensure EditVinylItemForm is only mounted or its internal state reset when shown */}
      {itemToEdit && ( // Ensure itemToEdit is not null before rendering
        <EditVinylItemForm
          isOpen={showEditForm} // Control Dialog visibility from parent
          accessToken={session?.access_token || ''}
          item={itemToEdit} // itemToEdit is already guaranteed to be non-null here
          onFormSubmit={handleItemUpdated}
          onCancel={() => {
            setShowEditForm(false);
            setItemToEdit(null);
          }}
        />
      )}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              item from your collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isLoading}>
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {collectionItems.length === 0 && !isLoading && (
        <div className="text-center py-10">
          <p className="text-xl text-muted-foreground">
            Your collection is empty.
          </p>
          <p className="mt-2">Start by adding some vinyl records!</p>
        </div>
      )}

      {collectionItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {collectionItems.map((item) => (
            <LocalAlbumCard
              key={item.id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDeleteConfirm}
              onTagClick={handleTagFilterClick}
              onFolderClick={handleFolderFilterClick}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && collectionItems.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <Button
            onClick={handlePreviousPage}
            disabled={currentPage === 1 || isLoading}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            onClick={handleNextPage}
            disabled={currentPage === totalPages || isLoading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

// New default export for the page
export default function CollectionPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-4 text-center">Loading collection filters and data...</div>}>
      <CollectionClientContent />
    </Suspense>
  );
}
