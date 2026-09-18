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

export function taskProgress(trip: Trip): { done: number; total: number } {
  const total = trip.itinerary.length
  const done = trip.itinerary.filter((item) => item.done).length
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
