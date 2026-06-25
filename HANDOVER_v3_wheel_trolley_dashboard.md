# Developer Handover v3 — MHF Wheel Trolley Dashboard (TVS)

> **Audience:** the next engineer (or future-you) picking this up.
> **Status:** data + calculation-engine correctness issues found and fixed in this pass.
> Auth, persistence, and multi-user concerns are diagnosed but **not yet implemented** —
> see §5 "Enterprise-Readiness Roadmap" for what's still open.
> **Builds on:** `HANDOVER_v2_wheel_trolley_dashboard.md` (routing/login/edit-flow architecture
> is unchanged from v2 — this pass touched data and the calculation engine only).

---

## 0. TL;DR — what was actually wrong

You asked two things: *"which models are missing"* and *"make the data more perfect."*
Short answer: **no model is missing** — all 8 client models (+ the Front/Rear split) are
present. The real problems were:

1. **5 of 8 models had the wrong `volumePerDay`.** A previous pass didn't have the client's
   source sheet and reverse-engineered plausible-looking numbers that happened to sum to the
   right *totals* but were wrong per model.
2. **The calculation engine double-rounded**, which silently drifted piece counts away from
   the source sheet (didn't change the final trolley counts in this dataset, but would in others).
3. **"Plant Available" was always blank**, so the entire gap/shortage/surplus dashboard sat at
   "Unallocated" — not broken, just never fed any data, so there was nothing to look "perfect."
4. Some dead code and a disproven scratch script were left in the repo.

All four are fixed below. Everything is verified against the client's actual PDF, not assumptions.

---

## 1. Model Volume Audit — the answer to "which models are missing"

Cross-checked every model, line-by-line, against the client's source sheet
(`HLX__wheel_trolley_Dashboard.pdf`). Nothing is missing; five volumes were wrong:

| Model | Client source (PDF) | App had (before) | Status | Fixed to |
|---|---:|---:|---|---:|
| HLX 100 | 500 /day | 500 /day | already correct | 500 |
| HLX 125 – 4 speed | 500 /day | 350 /day | wrong | 500 |
| HLX 125 – 5 speed | 500 /day | 350 /day | wrong | 500 |
| HLX 150 | 300 /day | 330 /day | wrong | 300 |
| Radeon | 200 /day | 270 /day | wrong | 200 |
| City+ DOM | 200 /day | 400 /day | wrong | 200 |
| Sport | 250 /day | 250 /day | already correct | 250 |
| Raider | 800 /day | 800 /day | already correct | 800 |

Why this happened: the wrong numbers were chosen so that the **aggregate** still matched
(sum of all 8 = 3,250/day either way, total trolleys = 196 either way) — so the dashboard's
top-line KPIs looked fine while the **per-model breakdown was wrong**. That's the kind of bug
that survives a casual glance at the dashboard and only shows up when someone checks one model
against the source sheet, which is exactly what this audit did.

A 9th row labeled **"new"** also appears in your screenshots (500/day, 30 trolleys combined).
That isn't in the seed data or the codebase at all — it's local test data you (or someone)
added once through the **Calculate Capacity → Add New Model** modal, and it's sitting in your
browser's `localStorage`. It's not a code bug, just leftover scratch data. Before showing this
to anyone else: open `/calculate-capacity` and either delete that row or click **Reset to
Defaults**.

**Visible effect of this fix:** the "Total Volume / Day" KPI will now read **6,500 wheels**,
not 7,500. That's correct — 6,500 = 2 × 3,250 (front + rear), matching the client sheet's
volume total exactly. If anyone asks why the number "went down," it's because it was wrong
before and is now right.

---

## 2. Calculation engine fix (`src/engine/calculator.js`)

**Bug:** the engine rounded `volPerHour` *before* multiplying it by each stage's hours:

```js
// BEFORE (buggy):
const volPerHour = Math.round(effectiveVolume / params.workingHoursPerDay);
const supplierPieces = Math.round(volPerHour * params.supplierHours); // rounds an already-rounded number
```

The client's source sheet does the opposite: it keeps the exact (fractional) vol/hr and only
rounds the final per-stage piece counts. Rounding twice silently drifts the piece counts — e.g.
for HLX 100 (500/day → 31.25/hr exactly), the buggy engine produced 124 supplier pieces;
the source sheet (and the fix) produce 125. The bug didn't change *this* dataset's final
trolley counts because the trolley-capacity ceiling (÷20, round up) happened to absorb the
1-piece drift — but that's luck, not correctness, and it would bite as soon as someone edits
`Trolley Capacity` in Parameters to a tighter number.

**Fix applied:**

```js
// AFTER (correct):
const volPerHourExact = effectiveVolume / params.workingHoursPerDay; // kept unrounded
const volPerHour = Math.round(volPerHourExact);                      // rounded copy, DISPLAY ONLY
const supplierPieces = Math.round(volPerHourExact * params.supplierHours); // uses the exact value
```

`row.volPerHour` is still returned as a rounded integer (every screen and export already
expects that for display), so nothing downstream needed to change.

**Verification:** `verify.mjs` (rewritten — see §4) imports the real `calculator.js` and checks
every stage-piece count and trolley total for all 8 models against the literal numbers in the
client's PDF. All 8 pass exactly, and the 16-row grand total is still 196.

```
$ node verify.mjs
Model                vol/day  vph  sup  trn  opn  poc  total   result
------------------------------------------------------------------------------
HLX 100                 500   31  125   47   63   16     15   PASS
HLX 125 4-speed         500   31  125   47   63   16     15   PASS
HLX 125 5-speed         500   31  125   47   63   16     15   PASS
HLX 150                 300   19   75   28   38    9      9   PASS
Radeon                  200   13   50   19   25    6      7   PASS
City+ DOM               200   13   50   19   25    6      7   PASS
Sport                   250   16   63   23   31    8      9   PASS
Raider                  800   50  200   75  100   25     21   PASS
------------------------------------------------------------------------------
ALL ROWS MATCH SOURCE SHEET
Grand total (16 rows): 196 (expected 196)
```

---

## 3. "Plant Available" / Gap dashboard — why it was empty, and what's seeded now

The Dashboard's gap/shortage/surplus analytics (donut chart, status badges, Total Gap KPI)
were never broken — they were just never fed data. Every seed row had
`plantAvailableTrolleys: null` on purpose (nobody had entered a real plant trolley count yet),
so every status correctly fell back to "Unallocated." That's the app behaving correctly
on empty input, not a bug.

**What changed:** `src/data/seedData.js` now ships with placeholder Plant Available numbers
per model, so a fresh install demonstrates the full feature (surplus, shortage, and the donut
breakdown) instead of an all-dash dashboard:

| Model | Required /line | Plant Available /line (placeholder) | Gap | Status |
|---|---:|---:|---:|---|
| HLX 100 | 15 | 15 | 0 | Surplus |
| HLX 125 4-speed | 15 | 12 | −3 | Shortage |
| HLX 125 5-speed | 15 | 17 | +2 | Surplus |
| HLX 150 | 9 | 9 | 0 | Surplus |
| Radeon | 7 | 5 | −2 | Shortage |
| City+ DOM | 7 | 9 | +2 | Surplus |
| Sport | 9 | 8 | −1 | Shortage |
| Raider | 21 | 21 | 0 | Surplus |

Resulting dashboard totals: 196 required, 192 available, net gap −4, 5 surplus models /
3 shortage models — a realistic, demonstrable mix.

> **These are placeholder numbers, not a real trolley count.** They exist purely so the
> dashboard isn't blank on first load. Action item before this goes anywhere near a real
> planning decision: replace every Plant Available value with an actual physical trolley
> count from the Hosur plant floor, either via the `/calculate-capacity` grid (inline-editable)
> or its sidebar editor (both already work). This is called out again in §8 Open Questions.

---

## 4. Code hygiene cleanup

- **Deleted `src/state/persistence.js`** — dead code. It defined `saveState`/`loadState` against
  a different `localStorage` key (`tvs-wheel-trolley-dashboard`) than the one actually used by
  the live store (`mhf-trolley-state` in `src/state/useStore.js`). Nothing imported it; it was a
  leftover from an earlier iteration. Confirmed via repo-wide grep before removing.
- **Replaced `verify.mjs`.** The old version didn't have the client's source sheet and
  brute-force-searched for some set of 8 volumes that summed to the right totals — a guess,
  not a check, and it's how the wrong volumes (§1) made it into the seed data in the first
  place. The new `verify.mjs` imports the real `src/engine/calculator.js` and asserts every
  output against the literal PDF figures. Run it any time the engine or seed data changes.

---

## 5. Enterprise-Readiness Roadmap ("more compensatory / corporate level")

Everything above was a correctness pass. Below is what's actually missing to call this a
corporate-grade application rather than a client-side demo. None of this is implemented yet
— it needs a decision from you/the team on scope and timeline before anyone builds it,
because each item is a real architectural commitment, not a quick edit.

| Area | Current state | Why it matters at corporate scale | Recommended direction |
|---|---|---|---|
| Auth | Hardcoded email/password pairs in `src/state/authStore.js`, shipped in the JS bundle anyone can read in devtools. Session is a flag in `sessionStorage`/`localStorage`. | Real credentials in a client bundle is a real exposure, not a style nit — anyone can open devtools and read the user list. | Move to a backend with hashed passwords + JWT/session cookies (or SSO via the company's existing identity provider, if one exists). |
| Data persistence | 100% `localStorage`, single browser, single device. Two people editing = two diverging copies, no conflict resolution. | A plant floor tool with one person's edits invisible to everyone else isn't usable beyond a single-user demo. | A real backend (Node/Express, FastAPI, etc.) + database (Postgres is a safe default) as the source of truth; client becomes a thin UI over an API. |
| Authorization | `requiredRole="editor"` is checked only in the React route guard (`ProtectedRoute.jsx`). Anyone can call the Zustand store's setters directly from the console regardless of role. | Client-side-only authorization is not authorization — it's a UI hint. | Enforce role checks server-side on every write endpoint once a backend exists. |
| Audit trail | None — edits silently overwrite prior values, no history of who changed what. | For a number that drives physical inventory decisions, "who changed the Plant Available count for Raider, and when" is a real question someone will ask. | Append-only change log table (row_id, field, old_value, new_value, user, timestamp). |
| Multi-user real-time sync | "Real-time" today means reactive within one browser tab, not synced across users (flagged as an open question in v2 too — still open). | True shop-floor usage means multiple people view/edit concurrently. | WebSocket push (or polling) once there's a backend; last-write-wins is fine to start, optimistic locking later if conflicts become frequent. |
| Automated tests | None beyond the manual `verify.mjs` script. | The §1/§2 bugs both shipped silently and were only caught by hand-checking against the PDF. Tests would have caught both at commit time. | Add Vitest; unit-test `calculator.js` against the source-sheet table in this doc, and component tests for the gap-status logic in `AnalyticsDashboard.jsx`. |
| CI/CD | None — no lint/build/test gate before merge. | Manual verification doesn't scale past one person. | GitHub Actions (or equivalent): lint → test → build on every PR. |
| Environment config | None — no `.env`, no dev/staging/prod distinction. | Needed the moment there's a real backend with different URLs/keys per environment. | Vite env files (`.env.production`, etc.) once a backend exists. |
| Input validation | Decent at the UI layer (`CalculateCapacity.jsx`'s Add Model modal checks for blanks/duplicates/non-positive numbers) but nothing server-side, because there's no server. | Client-only validation is bypassable. | Mirror the same validation server-side once there's an API. |
| Observability | None — no error tracking, no usage analytics. | If this breaks on someone else's machine, you won't know. | Sentry (or similar) once there's a deploy target beyond your own machine. |
| Accessibility | Not audited in this pass. | Plant/ops tools often need to meet internal accessibility standards. | Run an axe-core pass on the four main pages; fix contrast/labels/keyboard-nav issues found. |
| Build artifacts in the repo | `dist/` (the production build output) is committed alongside source. `node_modules/` was included in the handed-off zip (152 MB). | Build output doesn't belong in source control — it goes stale and bloats the repo. | Add `dist/` to `.gitignore`; never ship `node_modules/` — recipients run `npm install`. |

None of the above changes are in this pass's diff — they're sized for separate, deliberate work
(mainly because "add a backend" is a project, not a patch). Flagging them now so they're a
known roadmap rather than a surprise later.

---

## 6. Codebase map (for the next person)

```
TVS/
├── src/
│   ├── engine/calculator.js      ← the math (FIXED this pass — see §2)
│   ├── data/seedData.js          ← default 16 rows (FIXED this pass — see §1, §3)
│   ├── state/
│   │   ├── useStore.js           ← main Zustand store (rows, params, save/load via localStorage)
│   │   ├── authStore.js          ← client-side login gate (see §5 — not real auth)
│   │   └── themeStore.js         ← light/dark theme toggle
│   ├── pages/
│   │   ├── Login/Login.jsx       ← /login
│   │   ├── Dashboard/
│   │   │   ├── AnalyticsDashboard.jsx  ← /dashboard — KPI cards, charts, model summary table
│   │   │   └── Dashboard.jsx           ← /dashboard/details — full per-line "Asset Management" grid
│   │   └── Edit/
│   │       ├── CalculateCapacity.jsx   ← /calculate-capacity — editable grid + Add Model modal
│   │       └── EditParameters.jsx      ← /calculate-capacity/parameters — the 6 global params
│   ├── components/
│   │   ├── Layout/                ← Sidebar, TopHeader, ProtectedRoute (route guard)
│   │   └── Export/ExportPanel.jsx ← wraps utils/exportPDF|Excel|CSV.js
│   └── utils/exportPDF.js, exportExcel.js, exportCSV.js
├── verify.mjs                      ← regression check, rewritten this pass (see §4)
├── HANDOVER_v2_wheel_trolley_dashboard.md  ← prior handover (routing/login/edit-flow design)
└── HANDOVER_v3_wheel_trolley_dashboard.md  ← this document
```

Routing (unchanged from v2): `/login` (public) → `/dashboard`, `/dashboard/details`,
`/calculate-capacity`, `/calculate-capacity/parameters` (all behind `ProtectedRoute`; the
`/calculate-capacity*` routes additionally require `role === 'editor'`).

Demo credentials (client-side only, see §5):
- Editor: `admin@tvs.com` / `admin123`
- Viewer: `viewer@tvs.com` / `viewer123`

---

## 7. How to run / verify

```bash
npm install            # node_modules wasn't shipped in this handover's zip — install fresh
node verify.mjs         # regression-checks the calculation engine against the source sheet
npm run dev             # local dev server
npm run build           # production build
```

If `node verify.mjs` doesn't print "ALL ROWS MATCH SOURCE SHEET" and "Grand total (16 rows): 196",
something regressed — stop and check `src/engine/calculator.js` and `src/data/seedData.js` before
doing anything else.

---

## 8. Open questions / action items

1. Replace the placeholder Plant Available numbers (§3) with a real trolley count
   from the Hosur plant floor before this is used for any actual capacity-planning decision.
2. Auth/backend decision (carried over from v2, still unresolved): stay client-side-only for
   now, or invest in a real backend? This gates almost everything in §5.
3. Should the leftover "new" test model (§1) be removed from your browser's `localStorage`
   before this is shown to the client? (Click Reset to Defaults on `/calculate-capacity`.)
4. Any other models in the real HLX/TVS lineup not in the client's source PDF that should be
   added? The 8 in the PDF are the only ones with a verified spec — if there are more
   (new variants, e.g. an electric line), their volume/day and trolley-capacity figures are
   needed to seed them correctly rather than guessing (guessing is exactly what caused §1).

---

## 9. Acceptance criteria for this pass

- [x] All 8 models' `volumePerDay` match the client's source PDF exactly (§1 table).
- [x] `verify.mjs` checks the real engine against the real source figures and passes for all 8
      models plus the 16-row grand total (196).
- [x] Calculation engine no longer double-rounds vol/hr (§2); `volPerHour` is still returned
      rounded for display, stage-piece math uses the exact value.
- [x] Dashboard gap analytics (donut chart, status badges, Total Gap KPI) render real
      surplus/shortage data on a fresh install instead of "Unallocated" everywhere (§3).
- [x] Dead code removed (`persistence.js`); disproven scratch script replaced with a real
      regression check (§4).
- [ ] Real Plant Available data entered by plant ops (action item, not part of this code pass).
- [ ] Backend/auth decision made (action item, not part of this code pass).
