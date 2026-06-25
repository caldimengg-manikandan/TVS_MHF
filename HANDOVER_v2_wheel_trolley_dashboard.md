# Developer Handover v2 — MHF Wheel Trolley Dashboard (TVS)

> **Context:** v1 was delivered as a **single page**. This v2 splits it into a **multi-page app**
> with login, separates Dashboard from Edit, makes the table fully editable via a sidebar,
> and adds live KPIs with drill-down.
> **Classification:** TVS **Internal** — keep data in-browser unless a backend is approved.
> **Calculation engine, parameters, and seed data are UNCHANGED from v1** (see HANDOVER_wheel_trolley_dashboard.md).

---

## 1. Information architecture (routing)
Convert the single page into routed pages (React Router):

| Route | Page | Access |
|---|---|---|
| `/login` | Login page | public |
| `/dashboard` | Dashboard (view + KPIs) | authenticated |
| `/edit` | Edit — editable table (page 1 of the edit flow) | authenticated |
| `/edit/parameters` | Edit — global parameters (page 2 of the edit flow) | authenticated |

- Top nav with links: **Dashboard | Edit**, plus user/logout in the corner.
- "Edit as two pages" = the edit section is its own area, separate from the dashboard,
  split across two sub-pages: **(1) the editable models table**, **(2) the global parameters**.

---

## 2. Login page (`/login`)
- Email + password form, "Remember me", validation, error state.
- On success → redirect to `/dashboard`. Protect all other routes (redirect to `/login` if not authed).
- **Auth implementation — DECISION NEEDED (see Open Questions):**
  - *Option A (no backend, fastest):* client-side gate with credentials from an env/config file;
    store a session flag in `sessionStorage`. Fine for an internal demo, NOT real security.
  - *Option B (recommended for production):* small backend (Node/Express or FastAPI) issuing a
    JWT, users in a DB. Required if the app is hosted beyond one machine, given the "Internal" label.
- Default to **Option A** to keep momentum; structure the auth layer so Option B can drop in later.

---

## 3. Dashboard page (`/dashboard`) — view only
- **KPI cards at top (live / real-time):**
  - **Total Volume per Day** (sum of all rows' vol/day) — updates instantly whenever data is edited.
  - **Total Trolleys Required** (= 196 for seed data).
  - **Total Gap** (sum of per-row gaps) — color red if negative.
- **Grid:** same columns as v1 but **read-only here** (editing happens on `/edit`).
- **Click-to-drill-down:** clicking a model/row opens a **KPI detail panel** (modal or right drawer)
  showing ALL details for that selection:
  - Vol/day, Vol/hr
  - Stage-by-stage breakdown: Supplier (pieces + trolleys), Transit, Opening, POC
  - Total Required, Plant Available, Gap, Remarks
- "Real time" = the dashboard reflects edits immediately via a shared reactive store (see §6).
  If true multi-user live sync is wanted, that needs a backend (flagged in Open Questions).

---

## 4. Edit pages — fully editable
### 4a. `/edit` — editable models table
- Same grid, but **every field is editable**.
- **Click a row → a Sidebar (right drawer) opens with ALL fields of that row as editable inputs:**
  Model name, Wheel line, Vol/day, Plant Available, Remarks (and any per-row overrides).
- Inline cell editing in the grid AND full editing in the sidebar should both work and stay in sync.
- Add row / duplicate / delete. Adding a model auto-creates its Front + Rear rows.
- Changes persist (localStorage) and reflect on the dashboard live.

### 4b. `/edit/parameters` — global parameters
- Editable fields: workingHoursPerDay (16), trolleyCapacity (20), supplierHours (4),
  transitHours (1.5), openingHours (2), pocHours (0.5).
- Changing any param recalculates the whole grid + dashboard KPIs instantly.

---

## 5. Calculation engine (unchanged — restate for completeness)
```
volPerHour     = round(volumePerDay / workingHoursPerDay)
stagePieces    = volPerHour * stageHours          // supplier4 / transit1.5 / opening2 / poc0.5
trolleys(stage)= Math.ceil(stagePieces / trolleyCapacity)
totalRequired  = sum of the 4 stage trolley counts
gap            = plantAvailable - totalRequired
```
Validation: HLX 100 → 15 trolleys, Raider → 21, grand total → **196**. Keep v1 unit tests passing.

---

## 6. State management & "real-time" behavior
- Introduce a single shared store (**Zustand** or React Context) holding models + params.
- Dashboard, Edit table, sidebar, and parameters page all read/write the SAME store →
  any edit recomputes derived values and updates KPIs **instantly** across pages.
- Persist store to **localStorage** (key e.g. `mhf-trolley-state`); hydrate on load.
- Optional future: swap localStorage for a backend + websockets for genuine multi-user real-time.

---

## 7. Assumptions made (confirm or correct)
1. "Edit as two page" = edit area split into **table page + parameters page**, separate from dashboard.
2. "All fields editable in a sidebar" = clicking a row opens a **right drawer** with every field editable.
3. "Real time" = **reactive in-browser** updates (single user), not multi-user server sync.
4. "Click → show all details in KPIs" = a **drill-down detail panel** per selected model/row.
5. Login is needed but a simple client-side gate is acceptable for now (Option A).

## 8. Open questions
1. Login: simple client-side gate (Option A) or real backend auth (Option B)?
2. Real-time: single-user reactive (default) or true multi-user live sync (needs backend)?
3. Should edits be saved automatically, or behind a "Save" button per page?
4. Any role separation (viewer vs editor)?

## 9. Acceptance criteria
- Unauthenticated users are redirected to `/login`; valid login lands on `/dashboard`.
- Dashboard KPI "Total Volume per Day" and "Total Required" update instantly after any edit on `/edit`.
- Clicking a dashboard row opens a detail panel with the full stage-wise KPI breakdown.
- `/edit` table is fully editable inline AND via the row sidebar; both stay in sync and persist.
- `/edit/parameters` changes recalculate dashboard + grid live.
- Seed data still reproduces 196 total trolleys; v1 unit tests still pass.
