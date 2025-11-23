//export const API_URL = "https://ifroutesbackend.onrender.com/api";
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://ifroutesbackend.onrender.com/api";
export const AIRPORT_ID = "LLBG";
export type PracticeMode = "FULL" | "NO_ALT" | "NO_FIX" | "CLEAN";
