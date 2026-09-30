import { getTranslations } from "next-intl/server";

import { OpponentForm } from "@/components/opponents/opponent-form";

export default async function NewOpponentPage() {
  const t = await getTranslations("opponents");
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <h1 className="font-display text-2xl uppercase tracking-tight">
        {t("addOpponent")}
      </h1>
      <OpponentForm />
    </div>
  );
}
