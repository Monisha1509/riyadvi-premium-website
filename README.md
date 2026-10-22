# Riyadvi Software Technologies — Premium Full-Stack Website V8.5.4

A responsive black-and-gold corporate website built with React, Vite, React Three Fiber/Three.js and an Express API backed by MongoDB. The implementation follows the provided Riyadvi assignment structure and screenshot composition while clearly labelling illustrative case studies, metrics, testimonials and job listings that have not been independently verified.

> **Release-readiness note:** See [`ASSIGNMENT-COMPLIANCE-AND-RELEASE-CHECKLIST.md`](./ASSIGNMENT-COMPLIANCE-AND-RELEASE-CHECKLIST.md) for the assignment-by-assignment verification plan. Code implementation is not proof of live deployment; the checklist identifies the required external setup and QA steps.

## Project structure

```text
frontend/   React + Vite website, 3D scenes, routes and forms
backend/    Express REST API, MongoDB model, validation, admin authentication
README.md
```

## Features

- V8.5.4 refinement: connected-sphere hero with travelling connection pulses and scroll-linked tilt, six-stage transformation story, click-only service-card flipping, route/scene lazy loading, and a shared gold studio lighting system.
- Premium black `#000000` / gold `#D4AF37` multi-page experience with purposeful service visuals, interactive technology ecosystem, reusable case-study presentation, accessible company timeline, reviews carousel, lead generation, contact and footer. Metrics and illustrative portfolio claims are explicitly marked for verification.
- Responsive multi-page routing: Home, Services and six service details, Portfolio and case studies, About, Blog and article details, Careers and job details, Contact, Consultation, Business Health Checkup, Project Planning Guide, Admin, Privacy, Terms and 404.
- Interactive Three.js / React Three Fiber / Drei technology scenes, GSAP scroll reveals, CSS micro-interactions, and reduced-motion support.
- Floating website assistant. It uses the Google Gemini generateContent API through the backend when `GEMINI_API_KEY` is supplied; without a key it uses a clearly limited guided response mode.
- REST endpoints for contact, consultation, health-checkup, guide leads and career applications; server-side validation and MongoDB persistence.
- Secure admin login using JWT and dashboard aggregates based on stored leads.
- Resume upload restricted to PDF/Word MIME types and configured size limit.
- Search and category filtering for blog posts; filters for portfolio and careers.
- Downloadable Software Project Planning Guide PDF.
- SEO description, responsive layouts, security middleware, rate limiting, CORS, health endpoint and tests.

## Requirements

- Node.js 22 recommended
- npm 10+
- MongoDB local or MongoDB Atlas connection string

## Local setup

1. Install Node.js if needed.
2. From this repository root run:

   ```bash
   npm install
   ```

3. Copy `backend/.env.example` to `backend/.env` and configure at least `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `FRONTEND_URL`.
4. In `frontend/.env` (create it), set:

   ```env
   VITE_API_URL=http://localhost:4000
   ```

5. Start the app from the root:

   ```bash
   npm run dev
   ```

   Frontend: `http://localhost:5173`  
   Backend: `http://localhost:4000`  
   Health: `http://localhost:4000/api/health`

The API can start in local development without MongoDB, but it deliberately returns HTTP 503 for database-backed submissions until a database connection is available. It does not pretend to persist records in memory.

## Environment variables

See `backend/.env.example`. Important values:

- `MONGODB_URI`: local or Atlas connection string.
- `FRONTEND_URL`: exact deployed frontend origin; comma-separated origins are supported.
- `JWT_SECRET`: unique random secret, at least 32 characters in production.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: initial admin credentials. For production, use a unique strong password; a bcrypt hash can also be supplied as `ADMIN_PASSWORD`.
- `UPLOAD_DIR`, `MAX_UPLOAD_MB`: resume storage settings.
- `GEMINI_API_KEY`, `GEMINI_MODEL`: optional Gemini assistant integration. Never put this key in frontend variables.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `NOTIFICATION_EMAIL`: optional email notification delivery. If SMTP is not configured, submissions are still stored but no email is sent.

