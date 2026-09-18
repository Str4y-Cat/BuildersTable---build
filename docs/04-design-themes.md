# 04 — Design Themes

Locked visual rules for finishing the mock. **Do not invent a new brand system.** Extend the existing shadcn-vue neutral + Inter setup in `src/assets/index.css`.

## Stack look (already configured)

| Token | Value |
|---|---|
| UI kit | shadcn-vue, style `reka-vega` |
| Base color | `neutral` |
| Font | Inter (`--font-sans`) |
| Icons | Lucide |
| Radius | `--radius: 0.875rem` |
| Mode | **Light mode primary** for demos (dark tokens exist but are not the default pitch surface) |

## Core CSS variables (light)

From `:root` in `src/assets/index.css`:

- Background / foreground: near-white / near-black OKLCH
- Primary: near-black (`oklch(0.205 0 0)`) with light primary-foreground
- Muted / border: soft gray neutrals
- Destructive: red for destructive actions only—not for “ongoing” trip status

Keep using semantic Tailwind classes (`bg-background`, `text-muted-foreground`, `border-border`, etc.).

## What not to do

- No purple-on-white / indigo glow themes
- No warm cream + terracotta + display-serif redesign
- No broadsheet / dense newspaper layout
- No emoji as UI decoration
- No multi-layer neon shadows or `rounded-full` pill clusters as the default chrome
- Do not replace Inter with another font family for this mock

## Layout patterns

### Dashboard

- Clean, spacious card grid (`max-w-7xl`, comfortable padding)
- Header with clear title + primary **New Trip** button
- Cards: light border/shadow on hover only (`TripCard` already uses soft hover shadow)

### Trip detail

- ~**60%** itinerary timeline / ~**40%** travelers + documents
- Mobile: vertical stack; optional tabs or collapsible travelers
- One clear page purpose: manage this trip
- Prefer list/timeline rows over nested card stacks inside the itinerary column

### Traveler view

- Quieter, read-focused layout (no curator dashboard chrome)
- Same type badges and typography scale for continuity

## Color coding

### Itinerary item type badges

Use Badge variants or small utility classes. Keep contrast readable on white.

| Type | Color direction |
|---|---|
| `flight` | Blue |
| `accommodation` | Purple |
| `activity` | Green |
| `meal` | Amber / warm yellow |
| `transport` | Cyan / teal |
| `call-time` | Orange (production call sheet cue) |
| `other` | Neutral / muted gray |

Implement as a single map (e.g. `itemTypeBadgeClass[type]`) so colors stay consistent on curator and traveler views.

### Trip status (dashboard cards)

Derived from `startDate` / `endDate` vs today:

| Status | Color |
|---|---|
| Upcoming | Blue |
| Ongoing | **Orange** (not destructive red) |
| Past | Gray / muted |

Fix any existing mapping that uses `destructive` for ongoing.

### Response status

| Status | Treatment |
|---|---|
| `confirmed` | Green / success-leaning badge |
| `declined` | Destructive or soft red badge |
| `pending` | Muted / outline badge |

Rollup text can be muted with numeric emphasis (e.g. **4**/6 confirmed).

### Updated flag

Small badge or accent dot on recently changed entries—visible but not louder than the title.

## Typography & hierarchy

- Page title: `text-2xl font-bold` (match dashboard)
- Section titles: `text-lg font-semibold`
- Meta / dates: `text-sm text-muted-foreground`
- Avoid competing H1-level headlines beside the trip name

## Motion & interaction

Ship a few intentional motions (not noise):

1. Route / panel fade or short transition between dashboard ↔ detail
2. Dialog open/close (Dialog defaults fine)
3. Toast feedback on save / notify / copy / respond
4. Optional: soft highlight flash on an item after notify or after returning from traveler respond

Always:

- Optimistic UI for mock mutations
- Confirm dialogs for delete
- Sonner for success/info/error
- Fake brief loading only if it helps perceived polish—keep snappy

## Components chrome

- Primary actions: solid primary Button
- Secondary: outline / ghost
- Destructive: destructive variant, still behind confirm
- Separators and muted labels for sidebar sections
- Avatars with initials for travelers (existing Avatar pattern)

## Reference vs theme

The ai.studio trip page is a **density and information-architecture** reference. Visual theme stays this repo’s neutral Inter shadcn system—do not restyle to match whatever palette that host uses if it conflicts with the rules above.
