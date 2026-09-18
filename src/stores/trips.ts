import { computed, readonly, ref } from 'vue'
import mockDataJson from '@/data/mockData.json'
import {
  affectedTravelers,
  generateShareCode,
  newId
} from '@/lib/tripHelpers'
import type {
  ItineraryItem,
  MockData,
  NotifyChannel,
  ResponseStatus,
  Traveler,
  Trip,
  User
} from '@/types'

function cloneSeed(): MockData {
  return structuredClone(mockDataJson as MockData)
}

const seed = cloneSeed()
const currentUser = ref<User>(seed.currentUser)
const trips = ref<Trip[]>(seed.trips)

function requireTrip(tripId: string): Trip {
  const trip = trips.value.find((t) => t.id === tripId)
  if (!trip) {
    throw new Error(`Trip not found: ${tripId}`)
  }
  return trip
}

export function useTripsStore() {
  const getTrip = (tripId: string): Trip | undefined =>
    trips.value.find((t) => t.id === tripId)

  const getTravelerByShareCode = (
    shareCode: string
  ): { trip: Trip; traveler: Traveler } | undefined => {
    for (const trip of trips.value) {
      const traveler = trip.travelers.find((t) => t.shareCode === shareCode)
      if (traveler) {
        return { trip, traveler }
      }
    }
    return undefined
  }

  const createTrip = (input: {
    name: string
    destination: string
    startDate: string
    endDate: string
  }): Trip => {
    const trip: Trip = {
      id: newId('trip'),
      name: input.name,
      destination: input.destination,
      startDate: input.startDate,
      endDate: input.endDate,
      travelers: [],
      itinerary: [],
      documents: [],
      responses: [],
      notificationLogs: []
    }
    trips.value = [...trips.value, trip]
    return trip
  }

  const updateTrip = (
    tripId: string,
    patch: Partial<Pick<Trip, 'name' | 'destination' | 'startDate' | 'endDate'>>
  ): Trip => {
    const trip = requireTrip(tripId)
    Object.assign(trip, patch)
    trips.value = [...trips.value]
    return trip
  }

  const deleteTrip = (tripId: string): void => {
    trips.value = trips.value.filter((t) => t.id !== tripId)
  }

  const addItineraryItem = (
    tripId: string,
    item: Omit<ItineraryItem, 'id' | 'assignedTravelerIds' | 'lastUpdatedAt'> &
      Partial<Pick<ItineraryItem, 'id' | 'assignedTravelerIds' | 'lastUpdatedAt'>>
  ): ItineraryItem => {
    const trip = requireTrip(tripId)
    const next: ItineraryItem = {
      id: item.id ?? newId('item'),
      date: item.date,
      time: item.time,
      title: item.title,
      description: item.description,
      location: item.location,
      type: item.type,
      assignedTravelerIds: item.assignedTravelerIds ?? [],
      lastUpdatedAt: item.lastUpdatedAt ?? new Date().toISOString()
    }
    trip.itinerary = [...trip.itinerary, next]
    trips.value = [...trips.value]
    return next
  }

  const updateItineraryItem = (
    tripId: string,
    itemId: string,
    patch: Partial<Omit<ItineraryItem, 'id'>>
  ): ItineraryItem => {
    const trip = requireTrip(tripId)
    const index = trip.itinerary.findIndex((i) => i.id === itemId)
    if (index === -1) {
      throw new Error(`Itinerary item not found: ${itemId}`)
    }
    const updated: ItineraryItem = {
      ...trip.itinerary[index],
      ...patch,
      id: itemId,
      lastUpdatedAt: new Date().toISOString()
    }
    trip.itinerary = [
      ...trip.itinerary.slice(0, index),
      updated,
      ...trip.itinerary.slice(index + 1)
    ]
    trips.value = [...trips.value]
    return updated
  }

  const removeItineraryItem = (tripId: string, itemId: string): void => {
    const trip = requireTrip(tripId)
    trip.itinerary = trip.itinerary.filter((i) => i.id !== itemId)
    trip.responses = trip.responses.filter((r) => r.itineraryItemId !== itemId)
    if (trip.notificationLogs) {
      trip.notificationLogs = trip.notificationLogs.filter(
        (n) => n.itineraryItemId !== itemId
      )
    }
    trips.value = [...trips.value]
  }

  const addTraveler = (
    tripId: string,
    traveler: Omit<Traveler, 'id' | 'shareCode'> &
      Partial<Pick<Traveler, 'id' | 'shareCode'>>
  ): Traveler => {
    const trip = requireTrip(tripId)
    const next: Traveler = {
      id: traveler.id ?? newId('traveler'),
      name: traveler.name,
      email: traveler.email,
      phone: traveler.phone,
      roleOnProduction: traveler.roleOnProduction,
      shareCode: traveler.shareCode ?? generateShareCode(traveler.name, tripId)
    }
    trip.travelers = [...trip.travelers, next]
    trips.value = [...trips.value]
    return next
  }

  const removeTraveler = (tripId: string, travelerId: string): void => {
    const trip = requireTrip(tripId)
    trip.travelers = trip.travelers.filter((t) => t.id !== travelerId)
    trip.itinerary = trip.itinerary.map((item) => ({
      ...item,
      assignedTravelerIds: item.assignedTravelerIds.filter((id) => id !== travelerId)
    }))
    trip.responses = trip.responses.filter((r) => r.travelerId !== travelerId)
    if (trip.notificationLogs) {
      trip.notificationLogs = trip.notificationLogs.filter(
        (n) => n.travelerId !== travelerId
      )
    }
    trips.value = [...trips.value]
  }

  const notifyAffected = (
    tripId: string,
    itemId: string,
    channels: NotifyChannel[],
    message: string
  ): void => {
    const trip = requireTrip(tripId)
    const item = trip.itinerary.find((i) => i.id === itemId)
    if (!item) {
      throw new Error(`Itinerary item not found: ${itemId}`)
    }
    if (!channels.length) return

    const now = new Date().toISOString()
    const affected = affectedTravelers(trip, item)
    const logs = trip.notificationLogs ? [...trip.notificationLogs] : []
    const nextResponses = [...trip.responses]

    for (const traveler of affected) {
      for (const channel of channels) {
        logs.push({
          id: newId('notif'),
          tripId,
          itineraryItemId: itemId,
          travelerId: traveler.id,
          channel,
          sentAt: now,
          messagePreview: message.slice(0, 160)
        })
      }

      const pending = {
        itineraryItemId: itemId,
        travelerId: traveler.id,
        status: 'pending' as ResponseStatus
      }
      const existingIndex = nextResponses.findIndex(
        (r) => r.itineraryItemId === itemId && r.travelerId === traveler.id
      )
      if (existingIndex === -1) {
        nextResponses.push(pending)
      } else {
        nextResponses[existingIndex] = pending
      }
    }

    trip.responses = nextResponses
    trip.notificationLogs = logs
    if (!item.lastUpdatedAt) {
      item.lastUpdatedAt = now
    }
    trips.value = [...trips.value]
  }

  const respondToItem = (
    tripId: string,
    itemId: string,
    travelerId: string,
    status: Exclude<ResponseStatus, 'pending'>
  ): void => {
    const trip = requireTrip(tripId)
    const now = new Date().toISOString()
    const existingIndex = trip.responses.findIndex(
      (r) => r.itineraryItemId === itemId && r.travelerId === travelerId
    )
    const row = {
      itineraryItemId: itemId,
      travelerId,
      status,
      respondedAt: now
    }
    if (existingIndex === -1) {
      trip.responses = [...trip.responses, row]
    } else {
      const next = [...trip.responses]
      next[existingIndex] = row
      trip.responses = next
    }
    trips.value = [...trips.value]
  }

  return {
    currentUser: readonly(currentUser),
    trips: computed(() => trips.value),
    getTrip,
    getTravelerByShareCode,
    createTrip,
    updateTrip,
    deleteTrip,
    addItineraryItem,
    updateItineraryItem,
    removeItineraryItem,
    addTraveler,
    removeTraveler,
    notifyAffected,
    respondToItem
  }
}