## API overview

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | API and database health |
| GET | `/api/services` | Public service index from MongoDB |
| GET | `/api/services/:slug` | Public service detail |
| GET | `/api/portfolio` | Public portfolio index from MongoDB |
| GET | `/api/portfolio/:slug` | Public case study detail |
| GET | `/api/blog` | Public article index from MongoDB |
| GET | `/api/blog/:slug` | Public article detail |
| GET | `/api/careers` | Public job index from MongoDB; accepts department/designation/experience filters |
| GET | `/api/careers/:slug` | Public job detail |
| POST | `/api/contact` | Save contact enquiry |
| POST | `/api/consultation` | Save consultation request |
| POST | `/api/health-checkup` | Save health-checkup intake |
| POST | `/api/lead-magnet` | Save guide lead |
| POST | `/api/applications` | Save career application; multipart form supports resume |
| POST | `/api/assistant/chat` | Assistant response; external AI if configured, guided mode otherwise |
| POST | `/api/admin/login` | Admin login |
| GET | `/api/admin/dashboard` | Protected dashboard counts and recent leads |
| GET | `/api/admin/leads` | Protected search, type filter, pagination and CSV export |
| GET | `/api/admin/applications` | Protected career applications list |
| GET | `/api/admin/applications/:id/resume` | Protected resume download |
| PATCH | `/api/admin/leads/:id/status` | Protected lead status update |

## Testing

Install dependencies once from the repository root (npm workspaces are configured):

```powershell
npm install
npm test
npm run build
npm run seed -w backend
```

The seed command requires a reachable MongoDB instance configured in `backend/.env`. For isolated package debugging, use `npm test -w frontend` or `npm test -w backend`.

Backend tests cover validation, resume MIME/size/signature rules, health response, 404 behavior, admin route protection, and the explicit no-database response. Tests do **not** prove that a real MongoDB/Atlas instance is reachable or that a cloud deployment is live. After configuring MongoDB, submit test leads and verify records in the database before production acceptance.

## Deployment outline

### Backend (Render)

- Create a Web Service from this repository.
- Root directory: `backend` (or use the included `render.yaml` blueprint at repository root).
- Build command: `npm install` (monorepo root installation is preferred if using the root workspace setup).
- Start command: `npm run start -w backend` from repository root, or `npm start` when the service root is `backend` and dependencies have been installed there.
- Configure all required environment variables from `backend/.env.example` in the host dashboard.
- Use a managed MongoDB Atlas database and allow the backend host to connect to it.

### Frontend (Vercel)

- Import the repository into Vercel.
- Root directory: `frontend`.
- Build command: `npm run build`.
- Output directory: `dist`.
- Add `VITE_API_URL` pointing to the deployed backend origin, e.g. `https://YOUR-API-HOST` (no `/api` suffix).
- Add SPA rewrite configuration via `frontend/vercel.json` so direct routes work.
- Set backend `FRONTEND_URL` to the exact Vercel domain.

### Production acceptance checklist

- Verify `/api/health` reports `database: connected`.
- Submit a contact enquiry and confirm a record exists in MongoDB.
- Verify admin login and that the dashboard shows the real record.
- Verify resume upload and storage permissions before accepting applications.
- Configure a persistent/private file-storage service for production resumes; local disk can be ephemeral on some hosts.
- Configure `GEMINI_API_KEY` and optionally `GEMINI_MODEL` only in the backend environment to enable Gemini-powered assistant responses.
- Replace or verify all illustrative portfolio entries, milestones, client logos, testimonials and careers content.
- Review Privacy and Terms templates with the company before collecting real personal information.
- Run Lighthouse and test desktop/mobile on the actual deployed domain.

## AI tools used (assignment requirement)

This section records the AI-assisted workflow. Keep it accurate to the tools and work actually used; revise it before interview submission if your personal workflow differs.

### ChatGPT
- **Purpose:** Requirements breakdown, debugging support, code review, test planning, documentation and troubleshooting the Gemini assistant integration and chat scrolling.
- **Example prompt:** “Review this React/Express full-stack project against the Riyadvi interview assignment. Identify missing requirements, explain the root cause of bugs, and propose small, testable changes without breaking existing features.”
- **What was generated:** Troubleshooting hypotheses, code-change proposals, QA checklists, documentation and targeted implementation assistance.
- **Manual changes / verification:** The project owner must review diffs, run the app, validate UI behavior, configure environment variables, test MongoDB persistence and confirm the actual deployed build.
- **Why selected:** Useful for iterative debugging, comparing a large brief against project structure and generating focused documentation.

