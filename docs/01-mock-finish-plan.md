# 01 — Mock Finish Plan

## Goal

A polished, demo-ready Vue mock that walks someone through the **curator → notify → traveler confirm/decline → curator rollup** loop using static seed data and an in-memory store. No backend.

## Routes (keep as-is)

| Route | Screen | Status |
|---|---|---|
| `/` → `/dashboard` | Trips overview | Built — needs polish |
| `/dashboard/trips/:tripId` | Trip detail / manage | Stub — primary build |
| `/trips/:shareCode` | Traveler itinerary | Stub — core loop half |

Do not rename routes to Laravel `/curator/...` or `/t/{token}` in the mock.

## Phased build order

### Phase 1 — Data model + store + seed

- Extend TypeScript types (assignments, share codes, responses, notify log, `call-time`).
- Add reactive in-memory store seeded from `src/data/mockData.json`.
- Enrich at least `trip-1` for the demo path.

→ Details: [05-mock-data-and-state.md](./05-mock-data-and-state.md)

### Phase 2 — Trip detail shell

- Load trip by `tripId`; 404/empty state if missing.
- Header: name, destination, dates, back to dashboard, preview traveler link.
- Layout: ~60% itinerary / ~40% travelers + documents (stack on mobile).

### Phase 3 — Itinerary timeline + forms

- Day-grouped chronological list with type badges, assignment chips, response rollup.
- Add/edit item dialog (date, time, title, type, location, notes, assign travelers).
- Edit sets `lastUpdatedAt`; delete with confirm dialog.
- Empty assignment = all travelers.

### Phase 4 — Travelers panel + share codes

- List travelers with `roleOnProduction`, contact, copyable share link.
- Add/remove traveler (session-only); generate unique `shareCode`.

### Phase 5 — Notify composer

- Per-entry (or trip-level) “Notify affected travelers”.
- Modal: channel chips (Email / Telegram), message preview, send.
- On send: toast success, append `NotificationLog`, reset affected `EntryResponse`s to `pending`.

### Phase 6 — Traveler view

- Resolve trip + traveler by `shareCode`.
- Filtered itinerary (assigned to them or “all”).
- “Updated” badge; Confirm/Decline when pending; status after respond.
- Contact curator CTA (mailto or toast).

### Phase 7 — Dashboard polish

- Search/filter trips; New Trip dialog (session create → navigate to detail).
- Fix status badges: upcoming=blue, ongoing=orange, past=gray.
- Keep card grid + TripCard patterns.

### Phase 8 — Responsive + demo path

- Mobile: stack sections; collapsible travelers.
- Rehearse: open `trip-1` → edit/notify → open share link → confirm → return to detail and see rollup.

## Success criteria

- [x] Curator can browse trips and open trip detail.
- [x] Curator can add/edit/delete itinerary items with traveler assignment.
- [x] Curator sees per-entry confirm/decline rollup.
- [x] Curator can run simulated Notify (toast + pending reset + optional log).
- [x] Traveler share link shows filtered itinerary and supports confirm/decline.
- [x] Traveler response updates curator rollup in the same browser session.
- [x] UI matches [04-design-themes.md](./04-design-themes.md); demo path works without a backend.

## Explicitly out of scope

- Authentication / authorization (assume logged-in curator)
- Landing page, settings page
- Laravel, real APIs, database persistence
- Real email / Telegram delivery
- File upload for documents
- Budget, booking, payments
- Multi-curator permissions
- Shipping this mock as the hackathon submission

## Related docs

[02-user-flows.md](./02-user-flows.md) · [03-screens-and-components.md](./03-screens-and-components.md) · [06-build-checklist.md](./06-build-checklist.md)
