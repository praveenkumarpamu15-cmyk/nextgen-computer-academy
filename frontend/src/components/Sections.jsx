import React from "react";
import { useApp } from "@/context/AppContext";
import { CheckCircle2, Target, Users2, HandHeart, IndianRupee, GraduationCap, HeartHandshake, MapPin, Phone, MessageCircle, Mail, Clock, Navigation } from "lucide-react";

export function About() {
  const { lang, content, t } = useApp();
  return (
    <section id="about" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5">
          <div className="text-xs font-bold tracking-[0.2em] text-gold uppercase">
            {lang === "te" ? "మా గురించి" : "About Us"}
          </div>
          <h2 className="mt-3 font-display text-4xl lg:text-5xl font-bold text-navy tracking-tight leading-tight">
            {lang === "te" ? "సర్టిఫికెట్ కంటే... నైపుణ్యం ముఖ్యం." : "Skills matter more than certificates."}
          </h2>
          <div className="mt-6 w-16 h-1 bg-gold rounded-full" />
        </div>
        <div className="lg:col-span-7">
          <p className={`text-slate-600 text-lg leading-relaxed ${lang === "te" ? "font-te" : ""}`}>
            {t(content?.about)}
          </p>
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            {[
              { en: "Hands-on Practice", te: "నిజమైన ప్రాక్టీస్" },
              { en: "Job-ready Confidence", te: "ఉద్యోగానికి కావలసిన కాన్ఫిడెన్స్" },
              { en: "Real-world Skills", te: "నిజ జీవితంలో పనికొచ్చే స్కిల్స్" },
              { en: "Career Mentorship", te: "కెరీర్ మార్గదర్శకత్వం" },
            ].map((it, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-cream border border-gold/20">
                <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                <div className={`text-navy font-semibold ${lang === "te" ? "font-te" : ""}`}>
                  {lang === "te" ? it.te : it.en}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const WHY_ICONS = [Target, Users2, HandHeart, HeartHandshake, IndianRupee, GraduationCap];

export function WhyChooseUs() {
  const { lang, content } = useApp();
  const items = content?.why_choose_us || [];
  return (
    <section id="why" className="py-20 lg:py-28 bg-cream/40 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gold/10 blur-3xl -z-0" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="max-w-2xl">
          <div className="text-xs font-bold tracking-[0.2em] text-gold uppercase">
            {lang === "te" ? "మా ప్రత్యేకతలు" : "Why Choose Us"}
          </div>
          <h2 className="mt-3 font-display text-4xl lg:text-5xl font-bold text-navy tracking-tight">
            {lang === "te" ? "ప్రతి విద్యార్థికి సరైన మార్గం" : "The right way for every student."}
          </h2>
          <div className="mt-4 w-16 h-1 bg-gold rounded-full" />
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((it, i) => {
            const Icon = WHY_ICONS[i % WHY_ICONS.length];
            return (
              <div
                key={i}
                data-testid={`why-card-${i}`}
                className="group relative bg-white rounded-2xl p-6 border border-slate-100 hover:border-gold/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-navy flex items-center justify-center border border-gold/30 group-hover:bg-gold transition-colors">
                  <Icon className="w-5 h-5 text-gold group-hover:text-black" />
                </div>
                <h3 className="mt-4 font-display font-bold text-navy text-xl">{it.title?.en}</h3>
                <p className="mt-1 font-te text-navy/80 text-base" lang="te">{it.title?.te}</p>
                <p className="mt-3 text-slate-600 text-sm leading-relaxed">{it.desc?.en}</p>
                <p className="mt-1 font-te text-slate-600 text-sm leading-relaxed" lang="te">{it.desc?.te}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Vision() {
  const { lang, content, t } = useApp();
  return (
    <section id="vision" className="py-20 lg:py-28 bg-navy relative overflow-hidden grain">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full bg-gold/30 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-10 text-center">
        <div className="text-xs font-bold tracking-[0.25em] text-gold uppercase">
          {lang === "te" ? "మా లక్ష్యం" : "Our Vision"}
        </div>
        <h2 className="mt-4 font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
          {lang === "te"
            ? "\"ప్రతి విద్యార్థి తన కాళ్ల మీద తాను నిలబడే స్థాయికి చేరుకోవాలి.\""
            : "\"Education should build confidence, skills and life opportunities.\""}
        </h2>
        <p className={`mt-6 text-white/80 text-lg leading-relaxed ${lang === "te" ? "font-te" : ""}`}>
          {t(content?.vision)}
        </p>
        <div className="mt-8 flex justify-center">
          <div className="w-20 h-1 bg-gold rounded-full" />
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  const { lang, content } = useApp();
  const c = content?.contact || {};
  const call = `tel:${(c.phone || "").replace(/\s/g, "")}`;
  const wa = `https://wa.me/${(c.whatsapp || "").replace(/[^0-9]/g, "")}`;
  const mail = `mailto:${c.email || ""}`;
  const address = lang === "te" ? (c.address_te || c.address_en) : (c.address_en || "");
  const timings = lang === "te" ? (c.timings_te || c.timings_en) : (c.timings_en || "");
  const mapsQuery = encodeURIComponent(c.address_en || "");
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`;

  const items = [
    { icon: Phone, label: lang === "te" ? "ఫోన్" : "Phone", val: c.phone, href: call, testid: "contact-phone" },
    { icon: MessageCircle, label: "WhatsApp", val: c.whatsapp, href: wa, testid: "contact-whatsapp" },
    { icon: Mail, label: lang === "te" ? "ఈమెయిల్" : "Email", val: c.email, href: mail, testid: "contact-email" },
    { icon: Clock, label: lang === "te" ? "సమయాలు" : "Timings", val: timings, href: null, testid: "contact-timings" },
  ];

  return (
    <section id="contact" className="py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="max-w-2xl">
          <div className="text-xs font-bold tracking-[0.2em] text-gold uppercase">
            {lang === "te" ? "సంప్రదించండి" : "Contact"}
          </div>
          <h2 className="mt-3 font-display text-4xl lg:text-5xl font-bold text-navy tracking-tight">
            {lang === "te" ? "మేము మీకు అందుబాటులో ఉన్నాము" : "Get in touch with us."}
          </h2>
        </div>

        <div className="mt-12 grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            {items.map((it, i) => {
              const Cmp = it.href ? "a" : "div";
              return (
                <Cmp
                  key={i}
                  data-testid={it.testid}
                  {...(it.href ? { href: it.href, target: "_blank", rel: "noreferrer" } : {})}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-slate-100 hover:border-gold/40 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-navy flex items-center justify-center shrink-0">
                    <it.icon className="w-5 h-5 text-gold" />
                  </div>
                  <div className="min-w-0">
                    <div className={`text-xs uppercase tracking-wider text-slate-500 font-semibold ${lang === "te" ? "font-te" : ""}`}>{it.label}</div>
                    <div className="mt-1 font-display font-semibold text-navy text-lg break-words">{it.val}</div>
                  </div>
                </Cmp>
              );
            })}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-navy text-white">
              <div className="w-12 h-12 rounded-xl bg-gold flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-black" />
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-gold font-semibold">
                  {lang === "te" ? "చిరునామా" : "Address"}
                </div>
                <div className={`mt-1 font-medium text-white/90 leading-relaxed ${lang === "te" ? "font-te" : ""}`}>{address}</div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a data-testid="contact-call-now" href={call} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white text-navy text-sm font-semibold hover:bg-gold hover:text-black transition-colors">
                    <Phone className="w-3.5 h-3.5" /> {lang === "te" ? "కాల్" : "Call Now"}
                  </a>
                  <a data-testid="contact-wa-chat" href={wa} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gold text-black text-sm font-semibold hover:bg-white transition-colors">
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                  <a data-testid="contact-directions" href={directions} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/25 text-white text-sm font-semibold hover:border-gold hover:text-gold transition-colors">
                    <Navigation className="w-3.5 h-3.5" /> {lang === "te" ? "మార్గం" : "Directions"}
                  </a>
                  <a data-testid="contact-send-email" href={mail} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/25 text-white text-sm font-semibold hover:border-gold hover:text-gold transition-colors">
                    <Mail className="w-3.5 h-3.5" /> {lang === "te" ? "మెయిల్" : "Email"}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl overflow-hidden border border-slate-100 shadow-lg h-[520px]">
            <iframe
              data-testid="google-maps"
              title="Location"
              src={c.google_maps_embed}
              className="w-full h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
