# 07 — Demo path rehearsal

Walk this path before a pitch. Requires `npm run dev` and the Phase 1–7 mock.

## Demo path (trip-1)

1. Open `/dashboard` — see Framelight trips; status badges (upcoming/ongoing/past).
2. Open **Sundance Film Festival 2026** (`trip-1`).
3. On an itinerary entry, click **Notify** → confirm channels/message → **Send update**.
   - Toast confirms simulated send.
   - Entry briefly highlights; rollup resets toward pending; last-notify line appears.
4. In Travelers, **Copy link** for Marcus (`marcus-sundance`), or open `/trips/marcus-sundance`.
5. As traveler: find the updated entry → **Confirm** or **Decline**.
6. Return to `/dashboard/trips/trip-1` — response rollup reflects the traveler’s choice (same browser session / shared in-memory store).

## Quick checks

| Check | Route / action |
|---|---|
| Not-found trip | `/dashboard/trips/nope` |
| Not-found share | `/trips/nope` |
| New trip | Dashboard → New Trip → lands on empty detail |
| Mobile | Narrow viewport: stacked dashboard header; trip detail travelers collapsed behind toggle |

## Success criteria

Tracked in [01-mock-finish-plan.md](./01-mock-finish-plan.md). After this rehearsal they should all hold without a backend.
