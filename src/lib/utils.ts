import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a placeholder image URL (e.g., from placekitten or a similar service, or a local static asset).
 * For a real app, you might use a more robust solution or a static local placeholder.
 */
export function placeholderImage(width: number, height: number): string {
  // Simple placeholder, replace with a better one for production
  return `https://via.placeholder.com/${width}x${height}.png?text=No+Image`;
} 