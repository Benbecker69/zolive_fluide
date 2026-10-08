"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { Link } from "@/i18n/navigation";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "@/lib/password-policy";
import { Button } from "@/ui/button";
import { TextField } from "@/ui/text-field";

import { type AccountFormState, signInAction, signUpAction } from "./actions";

const idle: AccountFormState = { status: "idle" };

/** Message shown above a form when the server refused it. It receives the focus of screen readers. */
function FormAlert({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="rounded-3xl bg-tint-peach px-5 py-4 font-semibold">
      {children}
    </p>
  );
}

export function SignUpForm() {
  const t = useTranslations("account");
  const [state, formAction, pending] = useActionState(signUpAction, idle);

  const invalid = state.status === "invalid" ? state.fields : [];
  const values: { name?: string; email?: string } = state.status === "idle" ? {} : state.values;

  return (
    <form action={formAction} noValidate className="flex flex-col gap-6">
      {state.status === "email-taken" ? <FormAlert>{t("errors.emailTaken")}</FormAlert> : null}
      {state.status === "rejected" ? <FormAlert>{t("errors.rejected")}</FormAlert> : null}

      <TextField
        label={t("name")}
        name="name"
        autoComplete="name"
        required
        maxLength={80}
        defaultValue={values.name}
        error={invalid.includes("name") ? t("errors.name") : undefined}
      />
      <TextField
        label={t("email")}
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={values.email}
        error={invalid.includes("email") ? t("errors.email") : undefined}
      />
      <TextField
        label={t("password")}
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={PASSWORD_MIN_LENGTH}
        maxLength={PASSWORD_MAX_LENGTH}
        hint={t("passwordHint", { min: PASSWORD_MIN_LENGTH })}
        error={
          invalid.includes("password")
            ? t("errors.password", { min: PASSWORD_MIN_LENGTH })
            : undefined
        }
      />

      <Button type="submit" disabled={pending}>
        {t("signUp.submit")}
      </Button>
      <p className="text-[0.9375rem] text-muted">
        {t.rich("signUp.haveAccount", {
          link: (chunks) => (
            <Link href="/connexion" className="font-semibold text-ink underline underline-offset-4">
              {chunks}
            </Link>
          ),
        })}
      </p>
    </form>
  );
}

export function SignInForm() {
  const t = useTranslations("account");
  const [state, formAction, pending] = useActionState(signInAction, idle);

  const values =
    state.status === "invalid-credentials" || state.status === "locked" ? state.values : {};

  return (
    <form action={formAction} noValidate className="flex flex-col gap-6">
      {state.status === "invalid-credentials" ? (
        <FormAlert>{t("errors.invalidCredentials")}</FormAlert>
      ) : null}
      {state.status === "locked" ? (
        <FormAlert>{t("errors.locked", { minutes: state.minutes })}</FormAlert>
      ) : null}

      <TextField
        label={t("email")}
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={values.email}
      />
      <TextField
        label={t("password")}
        name="password"
        type="password"
        autoComplete="current-password"
        required
        maxLength={PASSWORD_MAX_LENGTH}
      />

      <Button type="submit" disabled={pending}>
        {t("signIn.submit")}
      </Button>
      <p className="text-[0.9375rem] text-muted">
        {t.rich("signIn.noAccount", {
          link: (chunks) => (
            <Link
              href="/inscription"
              className="font-semibold text-ink underline underline-offset-4"
            >
              {chunks}
            </Link>
          ),
        })}
      </p>
    </form>
  );
}
