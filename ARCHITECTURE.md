## Advanced Laravel Lead Management System (LMS)

This document captures the high-level plan for building a full-featured, API-first Lead Management System with a Laravel backend and a Next.js frontend.

### 1. Backend Architecture (Laravel 11)

- **API Surface**
  - Versioned routes under `/api/v1`.
  - REST resources for `leads`, `users`, `activities`, `notes`, `products`, `sources`, `imports`, `exports`.
  - Response transformer layer (Laravel API Resources) to keep contracts stable across clients.
- **Authentication & Authorization**
  - Laravel Sanctum for SPA token auth; issue long-lived tokens with ability scopes (`view-leads`, `assign-leads`, `manage-users`).
  - Policies: `LeadPolicy`, `UserPolicy`, `ActivityPolicy`.
  - Gates for cross-cutting rules (e.g., `reassign-lead`, `delete-user`) enforced at controller middleware level.
- **Database (PostgreSQL)**
  - Core tables: `users`, `teams`, `leads`, `lead_status_histories`, `lead_sources`, `products`, `lead_product`, `activities`, `notes`, `attachments`, `imports`, `import_rows`.
  - Polymorphic relations:
    - `activities (actor_type, actor_id, subject_type, subject_id)`.
    - `notes (notable_type, notable_id)`.
  - Enum columns via PostgreSQL check constraints for lead stage (`new`, `qualified`, `contacted`, `converted`, `lost`) and roles (`sales_rep`, `manager`, `admin`).
- **Indexing & Performance**
  - Composite indexes:
    - `leads (status, assigned_to_user_id)`.
    - `leads (territory_code, status)` for territory routing.
    - `activities (subject_type, subject_id, created_at)`.
    - `notes (notable_type, notable_id)`.
  - Partial indexes for active users/leads to speed up dashboards.
  - Query caching (Redis) for reference tables: `lead_sources`, `products`, `teams`. Cached via repository layer with tag-based invalidation.
- **Caching & Queues**
  - Redis handles cache, queues, and broadcasting presence channels.
  - Horizon monitors scoring jobs, imports, notification fan-out.

### 2. Advanced Business Logic

- **Automated Lead Scoring Engine**
  - Scoring profile stored in `lead_scoring_rules` table with weighted criteria.
  - Criteria examples: `source_weight`, `engagement_weight`, `deal_size_weight`.
  - Service: `LeadScoringService` calculates score 0-100; persists snapshot to `lead_scores` table.
  - Trigger paths:
    - Scheduled Artisan command `php artisan leads:score` (hourly).
    - Event listeners on `LeadUpdated`, `ActivityLogged` for near-real-time recalculation.
    - Emits `LeadScoreUpdated` event for websockets and audit.
- **Lead Assignment & Routing**
  - Strategy interface `LeadAssignmentStrategy` with implementations:
    - `RoundRobinAssignment` rotates through available reps within team.
    - `TerritoryAssignment` matches based on postal code / territory mapping table.
  - Assignment orchestrated in `LeadAssignmentService`; invoked inside `LeadCreated` listener and via manual reassignment endpoint.
  - Manager override logged in activities with immutable metadata.
- **Real-Time Activity Timeline**
  - Domain events: `LeadCreated`, `LeadStatusChanged`, `NoteAdded`, `TaskCompleted`.
  - Corresponding listeners push Activity records and broadcast via Laravel Echo channels (`private.leads.{id}`).
  - Activity model enforces immutability (no updates, only inserts).
- **Data Import/Export**
  - Maatwebsite/Laravel-Excel for chunked imports (batch size 1,000 rows) with queue-based processing.
  - Import wizard endpoint uploads file → stored on S3 (or disk) → `imports` record tracks progress.
  - Row-level validation with customizable mapping templates per tenant.
  - Export endpoints stream CSV/XLSX with queued writer jobs to avoid timeouts.
- **Notifications**
  - Multi-channel (database + broadcast + email/SMS via notification classes).
  - Example: when a note is added, notify assigned rep via Echo & optional email digest.

### 3. Frontend (Next.js 15 + React 18)

- **Foundation**
  - Next.js App Router, JavaScript, TailwindCSS/Chakra for design system, TanStack Query for data fetching with caching + optimistic updates.
  - Authentication via Sanctum SPA cookie; Next middleware guards protected routes.
- **Interactive Sales Dashboard**
  - KPIs: lead conversion rate, average time-to-convert, pipeline volume by stage.
  - Charts using Recharts/Chart.js; data pulled from `/api/v1/metrics/...`.
  - Filters for time range, team, territory stored in URL search params.
- **Lead Workspace**
  - Kanban board for stages (drag & drop triggers `/leads/{id}/status`).
  - Detail view with activity timeline (WebSocket updates), notes editor, attachments.
- **Geospatial Visualization**
  - Mapbox GL JS map showing leads clustered by geohash; color-coded by stage.
  - Territory overlay layers for manager view; clicking a region opens lead list drawer.
- **Real-Time UX**
  - Laravel Echo client via Pusher-compatible WebSocket server (e.g., Ably or Laravel WebSockets).
  - Toasts and inline indicators when assignments or scores change.
- **Data Import/Export UI**
  - Import wizard with stepper: upload → map → validate preview → run job; polls `/imports/{id}` for progress.
  - Export modal triggers queued job, downloads pre-signed URL once ready.

### 4. DevOps & Quality

- Feature tests for API flows (Pest/PHPUnit) with Sanctum-authenticated requests.
- Contract tests to ensure API responses match frontend expectations (schematized via OpenAPI/Stoplight).
- CI pipeline: run PHPStan, Pint, Pest, ESLint, Playwright smoke tests.
- Deployment: Laravel Vapor or Dockerized ECS; Next.js deployed on Vercel/Netlify hitting API domain.

This blueprint ensures the LMS highlights robust backend engineering, sophisticated business logic, and polished real-time UX capabilities.

