<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Notify assigned travelers</DialogTitle>
        <DialogDescription>
          <template v-if="item">
            Simulated send for “{{ item.title }}”. Only currently assigned crew
            (or your selection) are notified — not the whole trip by default.
          </template>
        </DialogDescription>
      </DialogHeader>

      <div v-if="item" class="space-y-4">
        <div class="space-y-2">
          <div class="flex items-center justify-between gap-2">
            <p class="text-sm font-medium">Recipients</p>
            <button
              v-if="assigned.length"
              type="button"
              class="text-xs text-muted-foreground underline-offset-2 hover:underline"
              @click="toggleAllSelected"
            >
              {{ allSelected ? 'Clear' : 'Select all assigned' }}
            </button>
          </div>
          <p class="text-xs text-muted-foreground">
            Assigned to this event
            <template v-if="item.assignedTravelerIds.length === 0"> (all crew)</template>.
          </p>
          <div
            v-if="assigned.length === 0"
            class="rounded-md border border-dashed p-3 text-sm text-muted-foreground"
          >
            No travelers on this trip to notify.
          </div>
          <div v-else class="max-h-40 space-y-2 overflow-y-auto rounded-md border p-3">
            <label
              v-for="traveler in assigned"
              :key="traveler.id"
              class="flex cursor-pointer items-start gap-2 text-sm"
            >
              <Checkbox
                class="mt-0.5"
                :model-value="selectedIds.includes(traveler.id)"
                @update:model-value="(v) => toggleRecipient(traveler.id, v === true)"
              />
              <span class="min-w-0">
                <span class="font-medium">{{ traveler.name }}</span>
                <span class="text-muted-foreground">
                  · {{ traveler.roleOnProduction }}
                </span>
                <span
                  v-if="traveler.phone"
                  class="mt-0.5 block text-xs text-muted-foreground"
                >
                  Tel. {{ traveler.phone }}
                </span>
              </span>
            </label>
          </div>
        </div>

        <div class="space-y-2">
          <p class="text-sm font-medium">Channels</p>
          <div class="flex flex-wrap gap-4">
            <label class="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                :model-value="emailChannel"
                @update:model-value="(v) => (emailChannel = v === true)"
              />
              Email
            </label>
            <label class="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                :model-value="telegramChannel"
                @update:model-value="(v) => (telegramChannel = v === true)"
              />
              Telegram
            </label>
          </div>
        </div>

        <div class="space-y-2">
          <Label for="notify-message">Message</Label>
          <Textarea id="notify-message" v-model="message" rows="4" />
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" @click="emit('update:open', false)">
          Cancel
        </Button>
        <Button type="button" :disabled="!canSend" @click="send">
          Send update
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import type { ItineraryItem, NotifyChannel, Trip } from '@/types'
import { affectedTravelers } from '@/lib/tripHelpers'
import { useTripsStore } from '@/stores/trips'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const props = defineProps<{
  open: boolean
  trip: Trip
  item: ItineraryItem | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  sent: [itemId: string]
}>()

const { notifyAffected } = useTripsStore()

const emailChannel = ref(true)
const telegramChannel = ref(true)
const message = ref('')
const selectedIds = ref<string[]>([])

const assigned = computed(() =>
  props.item ? affectedTravelers(props.trip, props.item) : []
)

const allSelected = computed(
  () =>
    assigned.value.length > 0 &&
    assigned.value.every((t) => selectedIds.value.includes(t.id))
)

const selectedChannels = computed((): NotifyChannel[] => {
  const channels: NotifyChannel[] = []
  if (emailChannel.value) channels.push('email')
  if (telegramChannel.value) channels.push('telegram')
  return channels
})

const canSend = computed(
  () =>
    !!props.item &&
    selectedIds.value.length > 0 &&
    selectedChannels.value.length > 0 &&
    message.value.trim().length > 0
)

function defaultMessage(item: ItineraryItem): string {
  return `Schedule update: ${item.title} on ${item.date}${item.time ? ` at ${item.time}` : ''}. Please confirm your availability.`
}

watch(
  () => [props.open, props.item?.id] as const,
  ([isOpen]) => {
    if (!isOpen || !props.item) return
    emailChannel.value = true
    telegramChannel.value = true
    message.value = defaultMessage(props.item)
    selectedIds.value = affectedTravelers(props.trip, props.item).map((t) => t.id)
  }
)

function toggleRecipient(id: string, checked: boolean) {
  if (checked) {
    if (!selectedIds.value.includes(id)) {
      selectedIds.value = [...selectedIds.value, id]
    }
  } else {
    selectedIds.value = selectedIds.value.filter((x) => x !== id)
  }
}

function toggleAllSelected() {
  if (allSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = assigned.value.map((t) => t.id)
  }
}

function send() {
  if (!props.item || !canSend.value) {
    if (!selectedChannels.value.length) toast.error('Select at least one channel')
    else if (!selectedIds.value.length) toast.error('Select at least one recipient')
    else if (!message.value.trim()) toast.error('Message is required')
    return
  }

  const count = notifyAffected(
    props.trip.id,
    props.item.id,
    selectedChannels.value,
    message.value.trim(),
    selectedIds.value
  )
  toast.success(`Notified ${count} traveler${count === 1 ? '' : 's'}`)
  emit('sent', props.item.id)
  emit('update:open', false)
}
</script>
