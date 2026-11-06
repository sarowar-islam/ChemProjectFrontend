import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function inlineUrl(url?: string): string {
  if (!url) return '';
  const lower = url.toLowerCase().split('?')[0];
  if (lower.endsWith('.docx') || lower.endsWith('.doc') || lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.pptx') || lower.endsWith('.ppt')) {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  }
  if (url.includes('cloudinary.com') && url.includes('/raw/upload/') && url.includes('fl_inline')) {
    return url.replace('/fl_inline/', '/');
  }
  return url;
}