### Claude
- **Purpose:** AI-assisted drafting and iteration of React UI, page structure, reusable components and design refinements (as used in the project's earlier development workflow).
- **Example prompt:** “Build a premium black-and-gold multi-page React website with reusable service and case-study templates, responsive interactions and a clear Express API integration. Preserve existing routes and avoid replacing real application logic with static mockups.”
- **What was generated:** Initial implementation ideas and code drafts for interface/components and project organization.
- **Manual changes / verification:** Generated code was integrated with the existing route/component structure and iteratively debugged. Review and test the final local version before claiming every generated change was manually verified.
- **Why selected:** Suitable for longer coding iterations and editing multiple related project files.

### Google Gemini API
- **Purpose:** Runtime AI assistant responses from the website backend.
- **Example prompt:** The backend sends a system instruction to answer as the Riyadvi Software Technologies website assistant, use the user's latest message, and avoid inventing company facts.
- **What was generated:** Assistant responses at runtime through the Gemini `generateContent` API.
- **Manual changes / verification:** API key and model are configured only in the backend environment; fallback behavior is shown if the provider cannot be reached.
- **Why selected:** Provides a live generative response endpoint for the in-site assistant.

### 3D and animation libraries
- **Three.js + React Three Fiber + Drei:** Procedural interactive 3D scenes and reusable scene helpers.
- **GSAP + ScrollTrigger:** Scroll-linked storytelling and motion where appropriate.
- **Lenis:** Smooth-scroll integration (check reduced-motion and mobile behavior when testing).
- **CSS transitions / Motion:** UI micro-interactions and transitions.
- **Manual optimization:** Scene visibility, mobile/reduced-motion fallbacks, lazy loading and error boundaries are included in the implementation. Confirm actual frame rate and loading behavior on target devices.

### Third-party assets
- Google Fonts (Inter / Montserrat) are remotely loaded.
- The bundled project-planning guide is an included local PDF.
- Client names/logos, metrics, testimonials and sample jobs/projects must be confirmed as authorized and accurate by the company before production use. Sample content is not proof of real client outcomes.

## Known limitations / before production

- MongoDB persistence requires a real local or managed MongoDB connection; no real database was available during packaging, so cloud database persistence cannot be claimed as verified here.
- Hosting account creation, GitHub push, DNS, secrets and live deployment require the account owner. No live URLs are fabricated in this repository.
- The assistant's Gemini mode requires `GEMINI_API_KEY`; guided mode works without it.
- Portfolio examples, blog entries and careers listings are sample content and must be reviewed/approved before representing them as official company records.
- Resume uploads are stored on the backend's configured disk directory in this version. Use private object storage and retention/deletion policies for production deployments.
- The privacy and terms pages are starter templates, not legal advice.
- Email notifications are implemented but require SMTP configuration; calendar booking (Calendly) is not connected until the company supplies a booking URL/provider.
- This project should receive a full dependency audit, accessibility audit and production security review before handling real leads.


## Visual update — portfolio, client references and contact

The latest UI pass adds a premium portfolio index with category filters, project search, 3D hero scene, custom device-style case-study artwork, project tags and a responsive case-study grid. The sample project list now includes the additional names referenced in the assignment. These are clearly treated as illustrative portfolio concepts until actual client deliverables and approvals are verified.

The homepage also includes text-based client/project reference wordmarks, review cards using only the review text and reviewer names visible in the user-provided screenshots, reference metrics (700+, 300+, 1,000+, 100%), and a fixed call/WhatsApp contact dock using the contact number already configured in the project. Confirm that all company figures, review permissions, client logo usage and contact details are approved before public launch. Do not add invented reviews or unverified client results.

The 3D scene has been upgraded with a metallic faceted core, orbit rings, satellites, circuit nodes and responsive orbit controls. Full browser/build verification still needs to be run in the local development environment because dependency installation was not available in the generation environment.


## V5 implementation notes

- The former blue/purple marketing illustration screenshot has been removed from the homepage and replaced with a React Three Fiber/WebGL analytics scene.
- Portfolio project cards now have a two-sided, perspective flip interaction with a case-study action. Touch users can tap “Explore back side”; keyboard users can focus the card controls.
- The assistant uses Gemini through the backend with `GEMINI_API_KEY` and `GEMINI_MODEL` (default `gemini-3.5-flash-lite`). The key must be configured only in the backend environment. When no key is configured, the assistant uses limited guided responses and does not claim Gemini is active.
- The displayed reviews remain limited to the two review excerpts supplied in the reference screenshots; add only verified additional reviews from the official Google Business Profile.
- The map and company metrics are reference-based visual sections. Confirm factual locations and figures before public launch.

---

## V8.4 implementation notes

This revision prioritizes interaction correctness, purposeful 3D, route loading and lead-flow transparency. The assignment PDF defines the required homepage copy, six-stage transformation journey, six service areas, technology ecosystem, case-study structure, “Since 2021” timeline, lead-generation flows, and evaluation weights.

### V8.4 features

- Exact assignment headline/supporting copy and CTA labels on the homepage.
- Connected Digital Sphere with larger node hit targets, six named business concepts, selected connection pulses, scroll-linked scale, reduced-motion behavior and a low-cost mobile/static fallback.
- Lazy route imports and lazy 3D scene imports; `vite.config.js` defines React, Three.js, R3F, GSAP and Motion vendor chunk groups.
- Lenis/GSAP ScrollTrigger coordination with teardown on route changes and a reduced-motion bypass.
- Six-stage Digital Transformation story with click controls, keyboard arrow navigation, desktop pinning and mobile normal-flow layout.
- Distinct service-detail 3D visuals for browser, phone, growth chart, immersive rings, rotatable model and layered UI; service cards only flip through explicit controls.
- Interactive Technology Ecosystem with selectable technology descriptions and a persistent non-3D list.
- Reusable CSS 3D case-study device presentation and placeholders for verified results/approved visuals.
- “Since 2021” company timeline with explicit placeholders instead of invented milestones.
- Multi-step Business Health Checkup with a transparent indicative score calculated server-side from scored answers; the score is not a certified audit.
- Planning Guide lead magnet requires name, company, email and phone; the included PDF is served as a public static resource.
- Admin lead status workflow: `new` → `contacted` → `qualified` → `closed`; status changes record timestamp and administrator identity.
- Tighter rate limits for public forms, admin login and assistant; resume MIME/extension matching and random server-generated filenames; lead indexes for common queries.
- Short route entrance, focus-visible styling, reduced-motion CSS, responsive fallbacks, review-carousel pause-on-hover/focus and corrected previous/next behavior.

### 3D and animation libraries: visible contribution

- **Three.js:** WebGL scene geometry, materials, connected lines and 3D device/service objects.
- **React Three Fiber v8:** React-managed rendering for hero, service, technology and supporting scenes.
- **Drei v9:** `Environment`/`Lightformer`, `Html`, `Instances`, `OrbitControls`, and `Float` helpers where appropriate.
- **GSAP:** coordinated scroll-triggered scene scale and reveal timelines.
- **GSAP ScrollTrigger:** pinned desktop transformation story, scroll-linked hero behavior and case-study motion.
- **Lenis:** smooth wheel scrolling coordinated with ScrollTrigger from the shared `SmoothScroll` component; disabled when reduced motion is requested.
- **Motion / CSS transitions:** small interface transitions and card/route feedback; CSS provides static fallbacks and reduced-motion overrides.

### Environment variables

Frontend: `VITE_API_URL` only. Never add Gemini or SMTP credentials to `VITE_*` variables.

Backend: `MONGODB_URI`, `FRONTEND_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `UPLOAD_DIR`, `MAX_UPLOAD_MB`, optional `GEMINI_API_KEY` / `GEMINI_MODEL`, and optional SMTP settings (`SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `NOTIFICATION_EMAIL`). Copy `.env.example` to `.env` locally and use the hosting provider's secret manager in production.

