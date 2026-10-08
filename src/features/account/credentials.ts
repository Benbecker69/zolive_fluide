import { z } from "zod";

import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/lib/password-policy";

/**
 * Validation of the account forms. Password rule (requirement SEC-05): at least twelve
 * characters and no forced mix of character types or periodic renewal, as recommended
 * by the CNIL when attempts are limited. Length is what is asked of the visitor.
 */

const email = z.string().trim().toLowerCase().pipe(z.email().max(254));

export const signUpSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email,
  password: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
});

/** Sign-in never explains what is wrong with a password: any non-empty value is checked. */
export const signInSchema = z.object({
  email,
  password: z.string().min(1).max(PASSWORD_MAX_LENGTH),
});

export type AccountField = "name" | "email" | "password";

/** Names of the fields that failed validation, for the form to mark them. */
export function invalidFields(error: z.ZodError): AccountField[] {
  const fields = new Set<AccountField>();
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (field === "name" || field === "email" || field === "password") fields.add(field);
  }
  return [...fields];
}
