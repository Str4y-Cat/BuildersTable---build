# 08 — Mock Feedback (next iteration)

Post–Phase 8 UX feedback to implement in the Vue mock. Frontend-only; keep [04-design-themes.md](./04-design-themes.md). Prefer this doc over older screen notes when they conflict.

**Status:** in progress — through PDF (step 9); New Trip create (step 10) still deferred.

---

## Locked decisions


| Topic              | Decision                                                                                                                                     |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Kanban columns     | **Status-based:** Upcoming / Ongoing / Past                                                                                                  |
| Description cap    | **Character count** (set a concrete max in UI + validation, e.g. 280)                                                                        |
| Badge              | **Status-style chip**; show on **board card and trip header**                                                                                |
| Tags               | **Fixed set** (curated list in code/seed—not freeform)                                                                                       |
| Tasks vs itinerary | **Itinerary items are events**; **some events have optional sub-tasks** (`tasks[]`) that can be checked off — not the event itself as a task |
| Auto-notify        | **Only on first assign**, or via an **explicit toggle**—not on every assignment edit                                                         |
| PDF                | **Client PDF library** (e.g. html2pdf / jsPDF-style) for Download PDF                                                                        |


---

## Structure (target)

Reorient the mock around a **Kanban / board** mental model on the dashboard, richer trip creation (description-first, dates derived), and a trip page where **itinerary items are events** (some with checkable **sub-tasks**), **collapsible side panels**, assignable **documents**, and tighter notify/PDF flows.

---

## Dashboard

### Board layout

- Replace the current trip **card grid** with a **Kanban board**.
- Columns: **Upcoming / Ongoing / Past** (from trip status / derived dates).
- Rationale: board fits production coordination better than a flat grid of trip cards.

### Trip / column cards (board item)

- **Remove** from card UI: itinerary **Items** count and **Docs** count.
- **Add:** **status-style badge** chip and **fixed-set tag(s)** on the board card.
- Treat the board unit as an **Item Card** (trip summary)—not the full trip detail.

---

## New Trip

### Create flow

- **No destination** field in the create form (still may show on the board card once derived or edited later).
- **No start & end** fields in the create form.
  - Dates are **worked out from itinerary/task entry dates** (min/max → displayed range on the card).
  - Date range **still displayed** on the board card when available.
- **Add description** with a **character-count cap** (enforce in the panel; show remaining count).
- Prefer a **side panel / sheet** for create (and edit) rather than a **dropdown** or small centered-only dialog.

### Data / seed implications

- Trip model: make `destination`, `startDate`, `endDate` optional or derived; add `description` (max length), status-style `badge`, `tags[]` from a fixed enum/list.
- Board card + trip header: badge chip; board card also shows tag(s), derived date range, description snippet—not item/doc counts.

---

## Trip page (manage)

### Event panel (itinerary item)

- Itinerary items are **events**. Click one to open a **right-side sheet**.
- **Some events** have optional **sub-tasks** (checklist) that can be checked off; others have none.
- Sheet shows event details, sub-task list (add/toggle/remove), and crew responses.
- Progress tracker (left of itinerary, later) counts sub-tasks across events that have them.

### Assignment → notify

- When a crew member is **first assigned** to an entry/document, **auto-notify** (simulated)—or only when an **explicit toggle** is on. Do **not** re-notify on every subsequent assignment tweak.
- Manual **Notify** action: only notify **currently assigned / selected** travelers for that item—not the whole crew by default.

### Documents

- Documents must be **assignable** to travelers (subset or all).
- Support **Pinned** documents.
- Surface **Tel.** (phone / Telegram) where crew contact matters (traveler rows / assignment UI).
- Default assignment behavior: **default all**, but allow **crew assigned** (subset) like itinerary.

### Side panels (default closed)

- **Travelers**: collapsible section, **default closed**.
- **Documents**: collapsible section, **default closed** (at bottom of trip page).
- Traveler row: **Copy link** + **Remove** to the **right of the name**.

### Preview traveler view

- Keep Preview traveler / traveler share view.
- Documents **at the top** + **Download PDF** (client PDF library).

---

## Itinerary

### Layout & progress

- **Progress tracker** to the **left** of the itinerary (driven by task/done checkboxes on entries).
- **Hover hints** generally (icons, truncated fields, disabled actions, progress steps)—`title` or light shadcn tooltip.

### Add entry

- Assign travelers: **search bar** to filter, then select (not a long unchecked list alone).

### PDF & documents placement

- **Download as PDF** via a **client PDF library**.
- Documents at **bottom** of the trip page in a default-closed dropdown.

---

## Suggested implementation order

1. **Data model** — description (char max), optional destination/dates, badge, fixed tags, **events with optional `tasks[]` sub-tasks**, document assignment/pinned, derived date range.
2. **Trip event panel** — clickable itinerary **event** opens a side sheet with **sub-tasks** + crew responses. *(Corrected: not a New Trip create panel.)*
3. **Dashboard Kanban** — Upcoming / Ongoing / Past; slim cards (badge + tags; drop items/docs counts).
4. **Trip page chrome** — badge on header; collapsible Travelers + Documents (default closed); traveler actions beside name.
5. **Progress / task polish** — left progress tracker from event sub-tasks; derived dates.
6. **Assignable documents** — pin + assign; default all.
7. **Notify** — first-assign / toggle auto-notify; manual Notify scoped to assigned/selected only.
8. **Itinerary polish** — traveler search on assign; hover hints.
9. **PDF** — client library on curator + traveler (documents top on traveler view).

---

## Out of scope (unchanged)

- Laravel / real auth / real email·Telegram delivery
- Real file upload storage (UI for assign/pin is enough in mock)
- Shipping the mock as the hackathon submission

