---
name: TSA demo (école-tsa) quirks
description: Durable quirks/decisions for the special-needs French school-management demo at /demos/ecole-tsa in the developer-portfolio artifact.
---

# TSA demo quirks

- **HMR Fast Refresh warning is benign.** `TsaContext.tsx` exports non-component helpers (e.g. `CRENEAUX`, `currentWeek`, `useTsa`) alongside the provider component, so Vite logs `Could not Fast Refresh ("X" export is incompatible)`. This is expected, not a bug. Trust `pnpm --filter @workspace/developer-portfolio run typecheck` over HMR/cartographer log noise; restart the web workflow if HMR state looks stale.
  **Why:** wasted time chasing these as if they were real errors.
  **How to apply:** when reviewing this artifact's logs, ignore Fast-Refresh-incompatible warnings and stale syntax errors from earlier intermediate edits; verify with typecheck.

- **Persistence is a single JSON blob.** Whole `TsaState` is JSON-stringified to localStorage (`tsa_app_state`) and POSTed to one Airtable field. Student photos are base64 JPEG data URLs (resized ~200px) stored inline in this blob — keep photos small and wrap the localStorage write in try/catch (quota). Airtable remains the reliable source if localStorage quota is exceeded.
