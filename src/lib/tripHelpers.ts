import type {
  DerivedDateRange,
  Document,
  EntryResponse,
  ItineraryItem,
  ResponseRollup,
  ResponseStatus,
  Traveler,
  Trip,
  TripStatus
} from '@/types'
import { TRIP_DESCRIPTION_MAX } from '@/types'

const RECENT_MS = 72 * 60 * 60 * 1000

/**
 * Recently updated if lastUpdatedAt is within 72 hours of Date.now(),
 * OR if lastUpdatedAt is set and the traveler's response is pending.
 */
export function isRecentlyUpdated(
  item: ItineraryItem,
  travelerResponse?: EntryResponse | null
): boolean {
  if (!item.lastUpdatedAt) return false
  const updatedAt = new Date(item.lastUpdatedAt).getTime()
  if (Number.isNaN(updatedAt)) return false
  if (Date.now() - updatedAt <= RECENT_MS) return true
  return travelerResponse?.status === 'pending'
}

/** Min/max itinerary dates, falling back to explicit trip overrides. */
export function derivedDateRange(trip: Trip): DerivedDateRange {
  const dates = trip.itinerary
    .map((item) => item.date)
    .filter((d): d is string => Boolean(d))
    .sort()

  if (dates.length) {
    return { startDate: dates[0]!, endDate: dates[dates.length - 1]! }
  }

  return {
    startDate: trip.startDate ?? null,
    endDate: trip.endDate ?? null
  }
}

/** Display range preferring derived itinerary dates. */
export function displayDateRange(trip: Trip): DerivedDateRange {
  const derived = derivedDateRange(trip)
  return {
    startDate: derived.startDate ?? trip.startDate ?? null,
    endDate: derived.endDate ?? trip.endDate ?? null
  }
}

/** True when the shown range comes from itinerary event dates. */
export function isDateRangeDerived(trip: Trip): boolean {
  return trip.itinerary.some((item) => Boolean(item.date))
}

export function formatDateRangeLabel(trip: Trip): string {
  const { startDate, endDate } = displayDateRange(trip)
  if (!startDate || !endDate) return 'Dates TBD'
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
  return `${formatter.format(new Date(startDate))} – ${formatter.format(new Date(endDate))}`
}

export function tripStatus(trip: Trip, now: Date = new Date()): TripStatus {
  const { startDate, endDate } = displayDateRange(trip)
  if (!startDate || !endDate) return 'upcoming'

  const start = new Date(startDate)
  const end = new Date(endDate)
  const endOfDay = new Date(end)
  endOfDay.setHours(23, 59, 59, 999)

  if (now < start) return 'upcoming'
  if (now > endOfDay) return 'past'
  return 'ongoing'
}

export function eventTaskProgress(item: ItineraryItem): { done: number; total: number } {
  const total = item.tasks.length
  const done = item.tasks.filter((t) => t.done).length
  return { done, total }
}

/** True when the event has sub-tasks and every one is checked off. */
export function areEventTasksComplete(item: ItineraryItem): boolean {
  const { done, total } = eventTaskProgress(item)
  return total > 0 && done === total
}

/**
 * Instant this event is considered over: date + time, or end of that calendar day
 * when no time is set.
 */
export function eventEndsAt(item: ItineraryItem): Date {
  const end = new Date(`${item.date}T00:00:00`)
  if (item.time && /^\d{1,2}:\d{2}$/.test(item.time)) {
    const [h, m] = item.time.split(':').map(Number)
    end.setHours(h ?? 0, m ?? 0, 0, 0)
    return end
  }
  end.setHours(23, 59, 59, 999)
  return end
}

/** Event is done in the itinerary once its scheduled time has passed. */
export function isEventTimeElapsed(item: ItineraryItem, now: Date = new Date()): boolean {
  return now.getTime() >= eventEndsAt(item).getTime()
}

/** Trip-wide progress across all event sub-tasks (events without tasks ignored). */
export function taskProgress(trip: Trip): { done: number; total: number } {
  let done = 0
  let total = 0
  for (const item of trip.itinerary) {
    const p = eventTaskProgress(item)
    done += p.done
    total += p.total
  }
  return { done, total }
}

export function clampTripDescription(value: string): string {
  return value.slice(0, TRIP_DESCRIPTION_MAX)
}

/** Empty assignment = all travelers on the trip. */
export function affectedTravelers(trip: Trip, item: ItineraryItem): Traveler[] {
  if (!item.assignedTravelerIds.length) {
    return trip.travelers
  }
  const idSet = new Set(item.assignedTravelerIds)
  return trip.travelers.filter((t) => idSet.has(t.id))
}

/**
 * Travelers newly covered by an assignment change.
 * `previousIds === undefined` means the entry/document is brand new (nobody assigned yet).
 * Empty `assignedTravelerIds` means all crew.
 */
export function newlyAssignedTravelerIds(
  previousIds: string[] | undefined,
  nextIds: string[],
  allTravelerIds: string[]
): string[] {
  const nextEffective =
    nextIds.length === 0 ? allTravelerIds : nextIds

  if (previousIds === undefined) {
    return [...nextEffective]
  }

  const prevEffective = new Set(
    previousIds.length === 0 ? allTravelerIds : previousIds
  )
  return nextEffective.filter((id) => !prevEffective.has(id))
}

/** Empty document assignment = all travelers on the trip. */
export function documentAssignees(trip: Trip, doc: Document): Traveler[] {
  if (!doc.assignedTravelerIds.length) {
    return trip.travelers
  }
  const idSet = new Set(doc.assignedTravelerIds)
  return trip.travelers.filter((t) => idSet.has(t.id))
}

export function documentsForTraveler(trip: Trip, travelerId: string): Document[] {
  return trip.documents.filter(
    (doc) =>
      doc.assignedTravelerIds.length === 0 ||
      doc.assignedTravelerIds.includes(travelerId)
  )
}

export function entriesForTraveler(trip: Trip, travelerId: string): ItineraryItem[] {
  return trip.itinerary.filter(
    (item) =>
      item.assignedTravelerIds.length === 0 ||
      item.assignedTravelerIds.includes(travelerId)
  )
}

export function getResponse(
  trip: Trip,
  itineraryItemId: string,
  travelerId: string
): EntryResponse | undefined {
  return trip.responses.find(
    (r) => r.itineraryItemId === itineraryItemId && r.travelerId === travelerId
  )
}

/**
 * Rollup over affected travelers. Missing response rows count as pending
 * (prefer every affected traveler to have a row after seed/notify).
 */
export function responseRollup(trip: Trip, item: ItineraryItem): ResponseRollup {
  const affected = affectedTravelers(trip, item)
  const counts: ResponseRollup = {
    confirmed: 0,
    declined: 0,
    pending: 0,
    total: affected.length
  }

  for (const traveler of affected) {
    const status: ResponseStatus =
      getResponse(trip, item.id, traveler.id)?.status ?? 'pending'
    counts[status] += 1
  }

  return counts
}

export function generateShareCode(name: string, tripId: string): string {
  const first = name.trim().split(/\s+/)[0]?.toLowerCase() ?? 'traveler'
  const slug = first.replace(/[^a-z0-9]/g, '') || 'traveler'
  const tripSlug = tripId.replace(/^trip-/, 'trip')
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${slug}-${tripSlug}-${suffix}`
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

/** Up to two initials for avatar fallbacks, e.g. "Marcus Williams" → "MW". */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
