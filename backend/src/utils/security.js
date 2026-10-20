import { z } from "zod";

// bcrypt only processes the first 72 UTF-8 bytes. Enforce the byte limit so
// different long passwords cannot silently hash to the same value.
export const passwordSchema = z.string()
  .min(12, "Password must be at least 12 characters")
  .max(72, "Password must be 72 characters or fewer")
  .refine(value => Buffer.byteLength(value, "utf8") <= 72, "Password must be 72 UTF-8 bytes or fewer");
