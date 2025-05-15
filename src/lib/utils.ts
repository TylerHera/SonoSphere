import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const placeholderImage = (
  width: number,
  height: number,
  text: string = 'No Image',
) => {
  return `https://via.placeholder.com/${width}x${height}.png?text=${encodeURIComponent(text)}`;
};
