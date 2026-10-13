"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";

import { flipDigit } from "@/lib/motion";

export function DoctrineSection() {
  const t = useTranslations("home.doctrine");
  const reduced = useReducedMotion() ?? false;

  const items = [
    { num: t("item1Num"), title: t("item1Title"), body: t("item1Body"), color: "text-chalk" },
    { num: t("item2Num"), title: t("item2Title"), body: t("item2Body"), color: "text-[#94D4B0]" },
    { num: t("item3Num"), title: t("item3Title"), body: t("item3Body"), color: "text-touchline-red" },
  ];

  return (
    <section className="border-b border-hairline-08 px-4 py-16 md:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <div>
          <p className="text-label-tactical text-muted-foreground">{t("label")}</p>
          <h2 className="font-display text-headline-lg uppercase text-chalk">{t("title")}</h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <div key={item.num} className="flex flex-col gap-2">
              <motion.span
                className={`font-display text-4xl tabular-nums ${item.color}`}
                variants={flipDigit(reduced)}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                {item.num}
              </motion.span>
              <h3 className="font-display text-headline-sm uppercase text-chalk">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