### Database notes

The backend uses the `Lead` Mongoose model. Health-checkup records include `healthAnswers` and a server-calculated `healthScore`. The schema includes indexes on creation date, lead type/status, and email/date. A real MongoDB connection is required to verify persisted lead submissions; the app intentionally returns 503 when the database is disconnected.

### API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | API/database health |
| GET | `/api/services` | Public service index from MongoDB |
| GET | `/api/services/:slug` | Public service detail |
| GET | `/api/portfolio` | Public portfolio index from MongoDB |
| GET | `/api/portfolio/:slug` | Public case study detail |
| GET | `/api/blog` | Public blog index |
| GET | `/api/careers` | Public job index from MongoDB; accepts department/designation/experience filters |
| GET | `/api/careers/:slug` | Public job detail |
| POST | `/api/contact` | Store contact enquiry |
| POST | `/api/consultation` | Store consultation request |
| POST | `/api/health-checkup` | Store answers and server-calculated score |
| POST | `/api/lead-magnet` | Store lead before guide access |
| POST | `/api/applications` | Store application and validated resume metadata |
| POST | `/api/assistant/chat` | Gemini when configured; guided fallback otherwise |
| POST | `/api/admin/login` | Rate-limited administrator login |
| GET | `/api/admin/dashboard` | Authenticated lead dashboard |
| PATCH | `/api/admin/leads/:id/status` | Authenticated persisted status transition |

