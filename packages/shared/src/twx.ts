import { clsx, twMerge, type ClassValue } from "cnfast";

export function twx(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}
