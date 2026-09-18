# TravelBuddy V1 Mock - Project Summary

## Overview
Building a **non-functional mockup** for TravelBuddy — a group travel itinerary management tool where one curator manages trips and keeps travelers informed.

## Core Concept
- **Curator** creates and maintains itineraries
- **Travelers** view itineraries and receive notifications
- Product fills the gap between solo-traveler apps and enterprise solutions
- Works for both B2B (company project managers) and B2C (friend/family organizers)

## Data Model

### Trip (Folder)
- Title/name
- Date range
- List of itinerary items
- List of travelers
- Curator (owner)

### Itinerary Item
```typescript
{
  date: Date,
  title: string,
  description?: string,
  time?: string,
  location?: string,
  type?: 'flight' | 'accommodation' | 'activity' | 'meal' | 'transport' | 'other'
}
```

### Traveler
```typescript
{
  name: string,
  email: string,
  phone?: string,
  role: 'curator' | 'traveler'
}
```

## V1 Mock Scope

### Pages to Build

#### 1. Management Dashboard (Curator View)
**Route: `/dashboard`**
- View all trips (cards/list)
- Quick stats per trip: date range, number of travelers, number of items
- Create new trip button
- Search/filter trips

#### 2. Trip Detail Page (Curator View)
**Route: `/dashboard/trips/:tripId`**
- Trip header: name, dates, edit button
- Timeline/calendar view of itinerary items
- Add/edit/delete itinerary items
- Traveler list sidebar with add/remove functionality
- Send notification button (triggers fake email/message)
- Important documents section (just UI, no upload)

#### 3. Traveler Itinerary Page (Traveler View)
**Route: `/trips/:shareCode`**
- Read-only view of the trip
- Timeline of itinerary items filtered by date
- Trip details (where, when)
- Important documents list (view-only)
- Contact curator button
- No login required (access via share link/code)

### Mock Data Approach

#### Static JSON Data
```typescript
// src/data/mockData.json
{
  "trips": [...],
  "currentUser": {...}
}

// Import directly in components - no API layer needed
import mockData from '@/data/mockData.json'
```

#### UI-Only Interactions
- Buttons/forms work but don't persist changes
- "Add" actions can show optimistic UI in component state
- "Delete" actions show confirmation dialogs
- "Save" actions show success toasts
- "Send Update" button on trip detail page
- Shows modal to compose message
- On send: displays success toast
- No actual email/Telegram integration (out of scope for mock)

## User Flows

### Curator Flow
1. Land on dashboard → see all trips
2. Click "New Trip" → fill form (name, dates) → create
3. Click trip → see detail page
4. Add itinerary items (date, title, details)
5. Add travelers (name, email, phone)
6. Click "Notify Travelers" → compose update → send (fake)
7. Preview traveler view (share link)

### Traveler Flow
1. Receive share link (e.g., `/trips/abc123`)
2. View itinerary (read-only)
3. See important documents
4. View trip details and curator contact

## Technical Approach

### Stack
- **Vue 3 + TypeScript** (already set up)
- **shadcn-vue** components (already configured)
- **Vue Router** for navigation (need to add)
- **Static mock data** from JSON file (no API/localStorage needed)
- Component state only (no Pinia/Vuex - keep it simple)

### Key Components Needed
- `TripCard` - dashboard grid item
- `TripHeader` - trip name, dates, actions
- `ItineraryTimeline` - chronological list of items
- `ItineraryItemCard` - individual item display
- `ItineraryItemForm` - add/edit modal
- `TravelerList` - sidebar with traveler cards
- `TravelerForm` - add traveler modal
- `NotificationComposer` - send update modal
- `DocumentList` - important docs section

### shadcn-vue Components to Use
- Button
- Card
- Input, Textarea
- Select, Dialog (Modal)
- Calendar/DatePicker
- Badge
- Separator
- Avatar
- Toast/Sonner (notifications)
- Tabs
- Sheet (for sidebars)

## Design Considerations

### Visual Hierarchy
- Dashboard: Card grid layout, clean and spacious
- Trip detail: Timeline on left (60%), travelers on right (40%)
- Mobile: Stack vertically, collapsible sections

### Color Coding
- Use badge colors for item types (flight=blue, hotel=purple, activity=green, etc.)
- Status indicators (upcoming=blue, ongoing=orange, past=gray)

### Interactions
- Smooth transitions between views
- Optimistic UI updates (assume success immediately)
- Loading states (even if fake)
- Confirmation dialogs for destructive actions

## Out of Scope for Mock
- ❌ Authentication/authorization (assume logged in)
- ❌ Landing page marketing content
- ❌ Settings page
- ❌ Actual API calls to backend
- ❌ File upload for documents
- ❌ Real email/Telegram integration
- ❌ Payment/pricing pages
- ❌ Multi-curator permissions
- ❌ Booking integrations
- ❌ Budget tracking

## Success Criteria
✅ Curator can create and manage multiple trips  
✅ Curator can add/edit/delete itinerary items  
✅ Curator can add/remove travelers  
✅ Traveler view is read-only and accessible via share link  
✅ UI is polished and demonstrates the core workflow  
✅ Fast iteration possible (component-based, mock data)  
✅ Demo-ready for hackathon presentation  

## Next Steps
1. Set up Vue Router with routes
2. Create mock API service with sample data
3. Build dashboard page (trip list)
4. Build trip detail page (curator view)
5. Build traveler view page
6. Polish interactions and add fake notification flow
7. Add responsive design touches
8. Prepare demo script

---

**Goal**: Have a clickable prototype that demonstrates the curator → traveler inform loop, even with fake data. Fast iteration, visual polish, clear user flows.
