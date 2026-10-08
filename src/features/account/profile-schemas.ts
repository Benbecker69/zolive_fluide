import { z } from "zod";

/**
 * Validation of the profile forms. Only what a delivery needs is asked (requirement LEG-06):
 * no phone number, no date of birth. Delivery is limited to mainland France in this version,
 * hence the five-digit postal code.
 */

/** Empty or blank optional text becomes null instead of an empty string. */
const optionalLine = z
  .string()
  .trim()
  .max(120)
  .transform((value) => (value === "" ? null : value));

export const nameSchema = z.object({ name: z.string().trim().min(1).max(80) });

export const addressSchema = z.object({
  recipient: z.string().trim().min(1).max(80),
  line1: z.string().trim().min(1).max(120),
  line2: optionalLine,
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/),
  city: z.string().trim().min(1).max(80),
});

export type AddressField = keyof z.infer<typeof addressSchema>;

const ADDRESS_FIELDS: readonly string[] = ["recipient", "line1", "line2", "postalCode", "city"];

/** Names of the address fields that failed validation, for the form to mark them. */
export function invalidAddressFields(error: z.ZodError): AddressField[] {
  const fields = new Set<AddressField>();
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field === "string" && ADDRESS_FIELDS.includes(field)) {
      fields.add(field as AddressField);
    }
  }
  return [...fields];
}

/**
 * Where to go after signing in. The value comes from the URL, so it is untrusted: only a
 * path inside the site is accepted, which rules out redirecting a customer to another site.
 */
export function safeNextPath(value: unknown, fallback = "/compte"): string {
  if (typeof value !== "string") return fallback;
  return /^\/[a-z0-9]+(\/[a-z0-9-]+)*$/.test(value) ? value : fallback;
}
