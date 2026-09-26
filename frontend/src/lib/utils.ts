import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Human-readable message from an unknown thrown value (catch blocks). */
export function getErrorMessage(err: unknown, fallback = "Something went wrong. Please try again."): string {
  return err instanceof Error && err.message ? err.message : fallback;
}
