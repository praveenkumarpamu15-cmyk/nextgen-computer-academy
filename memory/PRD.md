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
