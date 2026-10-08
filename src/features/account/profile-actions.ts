"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getLocale } from "next-intl/server";

import { deleteAccount } from "@/data/auth";
import { renameMe, saveMyAddress } from "@/data/profile";
import { leaveCartBehind } from "@/features/cart/hand-over";
import { redirect } from "@/i18n/navigation";

import {
  type AddressField,
  addressSchema,
  invalidAddressFields,
  nameSchema,
} from "./profile-schemas";

/**
 * Profile actions. The customer is taken from the session inside the data layer: these
 * actions never receive, and never send, a user identifier.
 */

export type NameFormState =
  { status: "idle" } | { status: "saved" } | { status: "invalid"; value: string };

export type AddressFormState =
  | { status: "idle" }
  | { status: "saved" }
  | { status: "invalid"; fields: AddressField[]; values: Record<AddressField, string> };

export type DeleteAccountFormState =
  | { status: "idle" }
  | { status: "password-required" }
  | { status: "wrong-password" }
  | { status: "locked"; minutes: number };

const text = (value: FormDataEntryValue | null) => (typeof value === "string" ? value : "");

async function toSignIn(): Promise<never> {
  return redirect({ href: "/connexion?next=/compte", locale: await getLocale() });
}

export async function renameAction(
  _previous: NameFormState,
  formData: FormData,
): Promise<NameFormState> {
  const value = text(formData.get("name"));
  const parsed = nameSchema.safeParse({ name: value });
  if (!parsed.success) return { status: "invalid", value };

  const result = await renameMe(await headers(), parsed.data.name);
  if (!result.ok) return toSignIn();

  revalidatePath("/[locale]/compte", "page");
  return { status: "saved" };
}

export async function saveAddressAction(
  _previous: AddressFormState,
  formData: FormData,
): Promise<AddressFormState> {
  const values = {
    recipient: text(formData.get("recipient")),
    line1: text(formData.get("line1")),
    line2: text(formData.get("line2")),
    postalCode: text(formData.get("postalCode")),
    city: text(formData.get("city")),
  };
  const parsed = addressSchema.safeParse(values);
  if (!parsed.success) {
    return { status: "invalid", fields: invalidAddressFields(parsed.error), values };
  }

  const result = await saveMyAddress(await headers(), parsed.data);
  if (!result.ok) return toSignIn();

  revalidatePath("/[locale]/compte", "page");
  return { status: "saved" };
}

/** The password is the confirmation: it is checked in the data layer and never sent back. */
export async function deleteAccountAction(
  _previous: DeleteAccountFormState,
  formData: FormData,
): Promise<DeleteAccountFormState> {
  const password = text(formData.get("password"));
  if (password === "") return { status: "password-required" };

  const result = await deleteAccount(await headers(), password);
  if (!result.ok) {
    if (result.reason === "unauthenticated") return toSignIn();
    return result.reason === "too-many-attempts"
      ? { status: "locked", minutes: Math.ceil(result.retryAfterSeconds / 60) }
      : { status: "wrong-password" };
  }

  // The cart was deleted with the account: the device stops pointing at it.
  await leaveCartBehind();
  return redirect({ href: "/compte/supprime", locale: await getLocale() });
}
