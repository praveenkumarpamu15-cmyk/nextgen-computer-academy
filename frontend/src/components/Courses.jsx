import React from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { ArrowUpRight, Clock, IndianRupee } from "lucide-react";

export default function Courses() {
  const { lang, courses } = useApp();

  return (
    <section id="courses" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="text-xs font-bold tracking-[0.2em] text-gold uppercase">
              {lang === "te" ? "మా కోర్సులు" : "Our Courses"}
            </div>
            <h2 className="mt-3 font-display text-4xl lg:text-5xl font-bold text-navy tracking-tight">
              {lang === "te" ? "మీ కెరీర్‌కు సరిపడే కోర్సులు." : "Practical courses for real careers."}
            </h2>
            <div className="mt-4 w-16 h-1 bg-gold rounded-full" />
          </div>
          <p className={`text-slate-500 max-w-md ${lang === "te" ? "font-te" : ""}`}>
            {lang === "te"
              ? "ప్రతి కోర్సులో ప్రాక్టికల్ ట్రైనింగ్, చిన్న బ్యాచ్‌లు, వ్యక్తిగత శ్రద్ధ."
              : "Every course includes hands-on practice, small batches and personal attention."}
          </p>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((c, i) => (
            <Link
              to={`/course/${c.slug || c.id}`}
              key={c.id}
              data-testid={`course-card-${i}`}
              className="group relative bg-white rounded-3xl overflow-hidden border border-slate-100 hover:border-gold/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div className="zoom-wrap relative h-44">
                <img src={c.image_url} alt={c.title_en} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gold text-black text-[11px] font-bold tracking-wide">
                    <IndianRupee className="w-3 h-3" strokeWidth={2.5} /> {c.fee?.replace(/^₹/, "") || "—"}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 text-navy text-[11px] font-semibold">
                    <Clock className="w-3 h-3" /> {c.duration || "—"}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-display text-xl font-bold text-navy leading-tight">{c.title_en}</h3>
                <p className="font-te text-navy/80 text-base leading-snug mt-1" lang="te">{c.title_te}</p>
                <p className="mt-3 text-slate-600 text-sm leading-relaxed">{c.desc_en}</p>
                <p className="mt-2 font-te text-slate-600 text-sm leading-relaxed" lang="te">{c.desc_te}</p>
                <span
                  data-testid={`course-detail-link-${i}`}
                  className="mt-5 inline-flex items-center gap-1.5 text-navy font-semibold text-sm group-hover:text-gold self-start"
                >
                  {lang === "te" ? "వివరాలు చూడండి" : "View Details"}
                  <ArrowUpRight className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
