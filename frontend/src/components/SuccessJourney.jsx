import React from "react";
import { useApp } from "@/context/AppContext";
import { Milestone, Sparkles } from "lucide-react";

/**
 * SuccessJourney — Timeline of real milestones added by the owner.
 * Renders NOTHING when no milestones have been added, so the site never
 * shows fabricated achievements.
 */
export default function SuccessJourney() {
  const { lang, content, t } = useApp();
  const items = (content?.success_journey || []).filter(Boolean);

  if (items.length === 0) return null;

  return (
    <section id="journey" className="py-20 lg:py-28 bg-white relative overflow-hidden">
      <div className="absolute top-0 -left-24 w-96 h-96 rounded-full bg-gold/10 blur-3xl -z-0" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-navy text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            {lang === "te" ? "మా ప్రయాణం" : "Our Journey"}
          </div>
          <h2 className="mt-4 font-display text-4xl lg:text-5xl font-bold text-navy tracking-tight leading-tight">
            {lang === "te" ? "మా విజయ ప్రయాణం" : "Milestones on our journey."}
          </h2>
          <div className="mt-4 mx-auto w-16 h-1 bg-gold rounded-full" />
        </div>

        <div className="relative">
          {/* vertical spine */}
          <div className="absolute left-4 sm:left-1/2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-gold/50 via-gold/25 to-transparent -translate-x-1/2" />

          <div className="space-y-10">
            {items.map((it, i) => {
              const isLeft = i % 2 === 0;
              return (
                <div
                  key={i}
                  data-testid={`journey-item-${i}`}
                  className={`relative flex items-start gap-6 sm:gap-10 ${isLeft ? "sm:flex-row" : "sm:flex-row-reverse"}`}
                >
                  {/* dot */}
                  <div className="absolute left-4 sm:left-1/2 top-3 -translate-x-1/2 w-4 h-4 rounded-full bg-gold border-4 border-white shadow-[0_0_0_3px_rgba(201,162,39,0.25)]" />

                  {/* card */}
                  <div className={`ml-12 sm:ml-0 sm:w-1/2 ${isLeft ? "sm:pr-12" : "sm:pl-12"}`}>
                    <div className="group relative bg-white rounded-2xl border border-slate-100 hover:border-gold/40 hover:shadow-lg transition-all p-5 sm:p-6">
                      {it.year && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-navy text-gold text-xs font-bold tracking-wider">
                          <Milestone className="w-3 h-3" /> {it.year}
                        </div>
                      )}
                      <h3 className="mt-3 font-display font-bold text-navy text-xl leading-tight">
                        {t(it.title, "")}
                      </h3>
                      {it.desc && (
                        <p className={`mt-2 text-slate-600 text-sm leading-relaxed ${lang === "te" ? "font-te" : ""}`}>
                          {t(it.desc, "")}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* spacer */}
                  <div className="hidden sm:block sm:w-1/2" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
