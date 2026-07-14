import React, { useEffect, useState } from "react";
import { Menu, X, GraduationCap, Languages } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";

const NAV = [
  { id: "home", en: "Home", te: "హోమ్" },
  { id: "about", en: "About", te: "మా గురించి" },
  { id: "courses", en: "Courses", te: "కోర్సులు" },
  { id: "trainer", en: "Trainer", te: "ట్రైనర్" },
  { id: "demo", en: "Free Demo", te: "ఉచిత డెమో" },
  { id: "why", en: "Why Us", te: "ఎందుకు మేము" },
  { id: "vision", en: "Vision", te: "లక్ష్యం" },
  { id: "journey", en: "Journey", te: "ప్రయాణం" },
  { id: "testimonials", en: "Reviews", te: "సమీక్షలు" },
  { id: "gallery", en: "Gallery", te: "గ్యాలరీ" },
  { id: "admission", en: "Admission", te: "అడ్మిషన్" },
  { id: "contact", en: "Contact", te: "సంప్రదించండి" },
];

export default function Navbar() {
  const { lang, toggleLang, content, t } = useApp();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hasTestimonials, setHasTestimonials] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", on);
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/testimonials`)
      .then(r => r.json())
      .then(d => setHasTestimonials(Array.isArray(d) && d.length > 0))
      .catch(() => setHasTestimonials(false));
  }, []);

  const hasJourney = (content?.success_journey || []).length > 0;

  const navItems = NAV.filter(n => {
    if (n.id === "journey") return hasJourney;
    if (n.id === "testimonials") return hasTestimonials;
    return true;
  });

  const jump = (id) => {
    setOpen(false);
    if (location.pathname !== "/") {
      navigate(`/#${id}`);
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header
      data-testid="site-navbar"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? "py-2" : "py-4"}`}
    >
      <div className={`mx-3 sm:mx-6 lg:mx-10 rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between ${scrolled ? "glass" : "bg-white/60 backdrop-blur-md border border-white/70"}`}>
        <button data-testid="nav-logo" onClick={() => jump("home")} className="flex items-center gap-2.5 group">
          <div className="relative">
            {content?.logo_url ? (
              <img src={content.logo_url} alt="logo" className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-navy flex items-center justify-center border border-gold/40">
                <GraduationCap className="w-5 h-5 text-gold" strokeWidth={2.2} />
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-gold border-2 border-white" />
          </div>
          <div className="text-left leading-tight">
            <div className="font-display font-bold text-navy text-sm sm:text-base">
              {t(content?.academy_name, "NextGen Computer Academy")}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium tracking-wide">
              LEARN · LEAD · GROW
            </div>
          </div>
        </button>

        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map(n => (
            <button
              key={n.id}
              data-testid={`nav-${n.id}`}
              onClick={() => jump(n.id)}
              className={`px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-navy hover:bg-navy/5 transition-colors ${lang === "te" ? "font-te" : ""}`}
            >
              {lang === "te" ? n.te : n.en}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            data-testid="lang-toggle"
            onClick={toggleLang}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-navy border border-navy/15 hover:bg-navy hover:text-white transition-colors"
          >
            <Languages className="w-4 h-4" />
            {lang === "en" ? "తెలుగు" : "English"}
          </button>
          <button
            data-testid="nav-admission-cta"
            onClick={() => jump("admission")}
            className="hidden md:inline-flex px-4 py-2 rounded-lg bg-navy text-white text-sm font-semibold hover:bg-gold hover:text-black transition-colors"
          >
            {lang === "te" ? "అడ్మిషన్" : "Apply Now"}
          </button>
          <button
            data-testid="nav-mobile-toggle"
            onClick={() => setOpen(o => !o)}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg text-navy hover:bg-navy/5"
            aria-label="menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div data-testid="nav-mobile-menu" className="mx-3 sm:mx-6 mt-2 glass rounded-2xl p-3 lg:hidden animate-fade-up">
          <div className="grid grid-cols-2 gap-1">
            {navItems.map(n => (
              <button
                key={n.id}
                onClick={() => jump(n.id)}
                className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-navy hover:text-white transition-colors ${lang === "te" ? "font-te" : ""}`}
              >
                {lang === "te" ? n.te : n.en}
              </button>
            ))}
          </div>
          <button
            onClick={toggleLang}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-navy border border-navy/20"
          >
            <Languages className="w-4 h-4" /> {lang === "en" ? "తెలుగులో చూడండి" : "View in English"}
          </button>
        </div>
      )}
    </header>
  );
}
