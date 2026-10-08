import { getTranslations } from "next-intl/server";

import { ButtonLink } from "@/ui/button";

export default async function NotFound() {
  const t = await getTranslations("notFound");

  return (
    <div className="mx-auto flex max-w-page flex-col items-start gap-6 px-5 py-24 sm:px-8 lg:px-12">
      <h1 className="text-5xl">{t("title")}</h1>
      <p className="text-muted">{t("description")}</p>
      <ButtonLink href="/" variant="outline">
        {t("backHome")}
      </ButtonLink>
    </div>
  );
}
