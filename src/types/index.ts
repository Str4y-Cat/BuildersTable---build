export interface User {
  id: string
  name: string
  email: string
  role: 'curator' | 'traveler'
  title?: string
  company?: string
  avatar?: string
}

export interface Trip {
  id: string
  name: string
  destination: string
  startDate: string // ISO format: "2026-09-16"
  endDate: string
  travelers: Traveler[]
  itinerary: ItineraryItem[]
  documents: Document[]
}

export interface Traveler {
  id: string
  name: string
  email: string
  phone?: string
  role: 'curator' | 'traveler'
}

export interface ItineraryItem {
  id: string
  date: string // ISO format: "2026-09-16"
  time?: string // "14:30" format
  title: string
  description?: string
  location?: string
  type: 'flight' | 'accommodation' | 'activity' | 'meal' | 'transport' | 'other'
}

export interface Document {
  id: string
  name: string
  url: string
  type: string // MIME type or general type
}

export interface MockData {
  currentUser: User
  trips: Trip[]
}
