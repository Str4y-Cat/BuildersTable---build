<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ item ? 'Edit entry' : 'Add entry' }}</DialogTitle>
        <DialogDescription>
          {{ item ? 'Update this itinerary event.' : 'Create a new itinerary event for this trip.' }}
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="item-date" title="Event calendar date">Date</Label>
            <Input
              id="item-date"
              v-model="form.date"
              type="date"
              required
              title="When this event happens"
            />
          </div>
          <div class="space-y-2">
            <Label for="item-time" title="Optional start time">Time</Label>
            <Input
              id="item-time"
              v-model="form.time"
              type="time"
              title="Optional. If omitted, the event is done after that calendar day ends."
            />
          </div>
        </div>

        <div class="space-y-2">
          <Label for="item-title">Title</Label>
          <Input
            id="item-title"
            v-model="form.title"
            required
            placeholder="e.g. Call time — Unit base"
            title="Short name shown on the timeline and progress tracker"
          />
        </div>

        <div class="space-y-2">
          <Label for="item-type" title="Production event category">Type</Label>
          <Select v-model="form.type">
            <SelectTrigger
              id="item-type"
              class="w-full"
              :title="itemTypeHint(form.type)"
            >
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="type in ITINERARY_ITEM_TYPES"
                :key="type"
                :value="type"
                :title="itemTypeHint(type)"
              >
                <span class="flex flex-col items-start gap-0.5 py-0.5">
                  <span>{{ itemTypeLabel(type) }}</span>
                  <span class="text-xs font-normal text-muted-foreground">
                    {{ itemTypeHint(type) }}
                  </span>
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          <p class="text-xs text-muted-foreground" :title="itemTypeHint(form.type)">
            {{ itemTypeHint(form.type) }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="item-location">Location</Label>
          <Input
            id="item-location"
            v-model="form.location"
            placeholder="Optional"
            title="Venue or meeting point"
          />
        </div>

        <div class="space-y-2">
          <Label for="item-notes">Notes</Label>
          <Textarea
            id="item-notes"
            v-model="form.description"
            placeholder="Optional details"
            title="Extra context for crew"
          />
        </div>

        <EventTasksEditor v-model="draftTasks" />

        <EventDocumentsPicker
          v-model="linkedDocumentIds"
          :documents="trip.documents"
        />

        <TravelerAssignPicker
          ref="assignPicker"
          v-model="selectedIds"
          :travelers="trip.travelers"
          :hint="assignHint"
        />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            title="Discard changes"
            @click="emit('update:open', false)"
          >
            Cancel
          </Button>
          <Button type="submit" :title="item ? 'Save event changes' : 'Create event'">
            {{ item ? 'Save changes' : 'Add entry' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import type { EventTask, ItineraryItem, ItineraryItemType, Trip } from '@/types'
import { newlyAssignedTravelerIds } from '@/lib/tripHelpers'
import { useTripsStore } from '@/stores/trips'
import { ITINERARY_ITEM_TYPES, itemTypeHint, itemTypeLabel } from '@/lib/itemTypeStyles'
import EventDocumentsPicker from '@/components/EventDocumentsPicker.vue'
import EventTasksEditor from '@/components/EventTasksEditor.vue'
import TravelerAssignPicker from '@/components/TravelerAssignPicker.vue'
import { Button } from '@/components/ui/button'
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

const { addItineraryItem, updateItineraryItem, notifyAffected } = useTripsStore()

const form = reactive({
  date: '',
  time: '',
  title: '',
  type: 'activity' as ItineraryItemType,
  location: '',
  description: ''
})

const selectedIds = ref<string[]>([])
const draftTasks = ref<EventTask[]>([])
const linkedDocumentIds = ref<string[]>([])
const assignPicker = ref<{ resetSearch: () => void } | null>(null)

const assignHint = computed(() => {
  const base = 'Search, then select. Leave unchecked for all travelers.'
  if (props.trip.autoNotifyOnAssign) {
    return `${base} First-time assignees are auto-notified.`
  }
  return `${base} Auto-notify on assign is off for this trip.`
})

function resetForm() {
  if (props.item) {
    form.date = props.item.date
    form.time = props.item.time ?? ''
    form.title = props.item.title
    form.type = props.item.type
    form.location = props.item.location ?? ''
    form.description = props.item.description ?? ''
    selectedIds.value = [...props.item.assignedTravelerIds]
    draftTasks.value = props.item.tasks.map((t) => ({ ...t }))
    linkedDocumentIds.value = [...(props.item.documentIds ?? [])]
  } else {
    form.date = props.trip.startDate ?? props.trip.itinerary[0]?.date ?? ''
    form.time = ''
    form.title = ''
    form.type = 'activity'
    form.location = ''
    form.description = ''
    selectedIds.value = []
    draftTasks.value = []
    linkedDocumentIds.value = []
  }
  assignPicker.value?.resetSearch()
}

watch(
  () => [props.open, props.item?.id] as const,
  ([isOpen]) => {
    if (isOpen) resetForm()
  }
)

function handleSubmit() {
  const title = form.title.trim()
  const date = form.date
  if (!title || !date) {
    toast.error('Title and date are required')
    return
  }

  const nextIds = [...selectedIds.value]
  const previousIds = props.item ? [...props.item.assignedTravelerIds] : undefined
  const allIds = props.trip.travelers.map((t) => t.id)

  const tasks = draftTasks.value
    .map((t) => ({ ...t, title: t.title.trim() }))
    .filter((t) => t.title.length > 0)

  const payload = {
    date,
    time: form.time || undefined,
    title,
    type: form.type,
    location: form.location.trim() || undefined,
    description: form.description.trim() || undefined,
    assignedTravelerIds: nextIds,
    tasks,
    documentIds: [...linkedDocumentIds.value]
  }

  let itemId: string
  if (props.item) {
    updateItineraryItem(props.trip.id, props.item.id, payload)
    itemId = props.item.id
    toast.success('Entry updated')
  } else {
    const created = addItineraryItem(props.trip.id, payload)
    itemId = created.id
    toast.success('Entry added')
  }

  if (props.trip.autoNotifyOnAssign) {
    const firstAssignIds = newlyAssignedTravelerIds(previousIds, nextIds, allIds)
    if (firstAssignIds.length) {
      const count = notifyAffected(
        props.trip.id,
        itemId,
        ['email', 'telegram'],
        `You’ve been assigned to “${title}” on ${date}${form.time ? ` at ${form.time}` : ''}. Please confirm.`,
        firstAssignIds
      )
      if (count) {
        toast.message(`Auto-notified ${count} newly assigned traveler${count === 1 ? '' : 's'}`)
      }
    }
  }

  emit('update:open', false)
}
</script>
