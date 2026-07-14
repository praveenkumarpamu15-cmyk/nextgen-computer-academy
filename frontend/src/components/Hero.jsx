import React from "react";
import { ArrowRight, Sparkles, PlayCircle, Users, Star, Award } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function Hero() {
  const { lang, content, t } = useApp();
  const heroImg = content?.hero_image_url || "https://images.pexels.com/photos/5530447/pexels-photo-5530447.jpeg";

  const jump = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="home" className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden">
      {/* background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 -right-24 w-[520px] h-[520px] rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 w-[520px] h-[520px] rounded-full bg-navy/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-navy text-xs font-semibold tracking-wide mb-6">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            {lang === "te" ? "కొత్త బ్యాచ్‌లు ప్రారంభమయ్యాయి" : "New Batches Now Open"}
          </div>

          <h1 className="font-display font-bold tracking-tight text-navy text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
            {t(content?.academy_name, "NextGen Computer Academy")}
          </h1>

          <p className={`mt-5 text-2xl sm:text-3xl font-display font-medium text-navy/90 ${lang === "te" ? "font-te text-xl sm:text-2xl" : ""}`}>
            <span className="relative">
              {t(content?.tagline, "Learn Today. Lead Tomorrow.")}
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-gold/60 rounded-full" />
            </span>
          </p>

          <p className={`mt-6 max-w-2xl text-slate-600 text-base sm:text-lg leading-relaxed ${lang === "te" ? "font-te" : ""}`}>
            {t(content?.welcome)}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              data-testid="hero-cta-courses"
              onClick={() => jump("courses")}
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-navy text-white font-semibold hover:bg-gold hover:text-black transition-all hover:scale-[1.02] shadow-lg shadow-navy/20"
            >
              {lang === "te" ? "కోర్సులు చూడండి" : "Explore Courses"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              data-testid="hero-cta-admission"
              onClick={() => jump("admission")}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gold text-black font-semibold hover:bg-navy hover:text-white transition-all hover:scale-[1.02] shadow-lg shadow-gold/20"
            >
              {lang === "te" ? "ఆన్‌లైన్ అడ్మిషన్" : "Online Admission"}
            </button>
            <button
              data-testid="hero-cta-contact"
              onClick={() => jump("contact")}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border-2 border-navy/15 text-navy font-semibold hover:border-gold hover:text-gold transition-all"
            >
              {lang === "te" ? "సంప్రదించండి" : "Contact Us"}
            </button>
          </div>

          {content?.stats?.length > 0 && (
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-xl">
              {content.stats.slice(0, 3).map((s, i) => (
                <div key={i} data-testid={`hero-stat-${i}`} className="glass rounded-xl px-3 py-3 sm:px-4 sm:py-4">
                  <div className="w-2 h-2 rounded-full bg-gold mb-2" />
                  <div className="font-display font-bold text-navy text-xl sm:text-2xl">{s.value}</div>
                  <div className={`text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-tight ${lang === "te" ? "font-te" : ""}`}>
                    {(s.label && (s.label[lang] || s.label.en)) || ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 relative animate-fade-up" style={{ animationDelay: "0.15s" }}>
          <div className="relative">
            <div className="absolute -top-6 -left-6 w-32 h-32 rounded-2xl bg-gold/30 -z-10" />
            <div className="absolute -bottom-6 -right-6 w-40 h-40 rounded-2xl bg-navy/10 -z-10" />
            <div className="zoom-wrap rounded-3xl overflow-hidden shadow-2xl border border-white/60">
              <img
                src={heroImg}
                alt="Students learning"
                className="w-full h-[420px] sm:h-[500px] object-cover"
                data-testid="hero-image"
              />
            </div>

            <div className="absolute -bottom-6 left-4 sm:left-8 glass rounded-2xl px-4 py-3 animate-float">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center">
                  <PlayCircle className="w-5 h-5 text-navy" />
                </div>
                <div>
                  <div className={`text-xs text-slate-500 font-medium ${lang === "te" ? "font-te" : ""}`}>
                    {lang === "te" ? "లైవ్ డెమో క్లాస్" : "Live Demo Class"}
                  </div>
                  <div className="text-sm font-semibold text-navy">
                    {lang === "te" ? "ఉచితం · ఈరోజే" : "Free · Today"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
