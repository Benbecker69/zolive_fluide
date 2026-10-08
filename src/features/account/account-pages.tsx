import { getLocale, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { redirect } from "@/i18n/navigation";
import { Button } from "@/ui/button";

import { SignInForm, SignUpForm } from "./account-forms";
import { signOutAction } from "./actions";
import { getCurrentUser, getProfile } from "./current-user";
import { AddressForm, NameForm } from "./profile-forms";
import { safeNextPath } from "./profile-schemas";

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

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-5 border-t border-line pt-8">
      <h2 id={id} className="text-3xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Someone already signed in has nothing to do on the sign-in and sign-up pages. */
async function redirectIfSignedIn(next: string): Promise<void> {
  if (await getCurrentUser()) redirect({ href: next, locale: await getLocale() });
}

type RawParams = Record<string, string | string[] | undefined>;

export async function SignInPage({ searchParams }: { searchParams: RawParams }) {
  const next = safeNextPath(searchParams.next);
  await redirectIfSignedIn(next);
  const t = await getTranslations("account");
  return (
    <AccountShell title={t("signIn.title")} intro={t("signIn.intro")}>
      <SignInForm next={next} />
    </AccountShell>
  );
}

export async function SignUpPage() {
  await redirectIfSignedIn("/compte");
  const t = await getTranslations("account");
  return (
    <AccountShell title={t("signUp.title")} intro={t("signUp.intro")}>
      <SignUpForm />
    </AccountShell>
  );
}

/**
 * Home of the account. The profile is read from the session inside the data layer:
 * without a session there is nothing to show, and the visitor is sent to sign in,
 * then brought back here.
 */
export async function AccountHomePage() {
  const profile = await getProfile();
  if (!profile) return redirect({ href: "/connexion?next=/compte", locale: await getLocale() });

  const t = await getTranslations("account");
  const address = profile.address;

  return (
    <AccountShell title={t("home.title")} intro={t("home.greeting", { name: profile.name })}>
      <Section id="details-title" title={t("profile.title")}>
        <NameForm name={profile.name} />
        <dl className="flex flex-col gap-1 text-[1.0625rem]">
          <dt className="text-sm text-muted">{t("email")}</dt>
          <dd className="font-semibold">{profile.email}</dd>
        </dl>
      </Section>

      <Section id="address-title" title={t("address.title")}>
        <p className="text-[0.9375rem] text-muted">{t("address.intro")}</p>
        <AddressForm
          address={{
            recipient: address?.recipient ?? profile.name,
            line1: address?.line1 ?? "",
            line2: address?.line2 ?? "",
            postalCode: address?.postalCode ?? "",
            city: address?.city ?? "",
          }}
        />
      </Section>

      <Section id="session-title" title={t("session.title")}>
        <form action={signOutAction}>
          <Button type="submit" variant="outline">
            {t("signOut")}
          </Button>
        </form>
      </Section>
    </AccountShell>
  );
}
