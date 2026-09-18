<template>
  <article
    class="space-y-3 px-4 py-4 transition-colors duration-300"
    :class="highlighted ? 'bg-muted/50 ring-2 ring-inset ring-primary/20' : ''"
  >
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0 space-y-1">
        <div class="flex flex-wrap items-center gap-2">
          <Badge :class="itemTypeBadgeClass(item.type)">
            {{ itemTypeLabel(item.type) }}
          </Badge>
          <Badge v-if="updated" variant="outline">Updated</Badge>
        </div>
        <h3 class="font-medium leading-snug">{{ item.title }}</h3>
        <p v-if="metaLine" class="text-sm text-muted-foreground">{{ metaLine }}</p>
        <p v-if="item.description" class="text-sm text-muted-foreground line-clamp-2">
          {{ item.description }}
        </p>
      </div>

      <div class="flex shrink-0 flex-wrap justify-end gap-2">
        <Button variant="outline" size="sm" @click="emit('notify', item)">
          Notify
        </Button>
        <Button variant="outline" size="sm" @click="emit('edit', item)">
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          class="text-destructive hover:text-destructive"
          @click="emit('delete', item)"
        >
          Delete
        </Button>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <span class="text-xs font-medium text-muted-foreground">Assigned</span>
      <template v-if="assignedTravelers.length === 0">
        <Badge variant="secondary">All travelers</Badge>
      </template>
      <template v-else>
        <div
          v-for="traveler in assignedTravelers"
          :key="traveler.id"
          class="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs"
        >
          <Avatar class="size-5">
            <AvatarFallback class="text-[10px]">
              {{ initials(traveler.name) }}
            </AvatarFallback>
          </Avatar>
          {{ traveler.name }}
        </div>
      </template>
    </div>

    <ResponseRollup :trip="trip" :item="item" />

    <p v-if="lastNotify" class="text-xs text-muted-foreground">
      Last notified {{ lastNotify.when }}:
      “{{ lastNotify.preview }}”
    </p>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ItineraryItem, Trip } from '@/types'
import { isRecentlyUpdated } from '@/lib/tripHelpers'
import { itemTypeBadgeClass, itemTypeLabel } from '@/lib/itemTypeStyles'
import ResponseRollup from '@/components/ResponseRollup.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const props = defineProps<{
  trip: Trip
  item: ItineraryItem
  highlighted?: boolean
}>()

const emit = defineEmits<{
  edit: [item: ItineraryItem]
  delete: [item: ItineraryItem]
  notify: [item: ItineraryItem]
}>()

const updated = computed(() => isRecentlyUpdated(props.item))

const assignedTravelers = computed(() => {
  if (!props.item.assignedTravelerIds.length) return []
  const idSet = new Set(props.item.assignedTravelerIds)
  return props.trip.travelers.filter((t) => idSet.has(t.id))
})

const metaLine = computed(() => {
  const parts: string[] = []
  if (props.item.time) parts.push(props.item.time)
  if (props.item.location) parts.push(props.item.location)
  return parts.join(' · ')
})

const notifyDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
})

const lastNotify = computed(() => {
  const logs = (props.trip.notificationLogs ?? []).filter(
    (n) => n.itineraryItemId === props.item.id
  )
  if (!logs.length) return null
  const latest = [...logs].sort((a, b) => b.sentAt.localeCompare(a.sentAt))[0]
  const preview =
    latest.messagePreview.length > 80
      ? `${latest.messagePreview.slice(0, 80)}…`
      : latest.messagePreview
  return {
    when: notifyDateFormatter.format(new Date(latest.sentAt)),
    preview
  }
})

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
</script>
