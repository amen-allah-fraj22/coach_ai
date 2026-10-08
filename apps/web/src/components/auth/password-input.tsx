"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";

export function PasswordInput({
  id,
  name,
  autoComplete,
  required,
}: {
  id: string;
  name: string;
  autoComplete?: string;
  required?: boolean;
}) {
  const t = useTranslations("auth");
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        required={required}
        className="pe-10"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 end-2 flex items-center text-muted-foreground hover:text-chalk"
      >
        <Icon
          name={visible ? "visibility_off" : "visibility"}
          size={18}
          label={visible ? t("hidePassword") : t("showPassword")}
        />
      </button>
    </div>
  );
}
