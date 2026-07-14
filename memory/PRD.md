# NextGen Computer Academy — PRD

## Problem Statement
Build a premium production-ready bilingual (English + Telugu) website for NextGen Computer Academy per the master prompt: all sections, animations, admission form, AI chat, admin panel, editable contact, Google Maps, WhatsApp/Call floating buttons, responsive.

## User Personas
- **Prospective Student / Parent** — Reads bilingual content, browses courses, submits online admission, contacts via WhatsApp/Call/Email.
- **Academy Owner / Admin** — Logs into /admin, edits all site content (identity, welcome/about/vision, why-choose-us, courses, contact, Google Maps, AI assistant info), views admissions with photos, manages gallery.

## Architecture
- **Backend** FastAPI + MongoDB. JWT admin auth (bcrypt). Emergent Universal LLM Key powers Claude Sonnet 4.6 streaming chat. Emergent Object Storage for admission photos + gallery images.
- **Frontend** React 19 + Tailwind + Shadcn UI. Global AppContext for language (en/te) and content. Sonner toasts. Framer-motion-style CSS animations.

## Implemented (2026-07-14)
- Bilingual public homepage: Navbar (sticky glass), Hero, About, Courses (9 default courses), Why Choose Us (6 items), Vision, Gallery, Admission Form (with photo upload), Contact (with Google Maps embed, Call/WhatsApp/Directions/Email buttons), Footer.
- Language toggle (English ⇄ Telugu) across all content; Noto Sans Telugu font.
- Floating widgets: AI Chat (streaming via fetch), WhatsApp, Call.
- AI Chat Assistant: bilingual, Claude Sonnet 4.6, aware of live courses/contact/timings.
- Online Admission: 11 fields + photo upload → Emergent Object Storage → success screen.
- Admin Panel `/admin` (JWT login): 4 tabs — Content (all identity, bilingual copy, why-choose-us list, contact, Google Maps embed, AI info), Courses (CRUD), Admissions (list with photos, delete), Gallery (upload/delete).
- Owner-only auth-gated photo serving with query-param auth for `<img>` tags.

## Credentials
- Admin: `admin@nextgen.local` / `NextGen@2025` (see /app/memory/test_credentials.md)

## Prioritized Backlog
- **P1** — Email/SMS notification to admin on new admission submission.
- **P1** — Bulk export admissions to CSV/Excel.
- **P2** — Public testimonials section (owner-editable).
- **P2** — Course-level detail page with syllabus.
- **P2** — Simple SEO meta + Open Graph tags per section.
- **P2** — Rate-limit + captcha on public admission endpoint.

## Implemented (2026-07-14 · Session 2)
- **Testimonials** — public section on homepage + full admin CRUD tab (bilingual message/role, 5-star rating, photo, published toggle, display order). 4 default testimonials seeded. Public endpoint filters to `published=true`.
- **Course Detail pages** at `/course/:slug` (or `/course/:id`) — full description, syllabus grid, learning outcomes, prerequisites, sticky sidebar CTA with fee/duration, related courses, JSON-LD Course schema.
- **Extended course model** — auto-generated URL slugs, long_desc_en/te, syllabus_en/te lists, outcomes_en/te lists, prerequisites_en/te. All editable in admin panel with per-list add/remove UI.
- **Bulk admissions export** — CSV (UTF-8 BOM so Excel opens Telugu correctly) and native XLSX. Downloaded via query-param JWT auth. Buttons + search filter in Admissions tab.
- **SEO — complete** — react-helmet-async per-page meta management; `/api/sitemap.xml` (dynamic from courses + section anchors); `/api/robots.txt`; Open Graph + Twitter Card tags; EducationalOrganization structured data (site-wide) + Course structured data (per detail page); canonical URLs; owner-editable SEO fields (title, description, keywords, OG image, canonical URL, Twitter handle) in admin panel.
- **Notification channel abstraction** — refactored `dispatch_admission_notification()` iterates `NOTIFICATION_CHANNELS` registry. Email channel active (still optional / no-ops without RESEND_API_KEY). WhatsApp channel stubbed and disabled — enabling later just needs setting `WHATSAPP_ACCESS_TOKEN` env + filling in the send helper; admission flow needs zero changes.

## Truthfulness Update (2026-07-14 · Session 3)
- **Removed all fake data from the public site.** Hero no longer shows "500+ Happy Students / 4.9 Rating / 9 Certifications". Testimonials seed removed; 4 previously-seeded fake testimonials permanently purged on backend startup.
- **Homepage Stats (owner-editable)** — new `stats` field in site content. Empty by default. Renders in hero only when owner adds real numbers via admin.
- **Success Journey section** — new timeline component on homepage. Rendered ONLY when owner adds milestones (year + bilingual title/description). No fake data.
- **Course editor extended** — added Practical Projects (bilingual) and Career Opportunities (bilingual) fields to every course. Full 8-field bilingual editor: title, short desc, long desc, syllabus, outcomes, prerequisites, projects, career opportunities + fee, duration, image URL, URL slug.
- **Course detail page** — now displays Practical Projects and Career Opportunities sections when populated.
- **Adaptive Navbar** — hides "Journey" and "Reviews" links until real content is added.

## Free Demo Booking (2026-07-14 · Session 4)
- **Public "Book a Free Demo Class" section** on homepage (`#demo`) between Trainer and Why-Choose-Us. Fully bilingual (EN + TE).
  - Fields: name, phone, preferred date (date picker, min = tomorrow), preferred time (10 slots 9AM-7PM), course of interest (dropdown from live courses), notes.
  - Optional "Join via WhatsApp" button that opens WhatsApp with a pre-filled bilingual message using the owner's WhatsApp number from admin.
  - Success screen with confirmation + WhatsApp follow-up link.
- **Backend** — new `demo_bookings` collection + endpoints (POST public, GET/PUT status/DELETE admin). Reuses `dispatch_admission_notification` pattern → sends bilingual HTML email via `_demo_email_html` to owner_notification_email on every booking (still no-ops without RESEND_API_KEY).
- **Admin → Demo Bookings tab** — lists all bookings with status badges (new/contacted/done/cancelled), quick Call & WhatsApp buttons per booking, one-click "Mark Contacted / Mark Done", delete.
- **Course model** extended with `exercises_en/te` (Practical Exercises) — 8 bilingual editable lists per course now: syllabus, outcomes, exercises, projects, career opportunities, plus prerequisites text and long description.
