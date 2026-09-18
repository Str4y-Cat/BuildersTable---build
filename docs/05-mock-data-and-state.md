# 05 — Mock Data and State

Frontend-only. Seed from JSON; mutate in an in-memory reactive store so curator and traveler views stay in sync during a demo session.

## Principles

- No API layer, no Laravel, no real auth
- `src/data/mockData.json` = initial seed
- Full page reload may reset to seed (acceptable)
- Prefer **Pinia** or a small `ref`-based composable singleton—pick one and use it everywhere (Dashboard, TripDetail, TravelerView)

## Target TypeScript shape

Extend `src/types/index.ts` toward the following (names can match closely):

```typescript
export type ItineraryItemType =
  | 'flight'
  | 'accommodation'
  | 'activity'
  | 'meal'
  | 'transport'
  | 'call-time'
  | 'other'

export type ResponseStatus = 'pending' | 'confirmed' | 'declined'
export type NotifyChannel = 'email' | 'telegram'

export interface User {
  id: string
  name: string
  email: string
  role: 'curator'
  title?: string
  company?: string
  avatar?: string
}

export interface Traveler {
  id: string
  name: string
  email: string
  phone?: string
  /** Production role, e.g. "DP", "Talent" — not curator/traveler auth role */
  roleOnProduction: string
  /** Public link segment for /trips/:shareCode */
  shareCode: string
}

export interface ItineraryItem {
  id: string
  date: string // ISO date
  time?: string // "HH:mm"
  title: string
  description?: string
  location?: string
  type: ItineraryItemType
  /** Empty or omitted = all travelers on the trip */
  assignedTravelerIds: string[]
  lastUpdatedAt?: string // ISO datetime
}

export interface Document {
  id: string
  name: string
  url: string
  type: string
}

export interface EntryResponse {
  itineraryItemId: string
  travelerId: string
  status: ResponseStatus
  respondedAt?: string
}

export interface NotificationLog {
  id: string
  tripId: string
  itineraryItemId: string
  travelerId: string
  channel: NotifyChannel
  sentAt: string
  messagePreview: string
}

export interface Trip {
  id: string
  name: string
  destination: string
  startDate: string
  endDate: string
  travelers: Traveler[]
  itinerary: ItineraryItem[]
  documents: Document[]
  responses: EntryResponse[]
  notificationLogs?: NotificationLog[]
}

export interface MockData {
  currentUser: User
  trips: Trip[]
}
```

### Migration notes from current JSON

- Current `Traveler.role: 'curator' | 'traveler'` → split: drop auth-style role on travelers; use `roleOnProduction`; keep curator only on `currentUser`.
- Add `shareCode` per traveler (unique across seed).
- Add `assignedTravelerIds` (default `[]` = all) and optional `lastUpdatedAt` on items.
- Add `call-time` where production call sheets fit (especially on `trip-1`).
- Add `responses[]` (and optional `notificationLogs`) on each trip.

## Seed requirements

Keep the Framelight Media / multi-trip seed flavor. **Minimum for demo:**

### `trip-1` (Sundance) must include

1. Unique `shareCode` for every traveler (e.g. `marcus-sundance`, `rachel-sundance`).
2. At least one itinerary item assigned to a **subset** of travelers (not all).
3. At least one item with recent `lastUpdatedAt` (ISO in the last day or two relative to “demo today”, or a fixed recent stamp documented in a comment).
4. Mixed `responses` on that item: some `confirmed`, some `declined`, some `pending`.
5. At least one `call-time` entry.
6. Documents can stay placeholder Drive URLs.

Other trips can be thinner but should still get `shareCode` + `assignedTravelerIds: []` + empty or light `responses` so the UI does not crash.

## Store API (suggested)

```typescript
// Conceptual — implement as Pinia store or composable
getTrip(tripId: string): Trip | undefined
getTravelerByShareCode(shareCode: string): { trip: Trip; traveler: Traveler } | undefined

createTrip(input): Trip
updateTrip(tripId, patch)
deleteTrip(tripId)

addItineraryItem(tripId, item)
updateItineraryItem(tripId, itemId, patch) // sets lastUpdatedAt
removeItineraryItem(tripId, itemId)

addTraveler(tripId, traveler) // generate shareCode if missing
removeTraveler(tripId, travelerId)

notifyAffected(tripId, itemId, channels, message)
  // append NotificationLog per affected traveler + channel
  // set EntryResponse status pending for those travelers (create if missing)

respondToItem(tripId, itemId, travelerId, status: 'confirmed' | 'declined')
```

### Affected travelers for notify

- If `assignedTravelerIds.length === 0` → all `trip.travelers`
- Else → travelers whose ids are in `assignedTravelerIds`

### Filtering for traveler view

Show item if:

- `assignedTravelerIds` is empty, **or**
- `assignedTravelerIds.includes(traveler.id)`

### Rollup helper

For an item, consider only affected travelers (same rule as notify). Count `confirmed` / `declined` / `pending` from `trip.responses` (default missing → treat as `pending` after a notify, or omit from denominator until notified—**prefer**: after seed/notify, every affected traveler has a response row).

### Recently updated

Treat as updated if `lastUpdatedAt` is within **72 hours** of `Date.now()`, or if the traveler’s response is `pending` and `lastUpdatedAt` is set. Document the chosen rule in code comments and stick to it in both UIs.

## Wiring views

| View | Reads | Writes |
|---|---|---|
| Dashboard | `trips`, `currentUser` | create/delete trip |
| TripDetail | `getTrip(tripId)` | items, travelers, notify |
| TravelerView | `getTravelerByShareCode` | `respondToItem` |

Do not import JSON directly inside every component once the store exists—seed once at store init.

## Out of scope for data layer

- `localStorage` persistence (optional stretch only; not required)
- Sync across browsers/devices
- Real notification delivery
- Auth session
