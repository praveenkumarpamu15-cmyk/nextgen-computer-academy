import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { LogOut, Save, Trash2, Upload, Plus, ExternalLink, RefreshCw, Loader2, Users, BookOpen, Settings, Image as ImageIcon, GraduationCap, Bell, Send, AlertCircle, CheckCircle2, Download, MessageSquare, Star, Search, Calendar, Clock, Phone, MessageCircle } from "lucide-react";
import api, { authApi, contentApi, coursesApi, admissionsApi, galleryApi } from "@/lib/api";
import { useApp } from "@/context/AppContext";

const TABS = [
  { key: "content", label: "Site Content", icon: Settings },
  { key: "courses", label: "Courses", icon: BookOpen },
  { key: "admissions", label: "Admissions", icon: Users },
  { key: "demos", label: "Demo Bookings", icon: Calendar },
  { key: "gallery", label: "Gallery", icon: ImageIcon },
  { key: "notifications", label: "Notifications", icon: Bell },
];

export default function AdminDashboard() {
  const nav = useNavigate();
  const { refresh } = useApp();
  const [tab, setTab] = useState("content");
  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    authApi.me()
      .then(r => setEmail(r.email))
      .catch(() => nav("/admin"))
      .finally(() => setChecking(false));
  }, [nav]);

  const logout = () => { localStorage.removeItem("ngca_token"); nav("/admin"); };

  if (checking) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-navy" /></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-navy text-white sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="font-display font-bold">NextGen Admin</div>
              <div className="text-[11px] text-white/60">{email}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" target="_blank" className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/10">
              <ExternalLink className="w-4 h-4" /> View Site
            </Link>
            <button data-testid="admin-logout" onClick={logout} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm bg-gold text-black font-semibold hover:bg-white transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 grid lg:grid-cols-[240px_1fr] gap-6">
        <aside className="lg:sticky lg:top-24 h-fit">
          <nav className="flex lg:flex-col gap-1 bg-white rounded-2xl p-2 border border-slate-200 overflow-x-auto">
            {TABS.map(t => (
              <button
                key={t.key}
                data-testid={`admin-tab-${t.key}`}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${tab === t.key ? "bg-navy text-white" : "text-slate-700 hover:bg-slate-100"}`}
              >
                <t.icon className="w-4 h-4" /> {t.label}
              </button>
            ))}
          </nav>
        </aside>

        <main>
          {tab === "content" && <ContentTab onSaved={refresh} />}
          {tab === "courses" && <CoursesTab onSaved={refresh} />}
          {tab === "testimonials" && <TestimonialsTab />}
          {tab === "admissions" && <AdmissionsTab />}
          {tab === "demos" && <DemosTab />}
          {tab === "gallery" && <GalleryTab />}
          {tab === "notifications" && <NotificationsTab />}
        </main>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, textarea, className = "" }) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">{label}</label>
      {textarea ? (
        <textarea value={value || ""} onChange={e => onChange(e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-gold outline-none text-sm" />
      ) : (
        <input value={value || ""} onChange={e => onChange(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-gold outline-none text-sm" />
      )}
    </div>
  );
}

function ContentTab({ onSaved }) {
  const [c, setC] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { contentApi.get().then(setC); }, []);

  if (!c) return <Loader2 className="w-5 h-5 animate-spin" />;

  const setBi = (key, sub, v) => setC(o => ({ ...o, [key]: { ...(o[key] || {}), [sub]: v } }));
  const setContact = (k, v) => setC(o => ({ ...o, contact: { ...(o.contact || {}), [k]: v } }));
  const setWhy = (i, path, v) => {
    const cp = [...(c.why_choose_us || [])];
    const [group, sub] = path.split(".");
    cp[i] = { ...cp[i], [group]: { ...(cp[i][group] || {}), [sub]: v } };
    setC({ ...c, why_choose_us: cp });
  };

  const save = async () => {
    setBusy(true);
    try {
      await contentApi.update(c);
      toast.success("Content saved");
      onSaved?.();
    } catch { toast.error("Save failed"); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-6">
      <Panel title="Academy Identity">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Academy Name (English)" value={c.academy_name?.en} onChange={v => setBi("academy_name", "en", v)} />
          <Field label="Academy Name (Telugu)" value={c.academy_name?.te} onChange={v => setBi("academy_name", "te", v)} />
          <Field label="Tagline (English)" value={c.tagline?.en} onChange={v => setBi("tagline", "en", v)} />
          <Field label="Tagline (Telugu)" value={c.tagline?.te} onChange={v => setBi("tagline", "te", v)} />
          <Field label="Hero Banner Image URL" value={c.hero_image_url} onChange={v => setC({ ...c, hero_image_url: v })} className="md:col-span-2" />
          <Field label="Logo Image URL" value={c.logo_url} onChange={v => setC({ ...c, logo_url: v })} className="md:col-span-2" />
        </div>
      </Panel>

      <Panel title="Welcome / About / Vision">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Welcome (English)" textarea value={c.welcome?.en} onChange={v => setBi("welcome", "en", v)} />
          <Field label="Welcome (Telugu)" textarea value={c.welcome?.te} onChange={v => setBi("welcome", "te", v)} />
          <Field label="About (English)" textarea value={c.about?.en} onChange={v => setBi("about", "en", v)} />
          <Field label="About (Telugu)" textarea value={c.about?.te} onChange={v => setBi("about", "te", v)} />
          <Field label="Vision (English)" textarea value={c.vision?.en} onChange={v => setBi("vision", "en", v)} />
          <Field label="Vision (Telugu)" textarea value={c.vision?.te} onChange={v => setBi("vision", "te", v)} />
        </div>
      </Panel>

      <Panel title="Why Choose Us">
        <div className="space-y-3">
          {(c.why_choose_us || []).map((w, i) => (
            <div key={i} className="grid md:grid-cols-4 gap-3 p-3 rounded-xl border border-slate-100">
              <Field label={`Title EN`} value={w.title?.en} onChange={v => setWhy(i, "title.en", v)} />
              <Field label={`Title TE`} value={w.title?.te} onChange={v => setWhy(i, "title.te", v)} />
              <Field label={`Desc EN`} value={w.desc?.en} onChange={v => setWhy(i, "desc.en", v)} />
              <Field label={`Desc TE`} value={w.desc?.te} onChange={v => setWhy(i, "desc.te", v)} />
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Contact Information">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Phone" value={c.contact?.phone} onChange={v => setContact("phone", v)} />
          <Field label="WhatsApp Number" value={c.contact?.whatsapp} onChange={v => setContact("whatsapp", v)} />
          <Field label="Email" value={c.contact?.email} onChange={v => setContact("email", v)} />
          <Field label="Working Hours (EN)" value={c.contact?.timings_en} onChange={v => setContact("timings_en", v)} />
          <Field label="Working Hours (TE)" value={c.contact?.timings_te} onChange={v => setContact("timings_te", v)} />
          <Field label="Address (EN)" textarea value={c.contact?.address_en} onChange={v => setContact("address_en", v)} />
          <Field label="Address (TE)" textarea value={c.contact?.address_te} onChange={v => setContact("address_te", v)} />
          <Field label="Google Maps Embed URL" textarea value={c.contact?.google_maps_embed} onChange={v => setContact("google_maps_embed", v)} className="md:col-span-2" />
        </div>
      </Panel>

      <Panel title="AI Assistant Instructions">
        <Field label="System prompt / info the AI knows" textarea value={c.ai_assistant_info} onChange={v => setC({ ...c, ai_assistant_info: v })} />
      </Panel>

      <Panel title="Homepage Stats (leave empty to hide — no fake data will be shown)">
        <p className="text-sm text-slate-500 mb-3">These appear in the hero. Only add real, verifiable numbers.</p>
        <div className="space-y-3">
          {(c.stats || []).map((s, i) => (
            <div key={i} className="grid md:grid-cols-[1fr_1.5fr_1.5fr_auto] gap-2 items-end">
              <Field label={`Value #${i+1}`} value={s.value} onChange={v => {
                const arr = [...(c.stats||[])]; arr[i] = { ...arr[i], value: v }; setC({ ...c, stats: arr });
              }} />
              <Field label="Label (EN)" value={s.label?.en} onChange={v => {
                const arr = [...(c.stats||[])]; arr[i] = { ...arr[i], label: { ...(arr[i].label||{}), en: v } }; setC({ ...c, stats: arr });
              }} />
              <Field label="Label (TE)" value={s.label?.te} onChange={v => {
                const arr = [...(c.stats||[])]; arr[i] = { ...arr[i], label: { ...(arr[i].label||{}), te: v } }; setC({ ...c, stats: arr });
              }} />
              <button type="button" onClick={() => {
                const arr = (c.stats||[]).filter((_, j) => j !== i); setC({ ...c, stats: arr });
              }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setC({ ...c, stats: [...(c.stats||[]), { value: "", label: { en: "", te: "" } }] })}
            className="text-sm font-semibold text-navy hover:text-gold inline-flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add stat
          </button>
        </div>
      </Panel>

      <Panel title="Success Journey — Real Milestones (timeline)">
        <p className="text-sm text-slate-500 mb-3">Add real milestones from the academy's journey. Leave empty and the section stays hidden.</p>
        <div className="space-y-3">
          {(c.success_journey || []).map((m, i) => (
            <div key={i} className="p-4 rounded-xl border border-slate-100 relative">
              <button type="button" onClick={() => {
                const arr = (c.success_journey||[]).filter((_, j) => j !== i); setC({ ...c, success_journey: arr });
              }} className="absolute top-3 right-3 p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid md:grid-cols-[120px_1fr_1fr] gap-3">
                <Field label="Year / Date" value={m.year} onChange={v => {
                  const arr = [...(c.success_journey||[])]; arr[i] = { ...arr[i], year: v }; setC({ ...c, success_journey: arr });
                }} />
                <Field label="Title (EN)" value={m.title?.en} onChange={v => {
                  const arr = [...(c.success_journey||[])]; arr[i] = { ...arr[i], title: { ...(arr[i].title||{}), en: v } }; setC({ ...c, success_journey: arr });
                }} />
                <Field label="Title (TE)" value={m.title?.te} onChange={v => {
                  const arr = [...(c.success_journey||[])]; arr[i] = { ...arr[i], title: { ...(arr[i].title||{}), te: v } }; setC({ ...c, success_journey: arr });
                }} />
              </div>
              <div className="grid md:grid-cols-2 gap-3 mt-3">
                <Field label="Description (EN)" textarea value={m.desc?.en} onChange={v => {
                  const arr = [...(c.success_journey||[])]; arr[i] = { ...arr[i], desc: { ...(arr[i].desc||{}), en: v } }; setC({ ...c, success_journey: arr });
                }} />
                <Field label="Description (TE)" textarea value={m.desc?.te} onChange={v => {
                  const arr = [...(c.success_journey||[])]; arr[i] = { ...arr[i], desc: { ...(arr[i].desc||{}), te: v } }; setC({ ...c, success_journey: arr });
                }} />
              </div>
            </div>
          ))}
          <button type="button" onClick={() => setC({ ...c, success_journey: [...(c.success_journey||[]), { year: "", title: { en: "", te: "" }, desc: { en: "", te: "" } }] })}
            className="text-sm font-semibold text-navy hover:text-gold inline-flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add milestone
          </button>
        </div>
      </Panel>

      <Panel title="SEO — Search Engine Optimization">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Site Title" value={c.seo?.site_title} onChange={v => setC({ ...c, seo: { ...(c.seo||{}), site_title: v } })} className="md:col-span-2" />
          <Field label="Meta Description (shown in Google results)" textarea value={c.seo?.site_description} onChange={v => setC({ ...c, seo: { ...(c.seo||{}), site_description: v } })} className="md:col-span-2" />
          <Field label="Keywords (comma separated)" textarea value={c.seo?.site_keywords} onChange={v => setC({ ...c, seo: { ...(c.seo||{}), site_keywords: v } })} className="md:col-span-2" />
          <Field label="Open Graph / Social Share Image URL" value={c.seo?.og_image} onChange={v => setC({ ...c, seo: { ...(c.seo||{}), og_image: v } })} className="md:col-span-2" />
          <Field label="Canonical Site URL (e.g. https://nextgencomputeracademy.in)" value={c.seo?.canonical_url} onChange={v => setC({ ...c, seo: { ...(c.seo||{}), canonical_url: v } })} />
          <Field label="Twitter Handle (e.g. @nextgen)" value={c.seo?.twitter_handle} onChange={v => setC({ ...c, seo: { ...(c.seo||{}), twitter_handle: v } })} />
        </div>
        <div className="mt-3 text-xs text-slate-500">
          Sitemap: <a href={`${api.defaults.baseURL}/sitemap.xml`} target="_blank" rel="noreferrer" className="text-navy underline font-mono">/api/sitemap.xml</a>
          <span className="mx-2">·</span>
          Robots: <a href={`${api.defaults.baseURL}/robots.txt`} target="_blank" rel="noreferrer" className="text-navy underline font-mono">/api/robots.txt</a>
        </div>
      </Panel>

      <Panel title="Meet Your Trainer">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Name (EN)" value={c.trainer?.name?.en} onChange={v => setC({ ...c, trainer: { ...(c.trainer||{}), name: { ...(c.trainer?.name||{}), en: v } } })} />
          <Field label="Name (TE)" value={c.trainer?.name?.te} onChange={v => setC({ ...c, trainer: { ...(c.trainer||{}), name: { ...(c.trainer?.name||{}), te: v } } })} />
          <Field label="Title / Role (EN)" value={c.trainer?.title?.en} onChange={v => setC({ ...c, trainer: { ...(c.trainer||{}), title: { ...(c.trainer?.title||{}), en: v } } })} />
          <Field label="Title / Role (TE)" value={c.trainer?.title?.te} onChange={v => setC({ ...c, trainer: { ...(c.trainer||{}), title: { ...(c.trainer?.title||{}), te: v } } })} />
          <Field label="Photo URL" value={c.trainer?.photo_url} onChange={v => setC({ ...c, trainer: { ...(c.trainer||{}), photo_url: v } })} className="md:col-span-2" />
          <Field label="Biography (EN)" textarea value={c.trainer?.bio?.en} onChange={v => setC({ ...c, trainer: { ...(c.trainer||{}), bio: { ...(c.trainer?.bio||{}), en: v } } })} />
          <Field label="Biography (TE)" textarea value={c.trainer?.bio?.te} onChange={v => setC({ ...c, trainer: { ...(c.trainer||{}), bio: { ...(c.trainer?.bio||{}), te: v } } })} />
          <Field label="Mission (EN)" textarea value={c.trainer?.mission?.en} onChange={v => setC({ ...c, trainer: { ...(c.trainer||{}), mission: { ...(c.trainer?.mission||{}), en: v } } })} />
          <Field label="Mission (TE)" textarea value={c.trainer?.mission?.te} onChange={v => setC({ ...c, trainer: { ...(c.trainer||{}), mission: { ...(c.trainer?.mission||{}), te: v } } })} />
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Qualifications</div>
            <button
              type="button"
              onClick={() => setC({ ...c, trainer: { ...(c.trainer||{}), qualifications: [...(c.trainer?.qualifications||[]), { en: "", te: "" }] } })}
              className="text-xs font-semibold text-navy hover:text-gold inline-flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
          <div className="space-y-2">
            {(c.trainer?.qualifications || []).map((q, i) => (
              <div key={i} className="grid md:grid-cols-[1fr_1fr_auto] gap-2 items-end">
                <Field label={`#${i+1} EN`} value={q.en} onChange={v => {
                  const qs = [...(c.trainer?.qualifications || [])]; qs[i] = { ...qs[i], en: v };
                  setC({ ...c, trainer: { ...(c.trainer||{}), qualifications: qs } });
                }} />
                <Field label={`#${i+1} TE`} value={q.te} onChange={v => {
                  const qs = [...(c.trainer?.qualifications || [])]; qs[i] = { ...qs[i], te: v };
                  setC({ ...c, trainer: { ...(c.trainer||{}), qualifications: qs } });
                }} />
                <button
                  type="button"
                  onClick={() => {
                    const qs = (c.trainer?.qualifications || []).filter((_, j) => j !== i);
                    setC({ ...c, trainer: { ...(c.trainer||{}), qualifications: qs } });
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg self-center"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <div className="sticky bottom-4 flex justify-end">
        <button data-testid="content-save" onClick={save} disabled={busy} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-navy text-white font-semibold shadow-lg hover:bg-gold hover:text-black transition-colors disabled:opacity-60">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
        </button>
      </div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      <h3 className="font-display font-bold text-navy text-lg mb-4">{title}</h3>
      {children}
    </div>
  );
}

function CoursesTab({ onSaved }) {
  const [list, setList] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = () => coursesApi.list().then(setList);
  useEffect(() => { load(); }, []);

  const update = (id, patch) => setList(l => l.map(c => c.id === id ? { ...c, ...patch } : c));

  const saveOne = async (c) => {
    try { await coursesApi.update(c.id, c); toast.success("Course updated"); onSaved?.(); }
    catch { toast.error("Failed"); }
  };
  const removeOne = async (id) => {
    if (!window.confirm("Delete this course?")) return;
    await coursesApi.remove(id); load(); onSaved?.();
  };
  const addOne = async () => {
    setBusy(true);
    try {
      await coursesApi.create({ title_en: "New Course", title_te: "కొత్త కోర్సు", desc_en: "", desc_te: "", image_url: "", fee: "", duration: "", order: list.length });
      load(); onSaved?.();
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-2xl text-navy">Manage Courses</h3>
        <button data-testid="course-add" onClick={addOne} disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold text-black font-semibold hover:bg-navy hover:text-white transition-colors">
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>
      {list.map(c => (
        <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Title (EN)" value={c.title_en} onChange={v => update(c.id, { title_en: v })} />
            <Field label="Title (TE)" value={c.title_te} onChange={v => update(c.id, { title_te: v })} />
            <Field label="URL Slug (leave blank to auto-generate)" value={c.slug} onChange={v => update(c.id, { slug: v })} className="md:col-span-2" />
            <Field label="Short Description (EN)" textarea value={c.desc_en} onChange={v => update(c.id, { desc_en: v })} />
            <Field label="Short Description (TE)" textarea value={c.desc_te} onChange={v => update(c.id, { desc_te: v })} />
            <Field label="Full Description (EN) — shown on course detail page" textarea value={c.long_desc_en} onChange={v => update(c.id, { long_desc_en: v })} />
            <Field label="Full Description (TE)" textarea value={c.long_desc_te} onChange={v => update(c.id, { long_desc_te: v })} />
            <Field label="Fee" value={c.fee} onChange={v => update(c.id, { fee: v })} />
            <Field label="Duration" value={c.duration} onChange={v => update(c.id, { duration: v })} />
            <Field label="Image URL" value={c.image_url} onChange={v => update(c.id, { image_url: v })} className="md:col-span-2" />
            <Field label="Prerequisites (EN)" textarea value={c.prerequisites_en} onChange={v => update(c.id, { prerequisites_en: v })} />
            <Field label="Prerequisites (TE)" textarea value={c.prerequisites_te} onChange={v => update(c.id, { prerequisites_te: v })} />
            <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
              <ListEditor label="Syllabus Topics (EN)" items={c.syllabus_en || []} onChange={arr => update(c.id, { syllabus_en: arr })} />
              <ListEditor label="Syllabus Topics (TE)" items={c.syllabus_te || []} onChange={arr => update(c.id, { syllabus_te: arr })} />
              <ListEditor label="Learning Outcomes (EN)" items={c.outcomes_en || []} onChange={arr => update(c.id, { outcomes_en: arr })} />
              <ListEditor label="Learning Outcomes (TE)" items={c.outcomes_te || []} onChange={arr => update(c.id, { outcomes_te: arr })} />
              <ListEditor label="Practical Exercises (EN)" items={c.exercises_en || []} onChange={arr => update(c.id, { exercises_en: arr })} />
              <ListEditor label="Practical Exercises (TE)" items={c.exercises_te || []} onChange={arr => update(c.id, { exercises_te: arr })} />
              <ListEditor label="Practical Projects (EN)" items={c.projects_en || []} onChange={arr => update(c.id, { projects_en: arr })} />
              <ListEditor label="Practical Projects (TE)" items={c.projects_te || []} onChange={arr => update(c.id, { projects_te: arr })} />
              <ListEditor label="Career Opportunities (EN)" items={c.career_en || []} onChange={arr => update(c.id, { career_en: arr })} />
              <ListEditor label="Career Opportunities (TE)" items={c.career_te || []} onChange={arr => update(c.id, { career_te: arr })} />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={() => removeOne(c.id)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
            <button onClick={() => saveOne(c)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-navy text-white text-sm font-semibold hover:bg-gold hover:text-black transition-colors">
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AdmissionsTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = () => { setLoading(true); admissionsApi.list().then(setItems).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const remove = async (id) => {
    if (!window.confirm("Delete this admission?")) return;
    await admissionsApi.remove(id); load();
  };

  const exportFile = (fmt) => {
    const t = localStorage.getItem("ngca_token") || "";
    const url = `${api.defaults.baseURL}/admissions/export/${fmt}?auth=${encodeURIComponent(t)}`;
    window.open(url, "_blank");
  };

  const filtered = query
    ? items.filter(a => `${a.student_name} ${a.phone} ${a.email} ${a.course}`.toLowerCase().includes(query.toLowerCase()))
    : items;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display font-bold text-2xl text-navy">Admissions ({items.length})</h3>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              data-testid="admissions-search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search name / phone / course"
              className="pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm w-64 focus:border-gold outline-none"
            />
          </div>
          <button data-testid="export-csv" onClick={() => exportFile("csv")} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm text-navy font-semibold hover:border-gold hover:text-gold">
            <Download className="w-4 h-4" /> CSV
          </button>
          <button data-testid="export-xlsx" onClick={() => exportFile("xlsx")} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-navy text-white text-sm font-semibold hover:bg-gold hover:text-black">
            <Download className="w-4 h-4" /> Excel
          </button>
          <button onClick={load} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> :
        filtered.length === 0 ? <div className="text-sm text-slate-500 bg-white p-8 rounded-xl border">No admissions match your search.</div> :
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(a => (
            <div key={a.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex gap-4">
              {a.photo_path ? (
                <img src={admissionsApi.photoUrl(a.id)} alt={a.student_name} className="w-20 h-20 rounded-xl object-cover border border-slate-100" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs">No Photo</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-navy truncate">{a.student_name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{a.course}</div>
                <div className="text-xs text-slate-600 mt-1">📞 {a.phone}</div>
                {a.email && <div className="text-xs text-slate-600 truncate">✉ {a.email}</div>}
                <div className="text-[10px] text-slate-400 mt-1">{new Date(a.created_at).toLocaleString()}</div>
                <button onClick={() => remove(a.id)} className="mt-2 text-xs text-red-600 hover:underline inline-flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
}

function GalleryTab() {
  const [items, setItems] = useState([]);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => galleryApi.list().then(setItems);
  useEffect(() => { load(); }, []);

  const upload = async () => {
    if (!file) return toast.error("Choose a file first");
    setBusy(true);
    try {
      await galleryApi.upload(file, caption);
      toast.success("Uploaded");
      setFile(null); setCaption(""); load();
    } catch { toast.error("Upload failed"); }
    finally { setBusy(false); }
  };

  const remove = async (id) => {
    if (!window.confirm("Remove this image?")) return;
    await galleryApi.remove(id); load();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-display font-bold text-navy text-lg mb-4">Upload Image</h3>
        <div className="grid md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Image</label>
            <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="text-sm" />
          </div>
          <Field label="Caption (optional)" value={caption} onChange={setCaption} />
          <button onClick={upload} disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-navy text-white font-semibold hover:bg-gold hover:text-black transition-colors disabled:opacity-60">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Upload
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map(it => (
          <div key={it.id} className="relative group rounded-2xl overflow-hidden border border-slate-200 aspect-square">
            <img src={galleryApi.imageUrl(it.id)} alt={it.caption} className="w-full h-full object-cover" />
            <button onClick={() => remove(it.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-600 text-white w-8 h-8 rounded-lg flex items-center justify-center transition-opacity">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


function NotificationsTab() {
  const [status, setStatus] = useState(null);
  const [content, setContent] = useState(null);
  const [busy, setBusy] = useState(false);
  const [testing, setTesting] = useState(false);

  const load = async () => {
    const [s, c] = await Promise.all([
      api.get("/notifications/status").then(r => r.data),
      contentApi.get(),
    ]);
    setStatus(s); setContent(c);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!content) return;
    setBusy(true);
    try {
      await contentApi.update({
        owner_notification_email: content.owner_notification_email || "",
        notifications_enabled: !!content.notifications_enabled,
      });
      toast.success("Notification settings saved");
      await load();
    } catch { toast.error("Save failed"); }
    finally { setBusy(false); }
  };

  const sendTest = async () => {
    setTesting(true);
    try {
      const { data } = await api.post("/notifications/test");
      toast.success(`Test email sent to ${data.sent_to}`);
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Test failed");
    } finally { setTesting(false); }
  };

  if (!status || !content) return <Loader2 className="w-5 h-5 animate-spin" />;

  const providerOk = status.email_provider_configured;

  return (
    <div className="space-y-6">
      <Panel title="Admission Email Notifications">
        <div className={`flex items-start gap-3 p-4 rounded-xl border ${providerOk ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
          {providerOk ? <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
          <div className="text-sm">
            <div className="font-semibold text-navy">
              {providerOk ? "Email provider ready" : "Email provider not configured"}
            </div>
            <div className="mt-0.5 text-slate-600">
              {providerOk
                ? <>Sender: <span className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border">{status.sender_email}</span></>
                : <>Set <span className="font-mono text-xs bg-white px-1.5 py-0.5 rounded border">RESEND_API_KEY</span> in <span className="font-mono text-xs">/app/backend/.env</span> to enable email notifications. Get a free key at <a href="https://resend.com" target="_blank" rel="noreferrer" className="text-navy underline">resend.com</a>.</>
              }
            </div>
          </div>
        </div>

        <div className="mt-5 grid md:grid-cols-2 gap-4">
          <Field
            label="Owner Notification Email"
            value={content.owner_notification_email}
            onChange={v => setContent({ ...content, owner_notification_email: v })}
          />
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Enable Notifications</label>
            <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 cursor-pointer bg-white">
              <input
                type="checkbox"
                data-testid="notif-enabled"
                checked={!!content.notifications_enabled}
                onChange={e => setContent({ ...content, notifications_enabled: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm text-slate-700">Send email to owner on every new admission</span>
            </label>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 justify-end">
          <button
            data-testid="notif-test-btn"
            onClick={sendTest}
            disabled={testing || !providerOk || !content.owner_notification_email}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-navy/20 text-navy font-semibold text-sm hover:border-gold hover:text-gold transition-colors disabled:opacity-50"
          >
            {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send Test Email
          </button>
          <button
            data-testid="notif-save-btn"
            onClick={save}
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-navy text-white font-semibold text-sm hover:bg-gold hover:text-black transition-colors disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Settings
          </button>
        </div>
      </Panel>

      <Panel title="How it works">
        <ul className="text-sm text-slate-600 space-y-2 list-disc pl-5">
          <li>Every time a student submits the online admission form, an email summary is sent to the owner notification email above.</li>
          <li>The system works normally even without an API key — emails are simply skipped and logged. Your website, admin panel and database are never blocked by missing email configuration.</li>
          <li>To enable emails: add <span className="font-mono text-xs">RESEND_API_KEY=re_xxx</span> to <span className="font-mono text-xs">/app/backend/.env</span>, then restart the backend.</li>
          <li>Sender domain <span className="font-mono text-xs">onboarding@resend.dev</span> works out of the box in Resend test mode. For production, verify your own domain in the Resend dashboard.</li>
        </ul>
      </Panel>
    </div>
  );
}

function ListEditor({ label, items, onChange }) {
  const update = (i, v) => { const cp = [...items]; cp[i] = v; onChange(cp); };
  const add = () => onChange([...items, ""]);
  const remove = (i) => onChange(items.filter((_, j) => j !== i));
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{label}</label>
        <button type="button" onClick={add} className="text-xs font-semibold text-navy hover:text-gold inline-flex items-center gap-1">
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>
      <div className="space-y-2">
        {items.length === 0 && <div className="text-xs text-slate-400 italic px-2">No items yet.</div>}
        {items.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs text-slate-400 w-6 shrink-0">{i + 1}.</span>
            <input
              value={it}
              onChange={e => update(i, e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-gold outline-none"
            />
            <button type="button" onClick={() => remove(i)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function TestimonialsTab() {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = () => api.get("/admin/testimonials").then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  const update = (id, patch) => setItems(l => l.map(t => t.id === id ? { ...t, ...patch } : t));
  const setBilingual = (id, key, sub, v) => setItems(l => l.map(t => t.id === id ? { ...t, [key]: { ...(t[key] || {}), [sub]: v } } : t));

  const saveOne = async (t) => {
    try { await api.put(`/testimonials/${t.id}`, t); toast.success("Saved"); load(); }
    catch { toast.error("Failed"); }
  };
  const removeOne = async (id) => {
    if (!window.confirm("Delete this testimonial?")) return;
    await api.delete(`/testimonials/${id}`); load();
  };
  const addOne = async () => {
    setBusy(true);
    try {
      await api.post("/testimonials", {
        name: "New Student",
        role: { en: "", te: "" },
        message: { en: "", te: "" },
        rating: 5,
        photo_url: "",
        published: false,
        order: items.length,
      });
      load();
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-2xl text-navy">Testimonials ({items.length})</h3>
        <button data-testid="testimonial-add" onClick={addOne} disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold text-black font-semibold hover:bg-navy hover:text-white transition-colors">
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      {items.map((t, idx) => (
        <div key={t.id} data-testid={`testimonial-row-${idx}`} className="bg-white rounded-2xl border border-slate-200 p-5">
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Student Name" value={t.name} onChange={v => update(t.id, { name: v })} />
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Rating</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => update(t.id, { rating: n })}
                    className={`p-1 rounded ${n <= (t.rating || 0) ? "text-gold" : "text-slate-200"} hover:text-gold`}
                  >
                    <Star className="w-6 h-6" fill="currentColor" />
                  </button>
                ))}
                <span className="ml-2 text-sm text-slate-500">{t.rating}/5</span>
              </div>
            </div>
            <Field label="Role / Course (EN)" value={t.role?.en} onChange={v => setBilingual(t.id, "role", "en", v)} />
            <Field label="Role / Course (TE)" value={t.role?.te} onChange={v => setBilingual(t.id, "role", "te", v)} />
            <Field label="Message (EN)" textarea value={t.message?.en} onChange={v => setBilingual(t.id, "message", "en", v)} />
            <Field label="Message (TE)" textarea value={t.message?.te} onChange={v => setBilingual(t.id, "message", "te", v)} />
            <Field label="Photo URL" value={t.photo_url} onChange={v => update(t.id, { photo_url: v })} />
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Display Order</label>
              <input type="number" value={t.order || 0} onChange={e => update(t.id, { order: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-gold outline-none text-sm" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={!!t.published}
                onChange={e => update(t.id, { published: e.target.checked })}
                className="w-4 h-4"
              />
              Published on public site
            </label>
            <div className="flex gap-2">
              <button onClick={() => removeOne(t.id)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
              <button onClick={() => saveOne(t)} data-testid={`testimonial-save-${idx}`} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-navy text-white text-sm font-semibold hover:bg-gold hover:text-black transition-colors">
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}



function DemosTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => { setLoading(true); api.get("/demo-bookings").then(r => setItems(r.data)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    try { await api.put(`/demo-bookings/${id}/status`, { status }); load(); toast.success(`Marked ${status}`); }
    catch { toast.error("Update failed"); }
  };
  const remove = async (id) => {
    if (!window.confirm("Delete this demo booking?")) return;
    await api.delete(`/demo-bookings/${id}`); load();
  };

  const statusColors = {
    new: "bg-blue-50 text-blue-700 border-blue-200",
    contacted: "bg-amber-50 text-amber-700 border-amber-200",
    done: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-2xl text-navy">Demo Class Bookings ({items.length})</h3>
        <button onClick={load} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-100">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> :
        items.length === 0 ? <div className="text-sm text-slate-500 bg-white p-8 rounded-xl border">No demo bookings yet.</div> :
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map(b => {
            const cleanPhone = (b.phone || "").replace(/[^0-9+]/g, "");
            const waPhone = (b.phone || "").replace(/[^0-9]/g, "");
            return (
              <div key={b.id} data-testid={`demo-row-${b.id}`} className="bg-white rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-display font-bold text-navy truncate">{b.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{b.course || "Any course"}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${statusColors[b.status] || statusColors.new}`}>
                    {b.status || "new"}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-sm text-slate-700">
                  <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-gold" /> {b.date} · <Clock className="w-3.5 h-3.5 text-gold" /> {b.time}</div>
                  <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-gold" /> {b.phone}</div>
                  {b.notes && <div className="text-xs text-slate-500 italic mt-2">"{b.notes}"</div>}
                  <div className="text-[10px] text-slate-400 mt-1">{new Date(b.created_at).toLocaleString()}</div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  <a href={`tel:${cleanPhone}`} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-navy text-white font-semibold hover:bg-gold hover:text-black transition-colors">
                    <Phone className="w-3 h-3" /> Call
                  </a>
                  <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-[#25D366] text-white font-semibold hover:opacity-90 transition-opacity">
                    <MessageCircle className="w-3 h-3" /> WhatsApp
                  </a>
                  {b.status !== "contacted" && <button onClick={() => setStatus(b.id, "contacted")} className="text-xs px-2 py-1.5 rounded-lg text-amber-700 hover:bg-amber-50">Mark Contacted</button>}
                  {b.status !== "done" && <button onClick={() => setStatus(b.id, "done")} className="text-xs px-2 py-1.5 rounded-lg text-green-700 hover:bg-green-50">Mark Done</button>}
                  <button onClick={() => remove(b.id)} className="text-xs px-2 py-1.5 rounded-lg text-red-600 hover:bg-red-50 ml-auto">
                    <Trash2 className="w-3 h-3 inline" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      }
    </div>
  );
}
