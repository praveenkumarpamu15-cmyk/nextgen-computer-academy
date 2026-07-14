import React from "react";
import { useApp } from "@/context/AppContext";
import { Award, Quote, CheckCircle2, Sparkles } from "lucide-react";

export default function Trainer() {
  const { lang, content, t } = useApp();
  const tr = content?.trainer || {};
  const quals = tr.qualifications || [];

  return (
    <section id="trainer" className="py-20 lg:py-28 bg-white relative overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gold/10 blur-3xl -z-0" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-navy/5 blur-3xl -z-0" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="text-center max-w-2xl mx-auto mb-12 lg:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-navy text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            {lang === "te" ? "మా ట్రైనర్‌ని కలవండి" : "Meet Your Trainer"}
          </div>
          <h2 className="mt-4 font-display text-4xl lg:text-5xl font-bold text-navy tracking-tight leading-tight">
            {lang === "te" ? "మీ విజయం వెనుక ఉన్న గురువు" : "The mentor behind your success."}
          </h2>
          <div className="mt-4 mx-auto w-16 h-1 bg-gold rounded-full" />
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Photo column */}
          <div className="lg:col-span-5">
            <div className="relative">
              <div className="absolute -top-5 -left-5 w-32 h-32 rounded-2xl bg-gold/25 -z-10" />
              <div className="absolute -bottom-5 -right-5 w-40 h-40 rounded-2xl bg-navy/10 -z-10" />
              <div className="zoom-wrap rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <img
                  data-testid="trainer-photo"
                  src={tr.photo_url}
                  alt={t(tr.name)}
                  className="w-full h-[420px] sm:h-[520px] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 left-4 sm:left-8 right-4 sm:right-auto glass rounded-2xl px-4 py-3 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5 text-navy" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-display font-bold text-navy text-base leading-tight" data-testid="trainer-name">
                      {t(tr.name)}
                    </div>
                    <div className={`text-xs text-slate-500 font-medium mt-0.5 ${lang === "te" ? "font-te" : ""}`}>
                      {t(tr.title)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content column */}
          <div className="lg:col-span-7">
            <div className="text-xs font-bold tracking-[0.2em] text-gold uppercase">
              {t(tr.title)}
            </div>
            <h3 className="mt-2 font-display text-3xl lg:text-4xl font-bold text-navy tracking-tight">
              {t(tr.name)}
            </h3>

            <p
              data-testid="trainer-bio"
              className={`mt-5 text-slate-600 text-base sm:text-lg leading-relaxed ${lang === "te" ? "font-te" : ""}`}
            >
              {t(tr.bio)}
            </p>

            {/* Qualifications */}
            <div className="mt-8">
              <div className="text-xs font-bold tracking-[0.2em] text-navy/60 uppercase mb-3">
                {lang === "te" ? "అర్హతలు & నైపుణ్యాలు" : "Qualifications & Expertise"}
              </div>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {quals.map((q, i) => (
                  <div
                    key={i}
                    data-testid={`trainer-qual-${i}`}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-cream border border-gold/20 hover:border-gold/50 transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                    <span className={`text-sm text-navy font-medium leading-snug ${lang === "te" ? "font-te" : ""}`}>
                      {t(q)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mission */}
            <div className="mt-8 relative rounded-2xl bg-navy text-white p-6 sm:p-7 grain overflow-hidden">
              <Quote className="absolute top-4 right-5 w-10 h-10 text-gold/30" />
              <div className="text-[10px] font-bold tracking-[0.25em] text-gold uppercase">
                {lang === "te" ? "నా లక్ష్యం" : "My Mission"}
              </div>
              <p
                data-testid="trainer-mission"
                className={`mt-3 text-white/95 text-base sm:text-lg leading-relaxed relative ${lang === "te" ? "font-te" : ""}`}
              >
                {t(tr.mission)}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <div className="w-8 h-0.5 bg-gold rounded-full" />
                <span className="text-xs text-gold font-semibold tracking-wider">
                  — {t(tr.name)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