### Performance strategy

- Lazy page imports and lazy 3D component imports.
- Manual Vite chunk groups for React, Three.js, R3F, GSAP and Motion.
- IntersectionObserver scene mounting and low-DPR mobile/static fallbacks.
- Reused scene geometry/materials where practical, instanced technology nodes, and no remote environment HDRI dependency in the hero.
- Reduced-motion preference disables continuous hero motion and pinned transformation behavior.
- Static CSS visual alternatives are provided for mobile or scene errors.

### Third-party assets and factual content

- The Planning Guide PDF and client-logo images are included in `frontend/public/` and should be confirmed as approved for public use.
- No new client outcome, review, award, team member or company milestone is asserted by this revision.
- Portfolio entries are marked illustrative in the existing project data. Case-study results and approved screenshots remain placeholders where source data is not present.
- Only two review examples exist in the supplied website content, so the carousel remains at two rather than inventing additional reviews.

### AI Tools Used — candidate must complete with real usage

> **Do not submit the placeholders below unchanged.** Record the tools you actually used, the prompts you actually sent, what each tool generated, and what you manually changed. This section is intentionally a fill-in template to satisfy the assignment without fabricating AI usage.

#### [PLACEHOLDER — Tool name, e.g. Claude / Cursor / ChatGPT]

- **Purpose:** [Describe the actual task and why AI assistance was appropriate.]
- **Example prompt:** [Paste a real prompt or an accurate excerpt from your conversation.]
- **Generated output:** [Name the actual files, tests, concepts or documentation created.]
- **Manual changes:** [Explain your own code review, edits, debugging and integration decisions.]
- **Validation:** [Record actual commands/tests/browser checks and their real outcomes.]
- **Why selected:** [Explain why this tool suited the task compared with alternatives.]

#### Gemini runtime assistant

- **Purpose:** Runtime visitor assistance for service discovery and navigation.
- **Generated output:** Assistant responses returned through the backend Gemini API when `GEMINI_API_KEY` is configured; a clearly disclosed guided-response fallback is used without a key.
- **Manual changes:** [PLACEHOLDER: document actual prompt/system-instruction changes and backend integration decisions.]
- **Validation:** [PLACEHOLDER: record a real configured-key test and fallback test if performed.]
- **Why selected:** [PLACEHOLDER: document the actual selection reason.]

### Known limitations and pre-submission checks

- Build/test execution and final bundle measurements must be recorded from the actual submission environment; do not copy estimates into the report.
- MongoDB persistence, SMTP delivery, configured Gemini responses, deployed URLs and Lighthouse scores require real environment/browser verification.
- The timeline's TBD milestones, case-study results, approved visuals, official logo rights and AI usage entries must be completed/verified by the candidate.
- The technology constellation and scene fallbacks should be checked on target browsers and real mobile hardware.
- A route lazy import from the shared `Pages.jsx` module separates route entry loading from Home, but named exports share the Pages module chunk. Further per-page extraction is a future improvement if bundle analysis justifies it.

### Future improvements

- Extract individual route components from `Pages.jsx` for finer-grained route chunks.
- Add end-to-end browser tests for form submissions, admin status persistence, and keyboard/touch 3D interactions.
- Verify production Lighthouse measurements and set route-specific performance budgets.
- Integrate approved CMS content and verified company/client assets after content owner sign-off.

## V8.4.1 targeted audit updates

### Dynamic content and seeding

The public content API reads from MongoDB models (`Service`, `Project`, `Post`, and `Job`). The frontend uses the shared `frontend/src/lib/contentApi.js` adapter and keeps local `frontend/src/data/content.js` as a fallback if the API/database is unavailable. After configuring MongoDB, run:

```powershell
cd backend
npm install
npm run seed
```

The seed script upserts the current local content by slug. Sample portfolio/job records are clearly identified as sample content; verify all project permissions, real deliverables, vacancies and results before public launch.

