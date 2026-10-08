import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { redirect } from "@/i18n/navigation";
import { Button } from "@/ui/button";

import { SignInForm, SignUpForm } from "./account-forms";
import { signOutAction } from "./actions";
import { getCurrentUser, requireUser } from "./current-user";

function AccountShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8 px-5 pt-12 sm:px-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-[-0.045em]">{title}</h1>
        {intro ? <p className="text-[1.0625rem] text-muted">{intro}</p> : null}
      </div>
      {children}
    </div>
  );
}

/** Someone already signed in has nothing to do on the sign-in and sign-up pages. */
async function redirectIfSignedIn(): Promise<void> {
  if (await getCurrentUser()) redirect({ href: "/compte", locale: await getLocale() });
}

export async function SignInPage() {
  await redirectIfSignedIn();
  const t = await getTranslations("account");
  return (
    <AccountShell title={t("signIn.title")} intro={t("signIn.intro")}>
      <SignInForm />
    </AccountShell>
  );
}

export async function SignUpPage() {
  await redirectIfSignedIn();
  const t = await getTranslations("account");
  return (
    <AccountShell title={t("signUp.title")} intro={t("signUp.intro")}>
      <SignUpForm />
    </AccountShell>
  );
}

/** Home of the account. Requires a session: the check is made here, next to the data shown. */
export async function AccountHomePage() {
  const user = await requireUser();
  const t = await getTranslations("account");
  return (
    <AccountShell title={t("home.title")} intro={t("home.greeting", { name: user.name })}>
      <dl className="flex flex-col gap-1 border-y border-line py-6 text-[1.0625rem]">
        <dt className="text-sm text-muted">{t("email")}</dt>
        <dd className="font-semibold">{user.email}</dd>
      </dl>
      <form action={signOutAction}>
        <Button type="submit" variant="outline">
          {t("signOut")}
        </Button>
      </form>
    </AccountShell>
  );
}
