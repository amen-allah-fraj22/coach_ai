"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";

import { Chip } from "@/components/ui/chip";
import { paperDrop } from "@/lib/motion";

export function PhasesSection() {
  const t = useTranslations("home.phases");
  const reduced = useReducedMotion() ?? false;

  const cards = [
    {
      tag: t("prepareTag"),
      title: t("prepareTitle"),
      body: (
        <ul className="flex flex-col gap-2 text-sm">
          {[t("prepareItem1"), t("prepareItem2"), t("prepareItem3")].map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-0.5 size-3 shrink-0 border border-hairline-24" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      ),
    },
    {
      tag: t("reviewTag"),
      title: t("reviewTitle"),
      body: (
        <div className="flex flex-col gap-3">
          <div className="flex items-end gap-1" aria-hidden>
            {[40, 60, 50, 80, 65, 90, 55].map((h, i) => (
              <span
                key={i}
                className={i === 5 ? "w-4 bg-touchline-red" : "w-4 bg-pitch-green"}
                style={{ height: h }}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">{t("reviewStat")}</p>
        </div>
      ),
    },
    {
      tag: t("askTag"),
      title: t("askTitle"),
      body: (
        <div className="flex flex-col gap-3 text-sm">
          <p className="italic text-muted-foreground">{t("askQuote")}</p>
          <p className="border-s-2 border-pitch-green ps-3">{t("askRecommendation")}</p>
          <p className="text-xs text-muted-foreground">{t("askFooter")}</p>
        </div>
      ),
    },
  ];

  return (
    <section id="how-it-works" className="scroll-mt-20 border-b border-hairline-08 px-4 py-16 md:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-label-tactical text-muted-foreground">{t("label")}</p>
            <h2 className="font-display text-headline-lg uppercase text-chalk">{t("title")}</h2>
          </div>
          <p className="max-w-sm text-sm text-muted-foreground">{t("intro")}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              id={i === 2 ? "ai-coach" : undefined}
              variants={paperDrop({ rotate: i === 1 ? 1 : -1, index: i }, reduced)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.3 }}
              className="text-night-pitch scroll-mt-20"
            >
              <div className="border border-hairline-08 bg-chalk p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Chip className="border-night-pitch/20 bg-transparent text-night-pitch">
                    {card.tag}
                  </Chip>
                </div>
                <h3 className="mb-3 font-display text-headline-sm uppercase">{card.title}</h3>
                {card.body}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
