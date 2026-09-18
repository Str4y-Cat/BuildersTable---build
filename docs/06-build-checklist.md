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

- [x] Replace stub in `TripDetail.vue`
- [x] Load trip by route `tripId`; not-found state
- [x] `TripHeader` + back link to `/dashboard`
- [x] 60/40 layout (stack on mobile)
- [x] Wire store (read-only first is fine)

## Phase 3 — Itinerary

- [x] Add shadcn Input, Textarea, Label, Dialog, Select as needed
- [x] `ItineraryTimeline` day groups
- [x] `ItineraryItemCard` with type badge, assignment, `ResponseRollup`
- [x] `ItineraryItemForm` add/edit dialog (incl. assign travelers + `call-time`)
- [x] Delete item with confirm dialog
- [x] Edit updates `lastUpdatedAt`

## Phase 4 — Travelers + documents

- [x] `TravelerList` + `TravelerForm`
- [x] `ShareLinkButton` copy `/trips/{shareCode}` + toast
- [x] Remove traveler with confirm
- [x] `DocumentList` (links only)

## Phase 5 — Notify

- [x] `NotificationComposer` dialog
- [x] Channel toggles + message preview
- [x] On send: toast, `notificationLogs`, reset responses to `pending`
- [x] Optional: show last notify preview on entry

## Phase 6 — Traveler view

- [x] Replace stub in `TravelerView.vue`
- [x] Resolve `shareCode`; not-found state
- [x] Greeting + filtered timeline
- [x] Updated badge + Confirm/Decline
- [x] Status after respond; allow change
- [x] Contact curator CTA

## Phase 7 — Dashboard polish

- [x] Search (and optional status filter)
- [x] `NewTripDialog` → create + navigate
- [x] Fix status badge colors (ongoing = orange, not destructive)
- [x] Point card actions at store where useful

## Phase 8 — Polish + demo

- [x] Mobile pass on all three screens
- [x] Light transitions / toast consistency per [04-design-themes.md](./04-design-themes.md)
- [x] Rehearse demo path from [02-user-flows.md](./02-user-flows.md)
- [x] Confirm success criteria in [01-mock-finish-plan.md](./01-mock-finish-plan.md)

## Done when

You can run `npm run dev`, walk curator → notify → traveler confirm → rollup update on `trip-1`, and the UI still looks like this repo’s neutral Inter / shadcn theme—not a separate product skin.
