<template>
  <Card class="hover:shadow-lg transition-shadow duration-200">
    <CardHeader>
      <div class="flex justify-between items-start">
        <div class="flex-1 min-w-0">
          <CardTitle class="text-xl">{{ trip.name }}</CardTitle>
          <CardDescription v-if="trip.destination" class="mt-1">{{ trip.destination }}</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" class="h-8 w-8 shrink-0">
              <MoreVertical class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="openEdit">Edit</DropdownMenuItem>
            <DropdownMenuItem @click="handleDuplicate">Duplicate</DropdownMenuItem>
            <DropdownMenuItem class="text-destructive" @click="deleteOpen = true">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardHeader>

    <CardContent class="space-y-4">
      <div class="text-sm text-muted-foreground">
        {{ dateRange }}
      </div>

      <Separator />

      <div class="space-y-2 text-sm">
        <div class="flex items-center gap-2">
          <Users class="h-4 w-4 text-muted-foreground" />
          <span>{{ trip.travelers.length }} travelers</span>
        </div>
        <div class="flex items-center gap-2">
          <Calendar class="h-4 w-4 text-muted-foreground" />
          <span>{{ trip.itinerary.length }} items</span>
        </div>
        <div class="flex items-center gap-2">
          <FileText class="h-4 w-4 text-muted-foreground" />
          <span>{{ trip.documents.length }} documents</span>
        </div>
      </div>
    </CardContent>

    <CardFooter class="flex justify-between items-center">
      <Badge :class="statusBadgeClass">{{ statusLabel }}</Badge>
      <Button size="sm" @click="viewDetails">
        View Details
        <ArrowRight class="ml-2 h-4 w-4" />
      </Button>
    </CardFooter>

    <Dialog :open="editOpen" @update:open="editOpen = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit trip</DialogTitle>
          <DialogDescription>Update trip name, destination, and dates.</DialogDescription>
        </DialogHeader>
        <form class="space-y-4" @submit.prevent="saveEdit">
          <div class="space-y-2">
            <Label for="edit-trip-name">Name</Label>
            <Input id="edit-trip-name" v-model="editForm.name" required />
          </div>
          <div class="space-y-2">
            <Label for="edit-trip-destination">Destination</Label>
            <Input id="edit-trip-destination" v-model="editForm.destination" />
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="space-y-2">
              <Label for="edit-trip-start">Start date</Label>
              <Input id="edit-trip-start" v-model="editForm.startDate" type="date" />
            </div>
            <div class="space-y-2">
              <Label for="edit-trip-end">End date</Label>
              <Input id="edit-trip-end" v-model="editForm.endDate" type="date" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" @click="editOpen = false">Cancel</Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog :open="deleteOpen" @update:open="deleteOpen = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete trip?</DialogTitle>
          <DialogDescription>
            “{{ trip.name }}” and its itinerary will be removed from this session.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="deleteOpen = false">Cancel</Button>
          <Button variant="destructive" @click="confirmDelete">Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </Card>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import type { Trip, TripStatus } from '@/types'
import { displayDateRange, tripStatus } from '@/lib/tripHelpers'
import { useTripsStore } from '@/stores/trips'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Users, Calendar, FileText, MoreVertical, ArrowRight } from '@lucide/vue'

const props = defineProps<{
  trip: Trip
}>()

const router = useRouter()
const { updateTrip, createTrip, deleteTrip } = useTripsStore()

const editOpen = ref(false)
const deleteOpen = ref(false)

const editForm = reactive({
  name: '',
  destination: '',
  startDate: '',
  endDate: ''
})

const statusBadgeClassMap: Record<TripStatus, string> = {
  upcoming: 'border-transparent bg-blue-100 text-blue-800 hover:bg-blue-100',
  ongoing: 'border-transparent bg-orange-100 text-orange-800 hover:bg-orange-100',
  past: 'border-transparent bg-muted text-muted-foreground hover:bg-muted'
}

const statusLabelMap: Record<TripStatus, string> = {
  upcoming: 'Upcoming',
  ongoing: 'Ongoing',
  past: 'Past'
}

const status = computed(() => tripStatus(props.trip))
const statusBadgeClass = computed(() => statusBadgeClassMap[status.value])
const statusLabel = computed(() => statusLabelMap[status.value])

const dateRange = computed(() => {
  const { startDate, endDate } = displayDateRange(props.trip)
  if (!startDate || !endDate) return 'Dates TBD'
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
  return `${formatter.format(new Date(startDate))} - ${formatter.format(new Date(endDate))}`
})

const viewDetails = () => {
  router.push(`/dashboard/trips/${props.trip.id}`)
}

function openEdit() {
  editForm.name = props.trip.name
  editForm.destination = props.trip.destination ?? ''
  editForm.startDate = props.trip.startDate ?? ''
  editForm.endDate = props.trip.endDate ?? ''
  editOpen.value = true
}

function saveEdit() {
  const name = editForm.name.trim()
  const destination = editForm.destination.trim()
  if (!name) {
    toast.error('Name is required')
    return
  }
  if (editForm.startDate && editForm.endDate && editForm.endDate < editForm.startDate) {
    toast.error('End date must be on or after start date')
    return
  }
  updateTrip(props.trip.id, {
    name,
    destination: destination || undefined,
    startDate: editForm.startDate || undefined,
    endDate: editForm.endDate || undefined
  })
  toast.success('Trip updated')
  editOpen.value = false
}

function handleDuplicate() {
  const trip = createTrip({
    name: `${props.trip.name} (Copy)`,
    description: props.trip.description,
    badge: props.trip.badge,
    tags: [...props.trip.tags],
    autoNotifyOnAssign: props.trip.autoNotifyOnAssign,
    destination: props.trip.destination,
    startDate: props.trip.startDate,
    endDate: props.trip.endDate
  })
  toast.success('Trip duplicated')
  router.push(`/dashboard/trips/${trip.id}`)
}

function confirmDelete() {
  deleteTrip(props.trip.id)
  toast.success('Trip deleted')
  deleteOpen.value = false
}
</script>
