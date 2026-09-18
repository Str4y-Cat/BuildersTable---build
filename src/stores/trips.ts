import { computed, readonly, ref } from 'vue'
import mockDataJson from '@/data/mockData.json'
import {
  affectedTravelers,
  clampTripDescription,
  generateShareCode,
  newId
} from '@/lib/tripHelpers'
import type {
  Document,
  EventTask,
  ItineraryItem,
  MockData,
  NotifyChannel,
  ResponseStatus,
  Traveler,
  Trip,
  TripBadge,
  TripTag,
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

export type CreateTripInput = {
  name: string
  description?: string
  badge?: TripBadge
  tags?: TripTag[]
  autoNotifyOnAssign?: boolean
  /** Optional overrides — prefer derived itinerary dates when absent */
  destination?: string
  startDate?: string
  endDate?: string
}

export type UpdateTripPatch = Partial<
  Pick<
    Trip,
    | 'name'
    | 'destination'
    | 'startDate'
    | 'endDate'
    | 'description'
    | 'badge'
    | 'tags'
    | 'autoNotifyOnAssign'
  >
>

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

  const createTrip = (input: CreateTripInput): Trip => {
    const trip: Trip = {
      id: newId('trip'),
      name: input.name,
      destination: input.destination,
      startDate: input.startDate,
      endDate: input.endDate,
      description: clampTripDescription(input.description?.trim() ?? ''),
      badge: input.badge ?? 'planning',
      tags: input.tags ?? [],
      autoNotifyOnAssign: input.autoNotifyOnAssign ?? true,
      travelers: [],
      itinerary: [],
      documents: [],
      responses: [],
      notificationLogs: []
    }
    trips.value = [...trips.value, trip]
    return trip
  }

  const updateTrip = (tripId: string, patch: UpdateTripPatch): Trip => {
    const trip = requireTrip(tripId)
    const next = { ...patch }
    if (typeof next.description === 'string') {
      next.description = clampTripDescription(next.description)
    }
    Object.assign(trip, next)
    trips.value = [...trips.value]
    return trip
  }

  const deleteTrip = (tripId: string): void => {
    trips.value = trips.value.filter((t) => t.id !== tripId)
  }

  const addItineraryItem = (
    tripId: string,
    item: Omit<ItineraryItem, 'id' | 'assignedTravelerIds' | 'lastUpdatedAt' | 'tasks' | 'documentIds'> &
      Partial<
        Pick<ItineraryItem, 'id' | 'assignedTravelerIds' | 'lastUpdatedAt' | 'tasks' | 'documentIds'>
      >
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
      lastUpdatedAt: item.lastUpdatedAt ?? new Date().toISOString(),
      tasks: item.tasks ?? [],
      documentIds: item.documentIds ?? []
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

  const setEventTaskDone = (
    tripId: string,
    itemId: string,
    taskId: string,
    done: boolean
  ): EventTask => {
    const trip = requireTrip(tripId)
    const item = trip.itinerary.find((i) => i.id === itemId)
    if (!item) throw new Error(`Itinerary item not found: ${itemId}`)
    const taskIndex = item.tasks.findIndex((t) => t.id === taskId)
    if (taskIndex === -1) throw new Error(`Task not found: ${taskId}`)
    const updatedTask: EventTask = { ...item.tasks[taskIndex], done }
    const tasks = [
      ...item.tasks.slice(0, taskIndex),
      updatedTask,
      ...item.tasks.slice(taskIndex + 1)
    ]
    updateItineraryItem(tripId, itemId, { tasks })
    return updatedTask
  }

  const addEventTask = (
    tripId: string,
    itemId: string,
    title: string
  ): EventTask => {
    const trip = requireTrip(tripId)
    const item = trip.itinerary.find((i) => i.id === itemId)
    if (!item) throw new Error(`Itinerary item not found: ${itemId}`)
    const trimmed = title.trim()
    if (!trimmed) throw new Error('Task title is required')
    const task: EventTask = {
      id: newId('task'),
      title: trimmed,
      done: false
    }
    updateItineraryItem(tripId, itemId, { tasks: [...item.tasks, task] })
    return task
  }

  const removeEventTask = (tripId: string, itemId: string, taskId: string): void => {
    const trip = requireTrip(tripId)
    const item = trip.itinerary.find((i) => i.id === itemId)
    if (!item) throw new Error(`Itinerary item not found: ${itemId}`)
    updateItineraryItem(tripId, itemId, {
      tasks: item.tasks.filter((t) => t.id !== taskId)
    })
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
    trip.documents = trip.documents.map((doc) => ({
      ...doc,
      assignedTravelerIds: doc.assignedTravelerIds.filter((id) => id !== travelerId)
    }))
    trip.responses = trip.responses.filter((r) => r.travelerId !== travelerId)
    if (trip.notificationLogs) {
      trip.notificationLogs = trip.notificationLogs.filter(
        (n) => n.travelerId !== travelerId
      )
    }
    trips.value = [...trips.value]
  }

  const addDocument = (
    tripId: string,
    doc: Omit<Document, 'id' | 'assignedTravelerIds' | 'pinned'> &
      Partial<Pick<Document, 'id' | 'assignedTravelerIds' | 'pinned'>>
  ): Document => {
    const trip = requireTrip(tripId)
    const next: Document = {
      id: doc.id ?? newId('doc'),
      name: doc.name,
      url: doc.url,
      type: doc.type,
      assignedTravelerIds: doc.assignedTravelerIds ?? [],
      pinned: doc.pinned ?? false
    }
    trip.documents = [...trip.documents, next]
    trips.value = [...trips.value]
    return next
  }

  const updateDocument = (
    tripId: string,
    docId: string,
    patch: Partial<Omit<Document, 'id'>>
  ): Document => {
    const trip = requireTrip(tripId)
    const index = trip.documents.findIndex((d) => d.id === docId)
    if (index === -1) {
      throw new Error(`Document not found: ${docId}`)
    }
    const updated: Document = {
      ...trip.documents[index],
      ...patch,
      id: docId
    }
    trip.documents = [
      ...trip.documents.slice(0, index),
      updated,
      ...trip.documents.slice(index + 1)
    ]
    trips.value = [...trips.value]
    return updated
  }

  const removeDocument = (tripId: string, docId: string): void => {
    const trip = requireTrip(tripId)
    trip.documents = trip.documents.filter((d) => d.id !== docId)
    trip.itinerary = trip.itinerary.map((item) => ({
      ...item,
      documentIds: (item.documentIds ?? []).filter((id) => id !== docId)
    }))
    trips.value = [...trips.value]
  }

  const notifyAffected = (
    tripId: string,
    itemId: string,
    channels: NotifyChannel[],
    message: string,
    /** When set, only these travelers (must be in the item’s assigned set). */
    travelerIds?: string[]
  ): number => {
    const trip = requireTrip(tripId)
    const item = trip.itinerary.find((i) => i.id === itemId)
    if (!item) {
      throw new Error(`Itinerary item not found: ${itemId}`)
    }
    if (!channels.length) return 0

    const now = new Date().toISOString()
    let recipients = affectedTravelers(trip, item)
    if (travelerIds?.length) {
      const allow = new Set(travelerIds)
      recipients = recipients.filter((t) => allow.has(t.id))
    }
    if (!recipients.length) return 0

    const logs = trip.notificationLogs ? [...trip.notificationLogs] : []
    const nextResponses = [...trip.responses]

    for (const traveler of recipients) {
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
    return recipients.length
  }

  /** Simulated notify for document assignees (no itinerary response rows). */
  const notifyDocumentAssignees = (
    tripId: string,
    docId: string,
    channels: NotifyChannel[],
    message: string,
    travelerIds?: string[]
  ): number => {
    const trip = requireTrip(tripId)
    const doc = trip.documents.find((d) => d.id === docId)
    if (!doc) {
      throw new Error(`Document not found: ${docId}`)
    }
    if (!channels.length) return 0

    let recipients =
      doc.assignedTravelerIds.length === 0
        ? trip.travelers
        : trip.travelers.filter((t) => doc.assignedTravelerIds.includes(t.id))

    if (travelerIds?.length) {
      const allow = new Set(travelerIds)
      recipients = recipients.filter((t) => allow.has(t.id))
    }
    if (!recipients.length) return 0

    const now = new Date().toISOString()
    const logs = trip.notificationLogs ? [...trip.notificationLogs] : []
    // Reuse log shape with itineraryItemId = doc id prefix for mock traceability
    for (const traveler of recipients) {
      for (const channel of channels) {
        logs.push({
          id: newId('notif'),
          tripId,
          itineraryItemId: `doc:${docId}`,
          travelerId: traveler.id,
          channel,
          sentAt: now,
          messagePreview: message.slice(0, 160)
        })
      }
    }
    trip.notificationLogs = logs
    trips.value = [...trips.value]
    return recipients.length
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
    setEventTaskDone,
    addEventTask,
    removeEventTask,
    removeItineraryItem,
    addTraveler,
    removeTraveler,
    addDocument,
    updateDocument,
    removeDocument,
    notifyAffected,
    notifyDocumentAssignees,
    respondToItem
  }
}
