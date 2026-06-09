# Threat Model

## Project Overview

Publicly deployed pnpm monorepo with a React/Vite frontend and an Express 5 API. The production app is a personal portfolio that also exposes live demos backed by server-side Airtable, Anthropic, OpenWeatherMap, and email integrations. There is no centralized authentication layer in the current codebase; any protection must therefore be enforced directly at each route.

## Assets

- **Third-party secrets and API quotas** — Airtable, Anthropic proxy, OpenWeatherMap, and Resend credentials live on the server and can be abused if public endpoints proxy arbitrary or excessive requests.
- **Portfolio data and inbound contact content** — project metadata and contact submissions are stored via Airtable and should not be writable in unintended ways.
- **Recruiting transcripts and alerts** — candidate conversations, scores, and email alerts contain personal data and internal recruiting signals.
- **École TSA records** — the TSA demo handles especially sensitive student-related data including names, parent email addresses, notes, behavior logs, absences, mood tracking, planning, and family communication content.

## Trust Boundaries

- **Browser to Express API** — all `/api/*` requests originate from an untrusted client and require server-side validation, authorization, and abuse controls.
- **Express API to Airtable** — the server writes and reads data using privileged Airtable tokens; any missing access control on API routes can become full read/write access to backing tables.
- **Express API to external services** — `/api/chatbot-recruteur`, `/api/weather`, and email alerts spend third-party quota and may disclose or transform user-controlled content.
- **Public to restricted/internal demos** — `/demos/*` routes are publicly reachable on the deployment, so any “internal”, “admin”, or “password protected” assumption must be enforced server-side rather than only in the browser.
- **Production vs dev-only artifacts** — `artifacts/mockup-sandbox/**` is dev-only by platform assumption and should usually be ignored unless production reachability is demonstrated.

## Scan Anchors

- Production API code: `artifacts/api-server/src/app.ts`, `artifacts/api-server/src/routes/**`
- Public frontend entry points: `artifacts/developer-portfolio/src/main.tsx`, `artifacts/developer-portfolio/src/App.tsx`
- Highest-risk surface: `artifacts/developer-portfolio/src/pages/tsa/**` + `artifacts/api-server/src/routes/tsa.ts`
- Other public server-backed demos: `chatbot-recruteur`, `annuaire`, `weather`, plus contact form and project loading routes
- Dev-only by default: `artifacts/mockup-sandbox/**`, generated/build output under `dist/**`

## Threat Categories

### Spoofing

Because the deployment is public and the codebase has no shared authentication middleware, any route that is meant for staff, internal use, or a specific user must verify identity on the server. Client-side password prompts, hidden forms, or UI-only controls do not establish trust.

### Tampering

Public write routes can directly modify Airtable-backed records. The application must ensure only authorized actors can create or change restricted records, and must bind updates to the correct owner or role rather than trusting client-supplied identifiers.

### Information Disclosure

The API must not expose sensitive Airtable-backed content to unauthenticated callers. This is especially important for the École TSA demo, where disclosure would expose student support data and family contact details, and for recruiting flows where transcripts and evaluations may contain personal information.

### Denial of Service

Any public route that consumes external API quota or expensive third-party actions must have abuse controls sized for internet exposure. In-memory throttles reduce basic spam but do not provide durable protection across restarts or multiple instances.

### Elevation of Privilege

The main privilege-escalation risk in this project is treating client-side state as authorization. All admin, internal, or restricted functionality must be enforced server-side before reading or mutating protected records, and server integrations must never assume that a caller who can reach a frontend route is entitled to the underlying data.