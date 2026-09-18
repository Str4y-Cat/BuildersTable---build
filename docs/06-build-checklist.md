# 06 — Build Checklist

Work top to bottom. Check items off as you go. Details live in the sibling docs.

## Phase 1 — Data + store

- [x] Extend `src/types/index.ts` per [05-mock-data-and-state.md](./05-mock-data-and-state.md)
- [x] Enrich `src/data/mockData.json` (`shareCode`, `roleOnProduction`, assignments, `call-time`, `responses`, `lastUpdatedAt` on `trip-1`)
- [x] Add Pinia or composable store; seed from JSON
- [x] Implement getters: `getTrip`, `getTravelerByShareCode`
- [x] Implement mutations: trip/item/traveler CRUD, `notifyAffected`, `respondToItem`
- [x] Helpers: trip status, traveler filter, rollup, recently-updated

## Phase 2 — Trip detail shell

- [ ] Replace stub in `TripDetail.vue`
- [ ] Load trip by route `tripId`; not-found state
- [ ] `TripHeader` + back link to `/dashboard`
- [ ] 60/40 layout (stack on mobile)
- [ ] Wire store (read-only first is fine)

## Phase 3 — Itinerary

- [ ] Add shadcn Input, Textarea, Label, Dialog, Select as needed
- [ ] `ItineraryTimeline` day groups
- [ ] `ItineraryItemCard` with type badge, assignment, `ResponseRollup`
- [ ] `ItineraryItemForm` add/edit dialog (incl. assign travelers + `call-time`)
- [ ] Delete item with confirm dialog
- [ ] Edit updates `lastUpdatedAt`

## Phase 4 — Travelers + documents

- [ ] `TravelerList` + `TravelerForm`
- [ ] `ShareLinkButton` copy `/trips/{shareCode}` + toast
- [ ] Remove traveler with confirm
- [ ] `DocumentList` (links only)

## Phase 5 — Notify

- [ ] `NotificationComposer` dialog
- [ ] Channel toggles + message preview
- [ ] On send: toast, `notificationLogs`, reset responses to `pending`
- [ ] Optional: show last notify preview on entry

## Phase 6 — Traveler view

- [ ] Replace stub in `TravelerView.vue`
- [ ] Resolve `shareCode`; not-found state
- [ ] Greeting + filtered timeline
- [ ] Updated badge + Confirm/Decline
- [ ] Status after respond; allow change
- [ ] Contact curator CTA

## Phase 7 — Dashboard polish

- [ ] Search (and optional status filter)
- [ ] `NewTripDialog` → create + navigate
- [ ] Fix status badge colors (ongoing = orange, not destructive)
- [ ] Point card actions at store where useful

## Phase 8 — Polish + demo

- [ ] Mobile pass on all three screens
- [ ] Light transitions / toast consistency per [04-design-themes.md](./04-design-themes.md)
- [ ] Rehearse demo path from [02-user-flows.md](./02-user-flows.md)
- [ ] Confirm success criteria in [01-mock-finish-plan.md](./01-mock-finish-plan.md)

## Done when

You can run `npm run dev`, walk curator → notify → traveler confirm → rollup update on `trip-1`, and the UI still looks like this repo’s neutral Inter / shadcn theme—not a separate product skin.
