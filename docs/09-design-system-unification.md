# 09 — Design System Unification

Work order to bring the three app screens onto the design system established by the landing page (`/`).

## Which doc to trust

| Doc | Role |
|---|---|
| **This doc** | The **work order** — what changes, where, and why. Historical once executed. |
| [04-design-themes.md](./04-design-themes.md) | The **standing spec** — the resulting system. Source of truth once this lands. |

## Why

The landing page was built with a deliberate system: `font-semibold` + `tracking-tight` headings, token-derived radii, hairline edges over drop shadows, `font-medium` uppercase eyebrows. Dashboard / TripDetail / TravelerView predate it and follow the older rules (`text-2xl font-bold`, no tracking, `hover:shadow-md`). Clicking **Open the curator demo** crosses a visible style boundary.

## Scope

**System, not density.** App spacing, container widths, and information architecture are unchanged — `py-8` sections stay `py-8`, `max-w-7xl` stays `max-w-7xl`. The app is a dense coordination tool; the landing is a marketing page. That difference is correct and stays.

Unified: type weights and tracking, the radius scale, label patterns, shared helpers, one chip shape, one hover affordance.

Explicitly **not** in scope: a shared wordmark header. App chrome is left alone.

## Two audit corrections

Both invert the obvious assumption that the app needs dragging up to the landing.

### 1. The landing is the off-scale one on radii

`@theme inline` in `src/assets/index.css` derives `--radius-sm/md/lg/xl` from `--radius: 0.875rem` but never defines `--radius-2xl`. The landing's `rounded-2xl` therefore falls back to Tailwind's stock `1rem`:

| Class | Resolves to | Source |
|---|---|---|
| `rounded-md` | 12px | token |
| `rounded-lg` | 14px | token |
| `rounded-2xl` | **16px** | **Tailwind fallback — wrong** |
| `rounded-xl` | 18px | token |

The `Card` primitive already uses `rounded-xl`, so **landing cards are currently less rounded than app cards.** Bug in the landing, not the app.

### 2. Edge treatment needs no work

`Card` uses `ring-1 ring-foreground/10`; everything else in both surfaces uses `border-border`. Those are within ~2% of each other. Converting 20+ `divide-y rounded-lg border` groupings to rings is churn for no visual gain. **Leave it.**

## Changes

### 1. Complete the radius scale — `src/assets/index.css`

Add to `@theme inline`:

```css
--radius-2xl: calc(var(--radius) + 8px);   /* 22px */
--radius-3xl: calc(var(--radius) + 16px);  /* 30px */
```

No markup changes — existing classes start resolving correctly.

### 2. Typography constants — new `src/lib/typography.ts`

Exported class strings, composed at call sites with `cn()` from `src/lib/utils.ts`. **Both surfaces consume these** — one definition, not a copy per surface.

| Export | Value | Used by |
|---|---|---|
| `heroTitle` | `text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl` | landing hero |
| `displayTitle` | `text-3xl font-semibold leading-tight tracking-tight sm:text-4xl` | landing sections |
| `pageTitle` | `text-2xl font-semibold tracking-tight` | app page titles |
| `sectionTitle` | `text-lg font-semibold tracking-tight` | app section headings |
| `eyebrow` | `text-xs font-medium uppercase tracking-wide text-muted-foreground` | both |
| `metaText` | `text-sm text-muted-foreground` | both |

App call sites:

| Change | Files |
|---|---|
| `font-bold` → `font-semibold` + `tracking-tight` | `Dashboard.vue:6`, `TripDetail.vue:6`, `TravelerView.vue:6,31`, `TripHeader.vue:18` |
| add `tracking-tight` | `TripDetail.vue:37`, `TravelerView.vue:54,63`, `TravelerList.vue:14`, `DocumentList.vue:14` |
| `font-semibold` → `font-medium` (eyebrows) | `ItineraryProgress.vue:8`, `ItineraryItemPanel.vue:33,136` |

Landing components refactored onto the constants: `LandingHero`, `ProblemSection`, `DemoSection`, `ValueProps`, `ClosingCta`, `HeroProductShot`.

### 3. Consolidate `initials()`

Written **four** times: `ItineraryItemCard.vue:192`, `ItineraryItemPanel.vue:368`, `landing/mockContent.ts`, plus an inline `userInitials` in `Dashboard.vue`.

Move one copy into `src/lib/tripHelpers.ts` beside the other shared formatters; delete all four local versions.

### 4. Traveler chip shape

Same idea, two shapes:

| Surface | Current |
|---|---|
| App — `ItineraryItemCard.vue:106` | `rounded-md … text-xs` |
| Landing — `PropagationDemo.vue` | `rounded-full … text-[11px]` |

Unify on **`rounded-full` + `text-xs`**. Pill is already the system for small labelled tokens — `Badge` uses `rounded-4xl`.

> The app has **no** stacked-avatar UI anywhere (no `-space-x-*` outside the landing). The landing's overlap treatment stays landing-only; no `AvatarStack` abstraction is warranted.

### 5. `MockAvatar` builds on the real primitive

`landing/MockAvatar.vue` hand-rolls a circle duplicating `Avatar` + `AvatarFallback`. Rebuild on `components/ui/avatar`, keeping only the stacking separator (`border-2 border-background`), the inset ring, and the `active` state as extra classes.

### 6. Hover affordance — `TripCard`

`TripCard.vue:5` uses `hover:shadow-md` — the only drop-shadow hover in either surface. Replace with `hover:ring-foreground/20`, matching the `Card` primitive's existing `ring-1 ring-foreground/10`. Keeps the clickable affordance, drops the shadow.

**Sanctioned exception:** `landing/BrowserFrame.vue` keeps its bespoke layered shadow — the deliberate "floating product shot" treatment, landing-only.

### 7. Update `04-design-themes.md`

Rewrite **Typography & hierarchy** and **Components chrome** to describe the unified system, pointing at `src/lib/typography.ts`. Keep the colour-coding tables (item type badges, trip status, response status) — unaffected and still correct. Record that app density and container widths intentionally differ from the landing.

## Verification

1. `npm run build` — must pass `vue-tsc` cleanly.
2. Grep assertions, all returning nothing outside `components/ui/`:
   - `font-bold` in `src/views` or `src/components`
   - `font-semibold uppercase`
   - `function initials` in any `.vue` file
3. Built CSS: `rounded-2xl` resolves to `22px`, not `1rem`.
4. Screenshot all four surfaces at 1440px and 390px; headings visibly lighter-weight and tighter, nothing else moving:
   - `/`, `/dashboard`, `/dashboard/trips/trip-1`, `/trips/marcus-sundance`
   - Headless capture via `google-chrome --headless=new --screenshot`. For content below the fold, `--virtual-time-budget` alone is **not** enough — the landing demo's `IntersectionObserver` correctly pauses off-screen content, so size the window tall enough to bring the target into view.
5. No app layout shifted: Dashboard board columns, TripDetail's 3/2 grid split, and TravelerView's `max-w-3xl` column unchanged in structure — only type and chip radii change.

## Known drift (not fixed here)

[README.md](./README.md) still calls the product **TravelBuddy**; the vault and the landing page call it **TellMe**. Unrelated to this change — worth a separate pass.
