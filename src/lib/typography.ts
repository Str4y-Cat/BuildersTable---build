/**
 * Shared type scale for both the marketing surface and the app.
 *
 * One definition per role, consumed by landing components and app views alike,
 * so the two surfaces can't drift apart again. Compose with `cn()` at the call
 * site to add layout classes:
 *
 *   <h1 :class="cn(pageTitle, 'truncate')">
 *
 * Spec: docs/04-design-themes.md. Rationale: docs/09-design-system-unification.md.
 */

/** Landing hero headline. Marketing surface only. */
export const heroTitle =
  'text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl'

/** Landing section headline. Marketing surface only. */
export const displayTitle =
  'text-3xl font-semibold leading-tight tracking-tight sm:text-4xl'

/** App page title — dashboard, trip detail, traveler view. */
export const pageTitle = 'text-2xl font-semibold tracking-tight'

/** App section heading, e.g. "Itinerary", "Documents". */
export const sectionTitle = 'text-lg font-semibold tracking-tight'

/** Small uppercase label above a heading or group. */
export const eyebrow =
  'text-xs font-medium uppercase tracking-wide text-muted-foreground'

/** Dates, counts, and other secondary meta. */
export const metaText = 'text-sm text-muted-foreground'
