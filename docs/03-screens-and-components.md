# 03 — Screens and Components

Interaction density for trip detail should feel closer to a production manage console (see ai.studio reference), while staying inside [04-design-themes.md](./04-design-themes.md).

## Routes

| Path | View file | Purpose |
|---|---|---|
| `/dashboard` | `src/views/Dashboard.vue` | Curator trips overview |
| `/dashboard/trips/:tripId` | `src/views/TripDetail.vue` | Curator manage |
| `/trips/:shareCode` | `src/views/TravelerView.vue` | Public traveler itinerary |

---

## 1. Dashboard (`/dashboard`)

### Purpose

Curator home: scan trips, create one, open manage.

### Layout

- Top header: “My Trips”, **New Trip**, user avatar menu (Settings/Logout → toast only).
- Optional search input + status filter (All / Upcoming / Ongoing / Past).
- Responsive card grid: 1 / 2 / 3 columns (`TripCard`).
- Empty state when no trips.

### Trip card content

- Name, destination, date range
- Counts: travelers, itinerary items, documents
- Status badge (upcoming / ongoing / past) per design themes
- Overflow menu: Edit / Duplicate / Delete (wire or toast; Delete should confirm if wired)
- **View Details** → `/dashboard/trips/:tripId`

### New Trip dialog

- Fields: name, destination (or cities string), start date, end date
- Create in store → navigate to new trip detail
- Validation: name required; end ≥ start

### Acceptance

- [ ] Search filters by name/destination
- [ ] Status badges use correct colors
- [ ] New Trip creates session trip and opens detail
- [ ] Existing cards navigate to detail

---

## 2. Trip detail (`/dashboard/trips/:tripId`) — primary screen

### Purpose

All curator work: itinerary, assignments, travelers, notify, rollup, documents.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Back · TripHeader (name, dates, destination, actions)         │
├──────────────────────────────┬──────────────────────────────┤
│ Itinerary (~60%)             │ Sidebar (~40%)               │
│ Day groups                   │ Travelers list               │
│ Item cards + rollup          │ Share copy                   │
│ Add entry                    │ Documents list               │
└──────────────────────────────┴──────────────────────────────┘
```

On mobile: stack itinerary then sidebar; optional tabs **Itinerary | Travelers**.

### Trip header

- Title, destination, date range
- Actions: Edit trip meta (optional dialog), **Preview traveler view** (opens first seeded share link or picker), back to dashboard
- Optional summary chips: traveler count, item count, pending responses

### Itinerary panel

- Entries grouped by `date`, sorted by `time` then title
- Each item shows:
  - Type badge, title, time, location, short notes
  - Assignment: “All travelers” or avatar/name chips
  - Response rollup: e.g. `4 confirmed · 1 declined · 1 pending` (of assigned set)
  - Actions: Edit, Delete, **Notify affected travelers**
- **Add entry** opens `ItineraryItemForm` dialog
- Recently updated items: subtle “Updated” indicator

### Travelers panel

- List: name, `roleOnProduction`, email, phone/Telegram handle
- Copy share link (`/trips/{shareCode}`) with toast “Link copied”
- Add traveler / Remove (confirm)
- Do not treat curator `currentUser` as a shareable traveler unless also listed with a share code

### Documents

- `DocumentList`: name + external link (placeholder URLs OK)
- No upload UI beyond disabled button or omitted control

### Notify composer

- Triggered per entry (preferred) or with entry pre-selected
- Shows affected travelers (assignment or all)
- Channel toggles: Email, Telegram
- Message textarea with sensible default (“Schedule update: {title} on {date}…”)
- Send → store updates + Sonner success
- Cancel closes without changes

### Acceptance

- [ ] Loads `trip-1` (and others) from store by id
- [ ] Day-grouped timeline with badges + rollup
- [ ] Add/edit/delete items with assignments
- [ ] Travelers + copyable share codes
- [ ] Notify resets responses to pending and logs simulation
- [ ] Missing `tripId` shows not-found + link home

---

## 3. Traveler view (`/trips/:shareCode`)

### Purpose

Read-only itinerary for one traveler; confirm/decline on changes.

### Layout

- Simple header (trip name, dates, greeting) — no curator chrome / no “My Trips”
- Day-grouped cards for filtered entries
- Documents section (optional)
- Footer or button: Contact curator

### Entry card

- Type badge, title, time, location, notes
- **Updated** badge when recently changed / pending after notify
- If `pending`: Confirm + Decline buttons
- If responded: status badge + optional “Change response”

### Acceptance

- [ ] Resolves share code to traveler + trip
- [ ] Filters to assigned + “all” entries only
- [ ] Confirm/decline updates store
- [ ] Unknown code → not-found state

---

## Component inventory

### App components to build

| Component | Used on | Responsibility |
|---|---|---|
| `TripCard` | Dashboard | Exists — polish status colors |
| `TripHeader` | Trip detail | Meta + actions |
| `ItineraryTimeline` | Trip detail, Traveler view | Day groups |
| `ItineraryItemCard` | Timeline | Display + actions / respond |
| `ItineraryItemForm` | Trip detail | Add/edit dialog |
| `TravelerList` | Trip detail | Sidebar list |
| `TravelerForm` | Trip detail | Add traveler dialog |
| `NotificationComposer` | Trip detail | Simulated notify modal |
| `DocumentList` | Detail + traveler | Link list |
| `ResponseRollup` | Item card (curator) | Confirmed/declined/pending counts |
| `ShareLinkButton` | Traveler list | Copy `/trips/{code}` |
| `TripSearchBar` | Dashboard | Search + optional filter |
| `NewTripDialog` | Dashboard | Create trip |

### shadcn-vue to add (as needed)

Already present: Button, Card, Badge, Avatar, Separator, Dropdown Menu, Sonner.

Add when building forms/chrome:

- Input, Textarea, Label
- Select (or Combobox) for type / filters
- Dialog (forms, notify, confirm delete)
- Checkbox / multi-select pattern for traveler assignment
- Tabs (optional mobile/detail sections)
- Sheet (optional mobile travelers drawer)
- Calendar or date inputs for trip/item dates

Icons: Lucide only (`Plane`, `Hotel`, `Clapperboard` / `Clock` for call-time, etc.).

### Store helpers (not UI)

- `useTripsStore` (or composable): CRUD trips/items/travelers, notify, respond, selectors by id/shareCode
- Pure helpers: `tripStatus(trip)`, `entriesForTraveler(trip, travelerId)`, `rollup(item, responses)`, `isRecentlyUpdated(item)`

---

## Visual density note (ai.studio-inspired)

Prefer a **manage console** feel on trip detail: clear hierarchy, dense but scannable item rows, obvious primary actions (Add entry, Notify), and always-visible traveler/share affordances—without introducing a new color system or card-heavy dashboard aesthetic on the traveler page.