### Lead/admin security additions

- `GET /api/admin/leads` supports `type`, `search`, `page`, `limit`, and `format=csv` query parameters and requires an admin JWT.
- `GET /api/admin/applications` lists application records; `GET /api/admin/applications/:id/resume` serves a stored resume only after admin JWT validation.
- Resume uploads validate extension/MIME pairing, configured size limits and file signatures for PDF/DOC/DOCX. Filenames are generated server-side.
- Lead status transitions remain `new → contacted → qualified → closed`, and status updates persist in MongoDB.
- SMTP notifications are optional. A mail failure is logged and does not roll back a successfully stored lead.

### Frontend environment variables

Copy `frontend/.env.example` to `frontend/.env.local` and configure:

```dotenv
VITE_API_URL=http://localhost:4000
VITE_WHATSAPP_NUMBER=
VITE_CALENDLY_URL=
```

`VITE_WHATSAPP_NUMBER` must be the approved WhatsApp number in international format without spaces or `+`; the dock hides the WhatsApp action when it is empty. Calendly is hidden when `VITE_CALENDLY_URL` is empty. Never put Gemini or SMTP secrets in Vite variables.

### V8.4.1 test and build checklist

Run these commands in the corresponding folders after installing dependencies:

```powershell
cd frontend
npm install
npm run build
npm test

cd ..\backend
npm install
npm test
npm run seed
```

A production build, browser/device verification, Lighthouse audit and MongoDB-backed end-to-end test are not considered complete until they have been run against configured dependencies and services. Record actual output and bundle sizes rather than estimating them.

### AI Tools Used — evidence to complete with real usage

Do not claim AI-generated work as manual work. Fill these fields with your actual development history:

- **Tool:** [PLACEHOLDER — actual tool/version]
- **Purpose:** [PLACEHOLDER — research, debugging, implementation or documentation]
- **Example prompt:** [PLACEHOLDER — exact prompt used]
- **Generated output:** [PLACEHOLDER — files or suggestions produced]
- **Manual changes:** [PLACEHOLDER — review, corrections, tests and integration you personally completed]
- **Validation:** [PLACEHOLDER — commands and observed results]
- **Why selected:** [PLACEHOLDER — explain the task/tool fit]

### Suggested meaningful commit sequence

1. `fix: make service cards flip only through explicit controls`
2. `test: cover service flip keyboard and pointer behaviour`
3. `feat: add MongoDB content models for services and case studies`
4. `feat: add blog post and job content models`
5. `feat: seed reusable website content by slug`
6. `feat: expose public content list and detail APIs`
7. `feat: add frontend content API adapter with local fallback`
8. `feat: add admin lead filters pagination and CSV export`
9. `feat: protect application resume downloads with admin JWT`
10. `fix: validate resume signatures and reject mismatched uploads`
11. `feat: add Calendly configuration and service-prefilled contact form`
12. `perf: add intrinsic image dimensions and lazy logo loading`
13. `test: cover review carousel pause and resume behaviour`
14. `docs: document seed setup environment variables and audit limits`

## V8.4.4 visual/contact update

- The Home company timeline now uses alternating milestone cards around a central gold spine, with a single-column layout on small screens.
- Timeline details for 2022–2024 were transcribed from the supplied reference screenshot. Confirm the service expansion, international/Australia, and award claims with the company before production deployment; the assignment PDF itself explicitly confirms the company was founded in 2021.
- The floating WhatsApp action uses `VITE_WHATSAPP_NUMBER` when configured. If it is blank, the link still opens WhatsApp with the prepared message and lets the visitor choose a recipient. Set `VITE_WHATSAPP_NUMBER` in `frontend/.env` to route directly to the intended business account. Restart Vite after changing environment variables.

### Run locally in Windows PowerShell

From the extracted project root:

```powershell
npm install
Copy-Item frontend/.env.example frontend/.env -ErrorAction SilentlyContinue
# Edit frontend/.env and set VITE_API_URL, VITE_WHATSAPP_NUMBER, and other needed values.
npm run dev
```

The root `npm run dev` starts frontend and backend together. To run only the frontend, open a separate terminal:

```powershell
cd frontend
npm install
npm run dev
```

The Vite terminal prints the local URL (normally `http://localhost:5173`). The frontend can render with local fallback content if the API is unavailable, but database-backed forms require the backend and MongoDB to be configured.
