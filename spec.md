# Specification

## Summary
**Goal:** Build a simplified local job matching platform where authenticated users can create profiles, providers can post jobs, and workers can apply, with “local” matching based on user-entered area text (no maps/GPS).

**Planned changes:**
- Add Internet Identity sign-in/out and use the authenticated Principal as the account identifier for all user-owned records.
- Implement profile management (create/view/edit) with role (Worker/Provider) and an area field, plus optional bio/contact, with public read-only viewing for other users.
- Implement provider job listings CRUD (create/view/edit/delete) plus close/reopen, including title, description, area, category/tags, and status; enforce role/ownership permissions.
- Implement applications workflow: workers apply once per open job; providers review applicants and accept/reject; show application status to both parties; highlight “local” matches using simple area normalization.
- Persist profiles, jobs, and applications in a single Motoko actor using stable storage across upgrades; expose a minimal typed API for CRUD and list/detail queries with authorization checks.
- Build core frontend screens and navigation (Browse Jobs, Auth entry, My Profile, Provider: My Jobs + applicant review, Worker: My Applications, Job detail + apply) with React Query loading/error states and cache invalidation.
- Apply a coherent UI theme across pages using a consistent non-blue/purple primary palette and shared typography/layout/component styling.

**User-visible outcome:** Users can sign in with Internet Identity, create a worker/provider profile with an area, browse and filter open jobs, providers can manage job postings and applicants, workers can apply and track application statuses, and the UI consistently highlights area-based “local” matches.
