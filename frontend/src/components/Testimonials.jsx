import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import { Star, Quote } from "lucide-react";
import api from "@/lib/api";

export default function Testimonials() {
  const { lang, t } = useApp();
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get("/testimonials").then(r => setItems(r.data)).catch(() => setItems([]));
  }, []);

  if (!items.length) return null;

  return (
    <section id="testimonials" className="py-20 lg:py-28 bg-cream/40 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gold/10 blur-3xl -z-0" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="max-w-2xl">
          <div className="text-xs font-bold tracking-[0.2em] text-gold uppercase">
            {lang === "te" ? "మా విద్యార్థుల మాటలు" : "Student Voices"}
          </div>
          <h2 className="mt-3 font-display text-4xl lg:text-5xl font-bold text-navy tracking-tight">
            {lang === "te" ? "మా విద్యార్థులు చెప్తున్నారు" : "What our students say."}
          </h2>
          <div className="mt-4 w-16 h-1 bg-gold rounded-full" />
        </div>

        <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-2 gap-6">
          {items.map((it, i) => (
            <article
              key={it.id}
              data-testid={`testimonial-${i}`}
              className="group relative bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 hover:border-gold/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <Quote className="absolute top-5 right-5 w-8 h-8 text-gold/30" />

              <div className="flex items-center gap-4">
                {it.photo_url ? (
                  <img src={it.photo_url} alt={it.name} className="w-14 h-14 rounded-full object-cover border-2 border-gold/40" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-navy text-gold flex items-center justify-center font-display font-bold text-lg">
                    {it.name?.[0] || "S"}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-display font-bold text-navy text-lg leading-tight" data-testid={`testimonial-name-${i}`}>{it.name}</div>
                  <div className={`text-xs text-slate-500 mt-0.5 ${lang === "te" ? "font-te" : ""}`}>
                    {t(it.role)}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(n => (
                  <Star
                    key={n}
                    className={`w-4 h-4 ${n <= (it.rating || 5) ? "text-gold fill-gold" : "text-slate-200 fill-slate-200"}`}
                  />
                ))}
              </div>

              <p
                data-testid={`testimonial-msg-${i}`}
                className={`mt-4 text-slate-700 text-base leading-relaxed ${lang === "te" ? "font-te" : ""}`}
              >
                &ldquo;{t(it.message)}&rdquo;
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
