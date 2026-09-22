import { twMerge } from 'tailwind-merge';

type ClassValue = string | false | null | undefined;

/** Join class names, letting later Tailwind classes override earlier conflicting ones. */
export function cn(...classes: ClassValue[]) {
  return twMerge(classes.filter(Boolean).join(' '));
}
