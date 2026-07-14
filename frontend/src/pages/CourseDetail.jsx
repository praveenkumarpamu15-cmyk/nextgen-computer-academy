import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { useApp } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWidgets from "@/components/FloatingWidgets";
import SEO from "@/components/SEO";
import { ArrowLeft, ArrowRight, Clock, IndianRupee, CheckCircle2, BookOpen, Target, ListChecks, Sparkles, GraduationCap } from "lucide-react";

export default function CourseDetail() {
  const { key } = useParams();
  const nav = useNavigate();
  const { lang, t } = useApp();
  const [course, setCourse] = useState(null);
  const [allCourses, setAllCourses] = useState([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let ok = true;
    api.get(`/courses/${encodeURIComponent(key)}`)
      .then(r => { if (ok) setCourse(r.data); })
      .catch(() => { if (ok) setNotFound(true); });
    api.get("/courses").then(r => { if (ok) setAllCourses(r.data); });
    return () => { ok = false; };
  }, [key]);

  const goAdmission = () => nav("/#admission");

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
        <SEO title="Course not found · NextGen Computer Academy" description="This course does not exist." />
        <h1 className="font-display text-3xl font-bold text-navy">Course not found</h1>
        <p className="mt-2 text-slate-500">The course you're looking for isn't available.</p>
        <Link to="/" className="mt-6 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-navy text-white font-semibold hover:bg-gold hover:text-black transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="ngca-loader" />
      </div>
    );
  }

  const title = lang === "te" ? course.title_te : course.title_en;
  const shortDesc = lang === "te" ? course.desc_te : course.desc_en;
  const longDesc = lang === "te" ? (course.long_desc_te || course.desc_te) : (course.long_desc_en || course.desc_en);
  const prereq = lang === "te" ? course.prerequisites_te : course.prerequisites_en;
  const syllabus = lang === "te" ? (course.syllabus_te || []) : (course.syllabus_en || []);
  const outcomes = lang === "te" ? (course.outcomes_te || []) : (course.outcomes_en || []);
  const related = allCourses.filter(c => c.id !== course.id).slice(0, 3);

  const structured = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": course.title_en,
    "description": course.long_desc_en || course.desc_en,
    "provider": {
      "@type": "EducationalOrganization",
      "name": "NextGen Computer Academy",
    },
    "image": course.image_url,
    ...(course.fee ? {
      "offers": {
        "@type": "Offer",
        "price": (course.fee || "").replace(/[^0-9.]/g, "") || undefined,
        "priceCurrency": "INR",
        "category": "Course fee",
      }
    } : {}),
    ...(course.duration ? { "timeRequired": course.duration } : {}),
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={`${course.title_en} · NextGen Computer Academy`}
        description={course.long_desc_en || course.desc_en}
        image={course.image_url}
        path={`/course/${course.slug || course.id}`}
        type="article"
        structuredData={structured}
      />
      <Navbar />

      <main className="pt-24">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 -right-24 w-[520px] h-[520px] rounded-full bg-gold/10 blur-3xl" />
          </div>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-10 lg:py-16 grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-7 animate-fade-up">
              <button onClick={() => nav("/")} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy mb-6">
                <ArrowLeft className="w-4 h-4" /> {lang === "te" ? "అన్ని కోర్సులకు తిరిగి" : "Back to all courses"}
              </button>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-navy text-xs font-semibold tracking-wide">
                <BookOpen className="w-3.5 h-3.5 text-gold" />
                {lang === "te" ? "కోర్సు వివరాలు" : "Course Detail"}
              </div>
              <h1 className="mt-4 font-display font-bold tracking-tight text-navy text-4xl sm:text-5xl leading-[1.05]" data-testid="course-detail-title">
                {title}
              </h1>
              <p className={`mt-3 font-display text-xl text-navy/70 ${lang === "te" ? "font-te text-lg" : ""}`}>
                {lang === "te" ? course.title_en : course.title_te}
              </p>
              <p className={`mt-5 text-slate-600 text-base sm:text-lg leading-relaxed ${lang === "te" ? "font-te" : ""}`}>
                {shortDesc}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {course.fee && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gold text-black text-sm font-bold">
                    <IndianRupee className="w-3.5 h-3.5" strokeWidth={2.5} /> {course.fee.replace(/^₹/, "")}
                  </span>
                )}
                {course.duration && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-navy text-sm font-semibold">
                    <Clock className="w-3.5 h-3.5" /> {course.duration}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-navy text-white text-sm font-semibold">
                  <GraduationCap className="w-3.5 h-3.5" /> {lang === "te" ? "సర్టిఫికెట్ ఇస్తారు" : "Certificate included"}
                </span>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  data-testid="detail-cta-enroll"
                  onClick={goAdmission}
                  className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-navy text-white font-semibold hover:bg-gold hover:text-black transition-colors"
                >
                  {lang === "te" ? "ఇప్పుడే చేరండి" : "Enroll Now"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <Link to="/#contact" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border-2 border-navy/15 text-navy font-semibold hover:border-gold hover:text-gold transition-colors">
                  {lang === "te" ? "సందేహాలు?" : "Have questions?"}
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 relative animate-fade-up" style={{ animationDelay: "0.15s" }}>
              <div className="relative">
                <div className="absolute -top-5 -right-5 w-40 h-40 rounded-2xl bg-gold/25 -z-10" />
                <div className="zoom-wrap rounded-3xl overflow-hidden shadow-2xl border border-white/60">
                  <img src={course.image_url} alt={course.title_en} className="w-full h-[360px] sm:h-[440px] object-cover" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Body */}
        <section className="py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-10">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy tracking-tight">
                  {lang === "te" ? "కోర్సు గురించి" : "About this course"}
                </h2>
                <div className="mt-3 w-12 h-1 bg-gold rounded-full" />
                <p className={`mt-5 text-slate-700 text-base leading-relaxed whitespace-pre-line ${lang === "te" ? "font-te" : ""}`}>
                  {longDesc}
                </p>
              </div>

              {syllabus.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy tracking-tight flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-gold" /> {lang === "te" ? "సిలబస్" : "Syllabus"}
                  </h2>
                  <div className="mt-3 w-12 h-1 bg-gold rounded-full" />
                  <div className="mt-5 grid sm:grid-cols-2 gap-3">
                    {syllabus.map((s, i) => (
                      <div key={i} data-testid={`syllabus-${i}`} className="flex items-start gap-3 p-4 rounded-xl bg-cream border border-gold/20">
                        <div className="w-7 h-7 rounded-lg bg-navy text-gold text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                        <span className={`text-sm text-navy font-medium leading-snug ${lang === "te" ? "font-te" : ""}`}>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {outcomes.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy tracking-tight flex items-center gap-2">
                    <Target className="w-5 h-5 text-gold" /> {lang === "te" ? "మీరు నేర్చుకునేవి" : "What you'll learn"}
                  </h2>
                  <div className="mt-3 w-12 h-1 bg-gold rounded-full" />
                  <ul className="mt-5 space-y-2">
                    {outcomes.map((o, i) => (
                      <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-100">
                        <CheckCircle2 className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                        <span className={`text-sm text-slate-700 leading-snug ${lang === "te" ? "font-te" : ""}`}>{o}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {prereq && (
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy tracking-tight">
                    {lang === "te" ? "ముందస్తు అర్హతలు" : "Prerequisites"}
                  </h2>
                  <div className="mt-3 w-12 h-1 bg-gold rounded-full" />
                  <p className={`mt-5 text-slate-700 leading-relaxed ${lang === "te" ? "font-te" : ""}`}>{prereq}</p>
                </div>
              )}
            </div>

            {/* Sidebar CTA */}
            <aside className="lg:sticky lg:top-28 h-fit">
              <div className="relative rounded-2xl bg-navy text-white p-6 grain overflow-hidden">
                <div className="text-[10px] font-bold tracking-[0.25em] text-gold uppercase">
                  {lang === "te" ? "ఈ కోర్సులో చేరండి" : "Enroll in this course"}
                </div>
                <div className="mt-2 font-display font-bold text-2xl">{title}</div>
                <div className="mt-4 space-y-3 text-sm">
                  {course.fee && <div className="flex items-center justify-between"><span className="text-white/70">{lang === "te" ? "ఫీజు" : "Fee"}</span><span className="font-semibold text-gold">{course.fee}</span></div>}
                  {course.duration && <div className="flex items-center justify-between"><span className="text-white/70">{lang === "te" ? "వ్యవధి" : "Duration"}</span><span className="font-semibold">{course.duration}</span></div>}
                  <div className="flex items-center justify-between"><span className="text-white/70">{lang === "te" ? "మాధ్యమం" : "Medium"}</span><span className="font-semibold">EN + తెలుగు</span></div>
                </div>
                <button
                  onClick={goAdmission}
                  data-testid="sidebar-cta-enroll"
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gold text-black font-semibold hover:bg-white transition-colors"
                >
                  <Sparkles className="w-4 h-4" /> {lang === "te" ? "అడ్మిషన్ ప్రారంభించండి" : "Start Admission"}
                </button>
              </div>
            </aside>
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="py-14 bg-cream/40">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy tracking-tight">
                {lang === "te" ? "ఇతర కోర్సులు" : "Other courses"}
              </h2>
              <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {related.map(c => (
                  <Link
                    key={c.id}
                    to={`/course/${c.slug || c.id}`}
                    className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-gold/40 hover:shadow-lg transition-all"
                  >
                    <div className="zoom-wrap h-36 relative">
                      <img src={c.image_url} alt={c.title_en} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <div className="font-display font-bold text-navy">{lang === "te" ? c.title_te : c.title_en}</div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-gold font-semibold">{c.fee}</span>
                        <span className="text-slate-500">{c.duration}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
      <FloatingWidgets />
    </div>
  );
}
