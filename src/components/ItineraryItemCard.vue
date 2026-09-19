<template>
  <article
    role="button"
    tabindex="0"
    class="space-y-3 px-4 py-4 transition-colors duration-300 outline-none cursor-pointer hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
    :class="[
      highlighted ? 'bg-muted/50 ring-2 ring-inset ring-primary/20' : '',
      timeElapsed ? 'opacity-80' : ''
    ]"
    :aria-label="timeElapsed ? `Done event ${item.title}` : `Open event ${item.title}`"
    @click="emit('select', item)"
    @keydown.enter.prevent="emit('select', item)"
    @keydown.space.prevent="emit('select', item)"
  >
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex flex-wrap items-center gap-2">
          <Badge :class="itemTypeBadgeClass(item.type)">
            {{ itemTypeLabel(item.type) }}
          </Badge>
          <Badge
            v-if="timeElapsed"
            variant="secondary"
            title="Scheduled time has passed"
          >
            Done
          </Badge>
          <Badge v-if="updated" variant="outline">Updated</Badge>
          <Badge
            v-if="taskProgress.total"
            variant="secondary"
            :title="`${taskProgress.done} of ${taskProgress.total} sub-tasks done`"
            :class="tasksComplete ? 'ring-1 ring-foreground' : ''"
          >
            {{ taskProgress.done }}/{{ taskProgress.total }}
          </Badge>
        </div>
        <h3
          class="font-medium leading-snug"
          :class="timeElapsed ? 'text-muted-foreground line-through' : ''"
          :title="item.title"
        >
          {{ item.title }}
        </h3>
        <p
          v-if="metaLine"
          class="text-sm text-muted-foreground"
          :title="metaLine"
        >
          {{ metaLine }}
        </p>
        <p
          v-if="item.description"
          class="text-sm text-muted-foreground line-clamp-2"
          :title="item.description"
        >
          {{ item.description }}
        </p>
      </div>

      <div class="flex shrink-0 items-center gap-1">
        <div class="hidden flex-wrap justify-end gap-2 sm:flex" @click.stop>
          <Button
            variant="outline"
            size="sm"
            title="Notify assigned travelers"
            @click="emit('notify', item)"
          >
            Notify
          </Button>
          <Button
            variant="outline"
            size="sm"
            title="Edit this event"
            @click="emit('edit', item)"
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            class="text-destructive hover:text-destructive"
            title="Delete this event"
            @click="emit('delete', item)"
          >
            Delete
          </Button>
        </div>
        <ChevronRight
          class="h-4 w-4 text-muted-foreground"
          aria-hidden="true"
          title="Open event panel"
        />
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
          class="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs"
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
import { eventTaskProgress, isEventTimeElapsed, areEventTasksComplete, isRecentlyUpdated, initials } from '@/lib/tripHelpers'
import { itemTypeBadgeClass, itemTypeLabel } from '@/lib/itemTypeStyles'
import ResponseRollup from '@/components/ResponseRollup.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ChevronRight } from '@lucide/vue'

const props = defineProps<{
  trip: Trip
  item: ItineraryItem
  highlighted?: boolean
}>()

const emit = defineEmits<{
  select: [item: ItineraryItem]
  edit: [item: ItineraryItem]
  delete: [item: ItineraryItem]
  notify: [item: ItineraryItem]
}>()

const updated = computed(() => isRecentlyUpdated(props.item))
const taskProgress = computed(() => eventTaskProgress(props.item))
const tasksComplete = computed(() => areEventTasksComplete(props.item))
const timeElapsed = computed(() => isEventTimeElapsed(props.item))

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
  const latest = [...logs].sort((a, b) => b.sentAt.localeCompare(a.sentAt))[0]!
  const preview =
    latest.messagePreview.length > 80
      ? `${latest.messagePreview.slice(0, 80)}…`
      : latest.messagePreview
  return {
    when: notifyDateFormatter.format(new Date(latest.sentAt)),
    preview
  }
})
</script>
