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
  date: string // ISO format: "2026-09-16"
  time?: string // "14:30" format
  title: string
  description?: string
  location?: string
  type: ItineraryItemType
  /** Empty = all travelers on the trip */
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

export type TripStatus = 'upcoming' | 'ongoing' | 'past'

export interface ResponseRollup {
  confirmed: number
  declined: number
  pending: number
  total: number
}
