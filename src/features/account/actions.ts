"use server";

import { headers } from "next/headers";
import { getLocale } from "next-intl/server";

import { signIn, signOut, signUp } from "@/data/auth";
import { redirect } from "@/i18n/navigation";

import { type AccountField, invalidFields, signInSchema, signUpSchema } from "./credentials";
import { safeNextPath } from "./profile-schemas";

/**
 * Account actions. They are public entry points: inputs are validated here, the answer
 * is a status and the values the form may show again, never the password.
 */

export type AccountFormState =
  | { status: "idle" }
  | { status: "invalid"; fields: AccountField[]; values: { name?: string; email?: string } }
  | { status: "email-taken"; values: { name?: string; email?: string } }
  | { status: "invalid-credentials"; values: { email?: string } }
  | { status: "locked"; minutes: number; values: { email?: string } }
  | { status: "rejected"; values: { name?: string; email?: string } };

const text = (value: FormDataEntryValue | null) => (typeof value === "string" ? value : "");

export async function signUpAction(
  _previous: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const raw = {
    name: text(formData.get("name")),
    email: text(formData.get("email")),
    password: text(formData.get("password")),
  };
  const values = { name: raw.name, email: raw.email };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "invalid", fields: invalidFields(parsed.error), values };
  }

  const result = await signUp(parsed.data, await headers());
  if (!result.ok) return { status: result.reason, values };

  return redirect({ href: "/compte", locale: await getLocale() });
}

export async function signInAction(
  _previous: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const raw = { email: text(formData.get("email")), password: text(formData.get("password")) };
  const values = { email: raw.email };

  const parsed = signInSchema.safeParse(raw);
  // A malformed e-mail or an empty password gets the same answer as wrong credentials.
  if (!parsed.success) return { status: "invalid-credentials", values };

  const result = await signIn(parsed.data, await headers());
  if (!result.ok) {
    return result.reason === "too-many-attempts"
      ? { status: "locked", minutes: Math.ceil(result.retryAfterSeconds / 60), values }
      : { status: "invalid-credentials", values };
  }

  // Back to the page the visitor wanted, if it is a page of this site.
  return redirect({ href: safeNextPath(formData.get("next")), locale: await getLocale() });
}

export async function signOutAction(): Promise<void> {
  await signOut(await headers());
  redirect({ href: "/", locale: await getLocale() });
}
