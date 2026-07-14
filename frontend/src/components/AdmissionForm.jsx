import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { admissionsApi } from "@/lib/api";
import { toast } from "sonner";
import { CheckCircle2, Upload, Loader2 } from "lucide-react";

const LB = (en, te) => ({ en, te });
const FIELDS = [
  { name: "student_name", label: LB("Student Name", "విద్యార్థి పేరు"), type: "text", required: true },
  { name: "father_name", label: LB("Father Name", "తండ్రి పేరు"), type: "text", required: true },
  { name: "mother_name", label: LB("Mother Name", "తల్లి పేరు"), type: "text", required: true },
  { name: "dob", label: LB("Date of Birth", "పుట్టిన తేదీ"), type: "date", required: true },
  { name: "gender", label: LB("Gender", "లింగం"), type: "select", options: [
      { v: "Male", l: LB("Male", "పురుషుడు") },
      { v: "Female", l: LB("Female", "స్త్రీ") },
      { v: "Other", l: LB("Other", "ఇతరులు") },
    ], required: true },
  { name: "qualification", label: LB("Qualification", "విద్యార్హత"), type: "text", required: true },
  { name: "course", label: LB("Course", "కోర్సు"), type: "select-course", required: true },
  { name: "phone", label: LB("Phone", "ఫోన్"), type: "tel", required: true },
  { name: "alt_phone", label: LB("Alternate Phone", "ప్రత్యామ్నాయ ఫోన్"), type: "tel" },
  { name: "email", label: LB("Email", "ఈమెయిల్"), type: "email" },
  { name: "address", label: LB("Address", "చిరునామా"), type: "textarea", required: true },
];

export default function AdmissionForm() {
  const { lang, courses } = useApp();
  const [values, setValues] = useState({});
  const [photo, setPhoto] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const setV = (n, v) => setValues(o => ({ ...o, [n]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      FIELDS.forEach(f => fd.append(f.name, values[f.name] || ""));
      if (photo) fd.append("photo", photo);
      await admissionsApi.submit(fd);
      setSuccess(true);
      setValues({}); setPhoto(null);
      toast.success(lang === "te" ? "మీ దరఖాస్తు అందింది!" : "Application received!");
    } catch (err) {
      toast.error(lang === "te" ? "సమర్పణ విఫలం. మళ్లీ ప్రయత్నించండి." : "Submission failed. Please try again.");
    } finally { setSubmitting(false); }
  };

  if (success) {
    return (
      <section id="admission" className="py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-10">
          <div data-testid="admission-success" className="relative rounded-3xl bg-navy text-white p-10 sm:p-14 text-center overflow-hidden">
            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-gold/25 blur-3xl" />
            <div className="relative">
              <div className="mx-auto w-20 h-20 rounded-full bg-gold flex items-center justify-center animate-pulse-gold">
                <CheckCircle2 className="w-10 h-10 text-black" strokeWidth={2.5} />
              </div>
              <h3 className="mt-6 font-display text-3xl sm:text-4xl font-bold">
                {lang === "te" ? "ధన్యవాదాలు!" : "Thank you!"}
              </h3>
              <p className={`mt-3 text-white/85 text-lg ${lang === "te" ? "font-te" : ""}`}>
                {lang === "te"
                  ? "మీ దరఖాస్తు మాకు అందింది. మేము త్వరలో మిమ్మల్ని సంప్రదిస్తాము."
                  : "We have received your admission request. Our team will contact you shortly."}
              </p>
              <button onClick={() => setSuccess(false)} className="mt-8 inline-flex px-6 py-3 rounded-xl bg-gold text-black font-semibold hover:bg-white transition-colors">
                {lang === "te" ? "కొత్త దరఖాస్తు" : "Submit Another"}
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="admission" className="py-20 lg:py-28 bg-cream/40">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-10">
          <div className="text-xs font-bold tracking-[0.2em] text-gold uppercase">
            {lang === "te" ? "ఆన్‌లైన్ అడ్మిషన్" : "Online Admission"}
          </div>
          <h2 className="mt-3 font-display text-4xl lg:text-5xl font-bold text-navy tracking-tight">
            {lang === "te" ? "ఇప్పుడే మీ సీట్ నమోదు చేసుకోండి" : "Reserve your seat today."}
          </h2>
          <div className="mt-4 mx-auto w-16 h-1 bg-gold rounded-full" />
        </div>

        <form onSubmit={onSubmit} data-testid="admission-form" className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-5">
          {FIELDS.map(f => (
            <div key={f.name} className={f.type === "textarea" ? "md:col-span-2" : ""}>
              <label className={`block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 ${lang === "te" ? "font-te" : ""}`}>
                {f.label[lang]} {f.required && <span className="text-gold">*</span>}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  data-testid={`field-${f.name}`}
                  required={f.required}
                  value={values[f.name] || ""}
                  onChange={e => setV(f.name, e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none transition-colors"
                />
              ) : f.type === "select" ? (
                <select
                  data-testid={`field-${f.name}`}
                  required={f.required}
                  value={values[f.name] || ""}
                  onChange={e => setV(f.name, e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none bg-white"
                >
                  <option value="">—</option>
                  {f.options.map(o => (
                    <option key={o.v} value={o.v}>{o.l[lang]}</option>
                  ))}
                </select>
              ) : f.type === "select-course" ? (
                <select
                  data-testid={`field-${f.name}`}
                  required={f.required}
                  value={values[f.name] || ""}
                  onChange={e => setV(f.name, e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none bg-white"
                >
                  <option value="">—</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.title_en}>{c.title_en} / {c.title_te}</option>
                  ))}
                </select>
              ) : (
                <input
                  data-testid={`field-${f.name}`}
                  required={f.required}
                  type={f.type}
                  value={values[f.name] || ""}
                  onChange={e => setV(f.name, e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-gold focus:ring-2 focus:ring-gold/20 outline-none"
                />
              )}
            </div>
          ))}
          <div className="md:col-span-2">
            <label className={`block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 ${lang === "te" ? "font-te" : ""}`}>
              {lang === "te" ? "ఫోటో అప్‌లోడ్" : "Photo Upload"}
            </label>
            <label htmlFor="admission-photo" className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-gold hover:bg-gold/5 cursor-pointer transition-colors">
              <Upload className="w-5 h-5 text-gold" />
              <span className={`text-sm text-slate-600 ${lang === "te" ? "font-te" : ""}`}>
                {photo ? photo.name : (lang === "te" ? "ఇక్కడ క్లిక్ చేసి ఫోటో ఎంచుకోండి (JPG/PNG)" : "Click to upload student photo (JPG/PNG)")}
              </span>
              <input id="admission-photo" data-testid="field-photo" type="file" accept="image/*" className="hidden" onChange={e => setPhoto(e.target.files?.[0] || null)} />
            </label>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              data-testid="admission-submit"
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-navy text-white font-semibold hover:bg-gold hover:text-black transition-colors disabled:opacity-60"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? (lang === "te" ? "సమర్పిస్తోంది..." : "Submitting...") : (lang === "te" ? "అడ్మిషన్ సమర్పించండి" : "Submit Admission")}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
