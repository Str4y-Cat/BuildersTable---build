<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ item ? 'Edit entry' : 'Add entry' }}</DialogTitle>
        <DialogDescription>
          {{ item ? 'Update this itinerary item.' : 'Create a new itinerary item for this trip.' }}
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="item-date">Date</Label>
            <Input id="item-date" v-model="form.date" type="date" required />
          </div>
          <div class="space-y-2">
            <Label for="item-time">Time</Label>
            <Input id="item-time" v-model="form.time" type="time" />
          </div>
        </div>

        <div class="space-y-2">
          <Label for="item-title">Title</Label>
          <Input id="item-title" v-model="form.title" required placeholder="e.g. Call time — Unit base" />
        </div>

        <div class="space-y-2">
          <Label>Type</Label>
          <Select v-model="form.type">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="type in ITINERARY_ITEM_TYPES"
                :key="type"
                :value="type"
              >
                {{ itemTypeLabel(type) }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="item-location">Location</Label>
          <Input id="item-location" v-model="form.location" placeholder="Optional" />
        </div>

        <div class="space-y-2">
          <Label for="item-notes">Notes</Label>
          <Textarea
            id="item-notes"
            v-model="form.description"
            placeholder="Optional details"
          />
        </div>

        <div class="space-y-2">
          <Label>Assign travelers</Label>
          <p class="text-xs text-muted-foreground">
            Leave all unchecked for all travelers.
          </p>
          <div
            v-if="trip.travelers.length === 0"
            class="rounded-md border border-dashed p-3 text-sm text-muted-foreground"
          >
            No travelers on this trip yet.
          </div>
          <div v-else class="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
            <label
              v-for="traveler in trip.travelers"
              :key="traveler.id"
              class="flex cursor-pointer items-center gap-2 text-sm"
            >
              <Checkbox
                :model-value="selectedIds.includes(traveler.id)"
                @update:model-value="(v) => toggleTraveler(traveler.id, v === true)"
              />
              <span>
                {{ traveler.name }}
                <span class="text-muted-foreground">· {{ traveler.roleOnProduction }}</span>
              </span>
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="emit('update:open', false)">
            Cancel
          </Button>
          <Button type="submit">
            {{ item ? 'Save changes' : 'Add entry' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import type { ItineraryItem, ItineraryItemType, Trip } from '@/types'
import { useTripsStore } from '@/stores/trips'
import { ITINERARY_ITEM_TYPES, itemTypeLabel } from '@/lib/itemTypeStyles'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const props = defineProps<{
  open: boolean
  trip: Trip
  item: ItineraryItem | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { addItineraryItem, updateItineraryItem } = useTripsStore()

const form = reactive({
  date: '',
  time: '',
  title: '',
  type: 'activity' as ItineraryItemType,
  location: '',
  description: ''
})

const selectedIds = ref<string[]>([])

function resetForm() {
  if (props.item) {
    form.date = props.item.date
    form.time = props.item.time ?? ''
    form.title = props.item.title
    form.type = props.item.type
    form.location = props.item.location ?? ''
    form.description = props.item.description ?? ''
    selectedIds.value = [...props.item.assignedTravelerIds]
  } else {
    form.date = props.trip.startDate
    form.time = ''
    form.title = ''
    form.type = 'activity'
    form.location = ''
    form.description = ''
    selectedIds.value = []
  }
}

watch(
  () => [props.open, props.item?.id] as const,
  ([isOpen]) => {
    if (isOpen) resetForm()
  }
)

function toggleTraveler(id: string, checked: boolean) {
  if (checked) {
    if (!selectedIds.value.includes(id)) {
      selectedIds.value = [...selectedIds.value, id]
    }
  } else {
    selectedIds.value = selectedIds.value.filter((x) => x !== id)
  }
}

function handleSubmit() {
  const title = form.title.trim()
  const date = form.date
  if (!title || !date) {
    toast.error('Title and date are required')
    return
  }

  const payload = {
    date,
    time: form.time || undefined,
    title,
    type: form.type,
    location: form.location.trim() || undefined,
    description: form.description.trim() || undefined,
    assignedTravelerIds: [...selectedIds.value]
  }

  if (props.item) {
    updateItineraryItem(props.trip.id, props.item.id, payload)
    toast.success('Entry updated')
  } else {
    addItineraryItem(props.trip.id, payload)
    toast.success('Entry added')
  }

  emit('update:open', false)
}
</script>
