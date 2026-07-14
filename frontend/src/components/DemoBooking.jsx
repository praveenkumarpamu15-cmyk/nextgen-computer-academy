import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import api from "@/lib/api";
import { toast } from "sonner";
import { Calendar, Clock, User, Phone, MessageCircle, CheckCircle2, Loader2, Sparkles, BookOpen } from "lucide-react";

// Time slots displayed to the student
const TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
  "06:00 PM", "07:00 PM",
];

function todayISO() {
  const d = new Date();
  d.setDate(d.getDate() + 1); // tomorrow onwards
  return d.toISOString().split("T")[0];
}

export default function DemoBooking() {
  const { lang, content, courses } = useApp();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState("10:00 AM");
  const [course, setCourse] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  const whatsappNum = (content?.contact?.whatsapp || "").replace(/[^0-9]/g, "");
  const waMessage = lang === "te"
    ? `నమస్తే, నాకు ${course || "కంప్యూటర్ కోర్సు"} కోసం ఉచిత డెమో క్లాస్ కావాలి. ${date} ${time} ఉంటుందా? నా పేరు ${name || "___"}.`
    : `Hi, I'd like to book a free demo class${course ? ` for ${course}` : ""} on ${date} at ${time}. My name is ${name || "___"}.`;
  const waLink = whatsappNum
    ? `https://wa.me/${whatsappNum}?text=${encodeURIComponent(waMessage)}`
    : null;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/demo-bookings", { name, phone, date, time, course, notes });
      setSuccess(true);
      toast.success(lang === "te" ? "డెమో బుకింగ్ అందింది!" : "Demo class booked!");
    } catch {
      toast.error(lang === "te" ? "బుకింగ్ విఫలం. మళ్లీ ప్రయత్నించండి." : "Booking failed. Please try again.");
    } finally { setBusy(false); }
  };

  if (success) {
    return (
      <section id="demo" className="py-20 lg:py-28 bg-cream/40">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-10">
          <div data-testid="demo-success" className="relative rounded-3xl bg-navy text-white p-10 sm:p-14 text-center overflow-hidden">
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-gold/25 blur-3xl" />
            <div className="relative">
              <div className="mx-auto w-20 h-20 rounded-full bg-gold flex items-center justify-center animate-pulse-gold">
                <CheckCircle2 className="w-10 h-10 text-black" strokeWidth={2.5} />
              </div>
              <h3 className="mt-6 font-display text-3xl sm:text-4xl font-bold">
                {lang === "te" ? "డెమో బుక్ అయింది!" : "Demo class booked!"}
              </h3>
              <p className={`mt-3 text-white/85 text-lg ${lang === "te" ? "font-te" : ""}`}>
                {lang === "te"
                  ? `మేము మిమ్మల్ని ${phone} నంబర్‌కి కాల్ చేసి ${date} ${time} డెమో క్లాస్ కన్ఫర్మ్ చేస్తాము.`
                  : `We'll call you on ${phone} to confirm your demo class on ${date} at ${time}.`}
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {waLink && (
                  <a href={waLink} target="_blank" rel="noreferrer" data-testid="demo-success-wa"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] text-white font-semibold hover:opacity-90 transition-opacity">
                    <MessageCircle className="w-4 h-4" /> {lang === "te" ? "WhatsApp లో అనుసంధానం" : "Confirm via WhatsApp"}
                  </a>
                )}
                <button onClick={() => setSuccess(false)} className="inline-flex px-5 py-3 rounded-xl bg-gold text-black font-semibold hover:bg-white transition-colors">
                  {lang === "te" ? "కొత్తది బుక్ చేయండి" : "Book Another"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="demo" className="py-20 lg:py-28 bg-cream/40 relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gold/10 blur-3xl -z-0" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-navy text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              {lang === "te" ? "ఉచిత డెమో క్లాస్" : "FREE DEMO CLASS"}
            </div>
            <h2 className="mt-4 font-display text-4xl lg:text-5xl font-bold text-navy tracking-tight leading-tight">
              {lang === "te" ? "ఉచిత డెమో క్లాస్ బుక్ చేయండి" : "Book a Free Demo Class"}
            </h2>
            <div className="mt-4 w-16 h-1 bg-gold rounded-full" />
            <p className={`mt-5 text-slate-600 text-base sm:text-lg leading-relaxed ${lang === "te" ? "font-te" : ""}`}>
              {lang === "te"
                ? "మీ సౌకర్యమైన తేదీ, సమయాన్ని ఎంచుకోండి. మేము మీకు ఉచితంగా ఒక డెమో క్లాస్‌ను నిర్వహిస్తాము — ఎలాంటి బాధ్యత లేదు."
                : "Pick a date and time that works for you. We'll set up a free trial class — no commitment, no fees."}
            </p>

            <ul className="mt-6 space-y-2">
              {[
                { en: "1-on-1 walk through of the course", te: "కోర్సు గురించి 1-ఆన్-1 వాకథ్రూ" },
                { en: "See the classroom & meet the trainer", te: "క్లాస్‌రూమ్ చూడండి, ట్రైనర్‌ని కలవండి" },
                { en: "Ask any question — no pressure to enroll", te: "ఏ ప్రశ్న అయినా అడగండి — చేరాలని ఒత్తిడి లేదు" },
              ].map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-navy">
                  <CheckCircle2 className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                  <span className={lang === "te" ? "font-te" : ""}>{f[lang]}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-7">
            <form onSubmit={submit} data-testid="demo-booking-form" className="bg-white rounded-3xl border border-slate-100 shadow-lg p-6 sm:p-8">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className={`block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 ${lang === "te" ? "font-te" : ""}`}>
                    {lang === "te" ? "మీ పేరు" : "Your Name"} <span className="text-gold">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      data-testid="demo-name"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 ${lang === "te" ? "font-te" : ""}`}>
                    {lang === "te" ? "ఫోన్ నంబర్" : "Phone Number"} <span className="text-gold">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      data-testid="demo-phone"
                      required
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 ${lang === "te" ? "font-te" : ""}`}>
                    {lang === "te" ? "కోర్సు (ఐచ్ఛికం)" : "Course of Interest"}
                  </label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      data-testid="demo-course"
                      value={course}
                      onChange={e => setCourse(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none bg-white"
                    >
                      <option value="">— {lang === "te" ? "ఏదైనా" : "Any"} —</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.title_en}>{c.title_en}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 ${lang === "te" ? "font-te" : ""}`}>
                    {lang === "te" ? "తేదీ" : "Preferred Date"} <span className="text-gold">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      data-testid="demo-date"
                      required
                      type="date"
                      min={todayISO()}
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 ${lang === "te" ? "font-te" : ""}`}>
                    {lang === "te" ? "సమయం" : "Preferred Time"} <span className="text-gold">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      data-testid="demo-time"
                      required
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none bg-white"
                    >
                      {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 ${lang === "te" ? "font-te" : ""}`}>
                    {lang === "te" ? "గమనికలు (ఐచ్ఛికం)" : "Notes (optional)"}
                  </label>
                  <textarea
                    data-testid="demo-notes"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={2}
                    placeholder={lang === "te" ? "ఏదైనా ప్రత్యేక అభ్యర్థన?" : "Any specific request?"}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                {waLink ? (
                  <a
                    data-testid="demo-wa-btn"
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#25D366] text-white font-semibold hover:opacity-90 transition-opacity"
                  >
                    <MessageCircle className="w-4 h-4" fill="currentColor" strokeWidth={1.6} />
                    {lang === "te" ? "WhatsApp లో పంపండి" : "Join via WhatsApp"}
                  </a>
                ) : <span />}
                <button
                  data-testid="demo-submit"
                  type="submit"
                  disabled={busy || !name || !phone}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-navy text-white font-semibold hover:bg-gold hover:text-black transition-colors disabled:opacity-50"
                >
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  {lang === "te" ? "ఉచిత డెమో బుక్ చేయండి" : "Book Free Demo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
