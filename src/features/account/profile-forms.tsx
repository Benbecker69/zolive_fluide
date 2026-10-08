"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { Button } from "@/ui/button";
import { TextField } from "@/ui/text-field";

import {
  type AddressFormState,
  type DeleteAccountFormState,
  deleteAccountAction,
  type NameFormState,
  renameAction,
  saveAddressAction,
} from "./profile-actions";
import type { AddressField } from "./profile-schemas";

/** Confirmation shown after a save, announced without moving the focus. */
function Saved({ show, children }: { show: boolean; children: React.ReactNode }) {
  return (
    <p role="status" className="min-h-6 text-[0.9375rem] font-semibold">
      {show ? children : null}
    </p>
  );
}

export function NameForm({ name }: { name: string }) {
  const t = useTranslations("account");
  const [state, formAction, pending] = useActionState<NameFormState, FormData>(renameAction, {
    status: "idle",
  });

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <TextField
        label={t("name")}
        name="name"
        autoComplete="name"
        required
        maxLength={80}
        defaultValue={state.status === "invalid" ? state.value : name}
        error={state.status === "invalid" ? t("errors.name") : undefined}
      />
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" variant="outline" disabled={pending}>
          {t("profile.saveName")}
        </Button>
        <Saved show={state.status === "saved"}>{t("profile.saved")}</Saved>
      </div>
    </form>
  );
}

type Address = Record<AddressField, string>;

export function AddressForm({ address }: { address: Address }) {
  const t = useTranslations("account");
  const [state, formAction, pending] = useActionState<AddressFormState, FormData>(
    saveAddressAction,
    { status: "idle" },
  );

  const values = state.status === "invalid" ? state.values : address;
  const error = (field: AddressField) =>
    state.status === "invalid" && state.fields.includes(field)
      ? t(`errors.address.${field}`)
      : undefined;

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <TextField
        label={t("address.recipient")}
        name="recipient"
        autoComplete="shipping name"
        required
        maxLength={80}
        defaultValue={values.recipient}
        error={error("recipient")}
      />
      <TextField
        label={t("address.line1")}
        name="line1"
        autoComplete="shipping address-line1"
        required
        maxLength={120}
        defaultValue={values.line1}
        error={error("line1")}
      />
      <TextField
        label={t("address.line2")}
        name="line2"
        autoComplete="shipping address-line2"
        maxLength={120}
        defaultValue={values.line2}
        error={error("line2")}
      />
      <div className="grid gap-5 sm:grid-cols-[10rem_1fr]">
        <TextField
          label={t("address.postalCode")}
          name="postalCode"
          autoComplete="shipping postal-code"
          inputMode="numeric"
          required
          maxLength={5}
          defaultValue={values.postalCode}
          error={error("postalCode")}
        />
        <TextField
          label={t("address.city")}
          name="city"
          autoComplete="shipping address-level2"
          required
          maxLength={80}
          defaultValue={values.city}
          error={error("city")}
        />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" variant="outline" disabled={pending}>
          {t("address.save")}
        </Button>
        <Saved show={state.status === "saved"}>{t("address.saved")}</Saved>
      </div>
    </form>
  );
}

/** The password field is the confirmation step: nothing is deleted without it. */
export function DeleteAccountForm() {
  const t = useTranslations("account");
  const [state, formAction, pending] = useActionState<DeleteAccountFormState, FormData>(
    deleteAccountAction,
    { status: "idle" },
  );

  const error =
    state.status === "password-required"
      ? t("delete.errors.passwordRequired")
      : state.status === "wrong-password"
        ? t("delete.errors.wrongPassword")
        : state.status === "locked"
          ? t("errors.locked", { minutes: state.minutes })
          : undefined;

  return (
    <form action={formAction} noValidate className="flex flex-col gap-5">
      <TextField
        label={t("delete.password")}
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={error}
      />
      <div>
        <Button type="submit" variant="outline" disabled={pending}>
          {t("delete.submit")}
        </Button>
      </div>
    </form>
  );
}
