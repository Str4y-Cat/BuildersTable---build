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

**Do not hand-write heading classes.** Import the role from `src/lib/typography.ts` and bind it — one definition shared by the landing page and the app, so the two can't drift.

```vue
<h1 :class="pageTitle">My Trips</h1>
<h2 :class="[sectionTitle, 'mb-2']">No trips yet</h2>
```

| Role | Export | Value |
|---|---|---|
| Landing hero | `heroTitle` | `text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl` |
| Landing section | `displayTitle` | `text-3xl font-semibold leading-tight tracking-tight sm:text-4xl` |
| App page title | `pageTitle` | `text-2xl font-semibold tracking-tight` |
| App section heading | `sectionTitle` | `text-lg font-semibold tracking-tight` |
| Uppercase label | `eyebrow` | `text-xs font-medium uppercase tracking-wide text-muted-foreground` |
| Meta / dates | `metaText` | `text-sm text-muted-foreground` |

Rules:

- **`font-semibold`, never `font-bold`.** Headings carry weight through tracking, not blackness.
- **`tracking-tight` on every heading.** Eyebrows go the other way — `tracking-wide`.
- Eyebrows are `font-medium`, not `font-semibold` — they label, they don't compete.
- Avoid competing H1-level headlines beside the trip name.

## Density — where the two surfaces intentionally differ

The landing page and the app share the *system*, not the *density*. These differences are correct and must not be "fixed":

| | Landing | App |
|---|---|---|
| Section rhythm | `py-24` / `py-32` | `py-8` |
| Container | `max-w-6xl` | `max-w-7xl` (traveler view `max-w-3xl`) |

The app is a dense coordination tool; the landing is a marketing page.

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
- Avatars with initials for travelers — always via `initials()` from `src/lib/tripHelpers.ts`, never a local copy

### Edges and elevation

- **Hairline edges, not drop shadows.** `border-border` for groupings and surfaces; the `Card` primitive's own `ring-1 ring-foreground/10` for cards. Both land at ~8–10% black — either is fine, don't convert between them.
- **Hover states darken the ring**, they don't add a shadow: `hover:ring-foreground/20`.
- **One sanctioned shadow:** `landing/BrowserFrame.vue`'s layered shadow, the deliberate floating-product-shot treatment. Landing-only. Nothing else in either surface gets a drop shadow.

### Radii — all token-derived

Every step derives from `--radius: 0.875rem` in `src/assets/index.css`. Never use a raw pixel radius.

| Class | Value | Use |
|---|---|---|
| `rounded-md` | 12px | inline controls, popovers |
| `rounded-lg` | 14px | grouped lists, empty states |
| `rounded-xl` | 18px | cards, panels |
| `rounded-2xl` | 22px | landing surfaces |
| `rounded-full` | — | avatars, and any avatar-plus-name chip |

> `--radius-2xl` / `--radius-3xl` must stay defined in `@theme inline`. Without them Tailwind silently falls back to its stock `1rem`/`1.5rem`, which sits *off* this scale — `rounded-2xl` would land at 16px, below `rounded-xl`'s 18px.

## Reference vs theme

The ai.studio trip page is a **density and information-architecture** reference. Visual theme stays this repo’s neutral Inter shadcn system—do not restyle to match whatever palette that host uses if it conflicts with the rules above.
