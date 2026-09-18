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

/** Fixed tag set for trips (not freeform). */
export type TripTag =
  | 'festival'
  | 'commercial'
  | 'documentary'
  | 'post-production'
  | 'market'
  | 'multi-city'

/** Status-style badge shown on board cards and trip header. */
export type TripBadge = 'planning' | 'locked' | 'on-hold' | 'wrap'

export const TRIP_DESCRIPTION_MAX = 280

export const TRIP_TAGS: readonly TripTag[] = [
  'festival',
  'commercial',
  'documentary',
  'post-production',
  'market',
  'multi-city'
] as const

export const TRIP_BADGES: readonly TripBadge[] = [
  'planning',
  'locked',
  'on-hold',
  'wrap'
] as const

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

export interface EventTask {
  id: string
  title: string
  done: boolean
}

export interface ItineraryItem {
  id: string
  date: string // ISO format: "2026-09-16"
  time?: string // "14:30" format
  title: string
  description?: string
  location?: string
  type: ItineraryItemType
  /** Empty = all travelers on the trip */
  assignedTravelerIds: string[]
  lastUpdatedAt?: string // ISO datetime
  /**
   * Optional sub-tasks for this event. Empty array = no checklist.
   * The itinerary entry itself is an event, not a task.
   */
  tasks: EventTask[]
  /** Trip documents linked to this event (by id). Empty = none. */
  documentIds: string[]
}

export interface Document {
  id: string
  name: string
  url: string
  type: string
  /** Empty = all travelers */
  assignedTravelerIds: string[]
  pinned: boolean
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
  /** Optional — may be filled later; not required on create */
  destination?: string
  /** Optional overrides; prefer derived range from itinerary dates when absent */
  startDate?: string
  endDate?: string
  description: string
  badge: TripBadge
  tags: TripTag[]
  /**
   * When true, auto-notify on first assign to an entry/document.
   * When false, only manual Notify (or first-assign disabled).
   */
  autoNotifyOnAssign: boolean
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

export type TripStatus = 'upcoming' | 'ongoing' | 'past'

export interface ResponseRollup {
  confirmed: number
  declined: number
  pending: number
  total: number
}

export interface DerivedDateRange {
  startDate: string | null
  endDate: string | null
}
