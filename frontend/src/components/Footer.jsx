import React from "react";
import { useApp } from "@/context/AppContext";
import { GraduationCap, MapPin, Phone, Mail, ArrowUp } from "lucide-react";

export default function Footer() {
  const { lang, content, t } = useApp();
  const c = content?.contact || {};
  return (
    <footer className="relative bg-navy text-white overflow-hidden">
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gold/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/10 border border-gold/40 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-gold" />
              </div>
              <div>
                <div className="font-display font-bold text-lg">{t(content?.academy_name, "NextGen Computer Academy")}</div>
                <div className="text-xs text-white/60 tracking-widest">LEARN · LEAD · GROW</div>
              </div>
            </div>
            <p className={`mt-5 max-w-md text-white/80 leading-relaxed ${lang === "te" ? "font-te" : ""}`}>
              {t(content?.tagline, "Learn Today. Lead Tomorrow.")}
            </p>
            <p className={`mt-3 max-w-md text-white/60 text-sm leading-relaxed ${lang === "te" ? "font-te" : ""}`}>
              {t(content?.welcome)}
            </p>
          </div>

          <div>
            <div className="font-display font-bold text-gold uppercase text-xs tracking-widest">
              {lang === "te" ? "త్వరిత లింక్‌లు" : "Quick Links"}
            </div>
            <ul className="mt-5 space-y-2.5 text-sm">
              {[
                { id: "home", en: "Home", te: "హోమ్" },
                { id: "courses", en: "Courses", te: "కోర్సులు" },
                { id: "admission", en: "Admission", te: "అడ్మిషన్" },
                { id: "gallery", en: "Gallery", te: "గ్యాలరీ" },
                { id: "contact", en: "Contact", te: "సంప్రదించండి" },
              ].map(n => (
                <li key={n.id}>
                  <a href={`#${n.id}`} className={`text-white/70 hover:text-gold transition-colors ${lang === "te" ? "font-te" : ""}`}>
                    {lang === "te" ? n.te : n.en}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-display font-bold text-gold uppercase text-xs tracking-widest">
              {lang === "te" ? "సంప్రదింపు" : "Reach Us"}
            </div>
            <ul className="mt-5 space-y-3 text-sm text-white/80">
              <li className="flex items-start gap-2"><Phone className="w-4 h-4 text-gold shrink-0 mt-0.5" /> {c.phone}</li>
              <li className="flex items-start gap-2"><Mail className="w-4 h-4 text-gold shrink-0 mt-0.5" /> <span className="break-all">{c.email}</span></li>
              <li className="flex items-start gap-2"><MapPin className="w-4 h-4 text-gold shrink-0 mt-0.5" /> <span className={lang === "te" ? "font-te" : ""}>{lang === "te" ? c.address_te : c.address_en}</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <p className="text-xs text-white/60">© {new Date().getFullYear()} NextGen Computer Academy. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <a href="/admin" data-testid="footer-admin-link" className="text-xs text-white/60 hover:text-gold">Admin</a>
            <button
              data-testid="footer-scroll-top"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-1 text-xs text-white/70 hover:text-gold"
            >
              {lang === "te" ? "పైకి" : "Back to top"} <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
