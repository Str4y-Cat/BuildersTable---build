<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Notify affected travelers</DialogTitle>
        <DialogDescription>
          <template v-if="item">
            Simulated send for “{{ item.title }}”. No real email or Telegram is sent.
          </template>
        </DialogDescription>
      </DialogHeader>

      <div v-if="item" class="space-y-4">
        <div class="space-y-2">
          <p class="text-sm font-medium">Affected travelers</p>
          <div
            v-if="affected.length === 0"
            class="rounded-md border border-dashed p-3 text-sm text-muted-foreground"
          >
            No travelers on this trip to notify.
          </div>
          <div v-else class="flex flex-wrap gap-1.5">
            <Badge
              v-for="traveler in affected"
              :key="traveler.id"
              variant="secondary"
            >
              {{ traveler.name }}
            </Badge>
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
import { Badge } from '@/components/ui/badge'
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

const affected = computed(() =>
  props.item ? affectedTravelers(props.trip, props.item) : []
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
    affected.value.length > 0 &&
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
  }
)

function send() {
  if (!props.item || !canSend.value) {
    if (!selectedChannels.value.length) toast.error('Select at least one channel')
    else if (!message.value.trim()) toast.error('Message is required')
    return
  }

  const count = affected.value.length
  notifyAffected(
    props.trip.id,
    props.item.id,
    selectedChannels.value,
    message.value.trim()
  )
  toast.success(`Notified ${count} traveler${count === 1 ? '' : 's'}`)
  emit('sent', props.item.id)
  emit('update:open', false)
}
</script>
