<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent
      side="right"
      class="w-full gap-0 p-0 sm:max-w-md"
    >
      <template v-if="item">
        <SheetHeader class="border-b pr-12">
          <div class="flex flex-wrap items-center gap-2">
            <Badge :class="itemTypeBadgeClass(item.type)">
              {{ itemTypeLabel(item.type) }}
            </Badge>
            <Badge v-if="updated" variant="outline">Updated</Badge>
            <Badge v-if="taskProgress.total" variant="secondary">
              {{ taskProgress.done }}/{{ taskProgress.total }} tasks
            </Badge>
          </div>
          <SheetTitle class="text-left text-lg leading-snug">
            {{ item.title }}
          </SheetTitle>
          <SheetDescription class="text-left">
            {{ metaLine || 'Event details and sub-tasks' }}
          </SheetDescription>
        </SheetHeader>

        <div class="flex-1 space-y-6 overflow-y-auto px-4 py-4">
          <p v-if="item.description" class="text-sm text-muted-foreground">
            {{ item.description }}
          </p>

          <!-- Sub-tasks for this event -->
          <section class="space-y-3">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Sub-tasks
            </h3>

            <ul
              v-if="item.tasks.length"
              class="divide-y rounded-lg border"
            >
              <li
                v-for="task in item.tasks"
                :key="task.id"
                class="flex items-start gap-3 px-3 py-2.5"
              >
                <Checkbox
                  :id="`task-${task.id}`"
                  :model-value="task.done"
                  class="mt-0.5"
                  @update:model-value="(v) => onTaskDone(task.id, v)"
                />
                <label
                  :for="`task-${task.id}`"
                  class="min-w-0 flex-1 cursor-pointer text-sm leading-snug"
                  :class="task.done ? 'text-muted-foreground line-through' : ''"
                >
                  {{ task.title }}
                </label>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  class="shrink-0 text-muted-foreground hover:text-destructive"
                  :aria-label="`Remove ${task.title}`"
                  @click="removeTask(task.id)"
                >
                  <X class="h-3.5 w-3.5" />
                </Button>
              </li>
            </ul>
            <p
              v-else
              class="rounded-lg border border-dashed px-3 py-4 text-sm text-muted-foreground"
            >
              No sub-tasks for this event yet.
            </p>

            <form class="flex gap-2" @submit.prevent="submitNewTask">
              <Input
                v-model="newTaskTitle"
                placeholder="Add a sub-task…"
                class="flex-1"
                maxlength="120"
              />
              <Button type="submit" variant="outline" :disabled="!newTaskTitle.trim()">
                Add
              </Button>
            </form>
          </section>

          <!-- Crew responses for this event -->
          <section class="space-y-3">
            <div class="flex items-baseline justify-between gap-2">
              <h3 class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Crew responses
              </h3>
              <ResponseRollup :trip="trip" :item="item" />
            </div>

            <ul
              v-if="crewRows.length"
              class="divide-y rounded-lg border"
            >
              <li
                v-for="row in crewRows"
                :key="row.traveler.id"
                class="flex items-start justify-between gap-3 px-3 py-2.5"
              >
                <div class="min-w-0 space-y-0.5">
                  <div class="flex items-center gap-2">
                    <Avatar class="size-6">
                      <AvatarFallback class="text-[10px]">
                        {{ initials(row.traveler.name) }}
                      </AvatarFallback>
                    </Avatar>
                    <span class="truncate text-sm font-medium">{{ row.traveler.name }}</span>
                  </div>
                  <p class="pl-8 text-xs text-muted-foreground">
                    {{ row.traveler.roleOnProduction }}
                    <template v-if="row.traveler.phone">
                      · Tel. {{ row.traveler.phone }}
                    </template>
                  </p>
                </div>
                <Badge :class="statusClass(row.status)" class="shrink-0 capitalize">
                  {{ row.status }}
                </Badge>
              </li>
            </ul>
            <p
              v-else
              class="rounded-lg border border-dashed px-3 py-4 text-sm text-muted-foreground"
            >
              No travelers on this trip yet.
            </p>

            <p v-if="lastNotify" class="text-xs text-muted-foreground">
              Last notified {{ lastNotify.when }}:
              “{{ lastNotify.preview }}”
            </p>
          </section>
        </div>

        <SheetFooter class="border-t sm:flex-row sm:justify-stretch">
          <Button class="w-full" variant="outline" @click="emit('notify', item)">
            Notify
          </Button>
          <Button class="w-full" variant="outline" @click="emit('edit', item)">
            Edit
          </Button>
          <Button
            class="w-full text-destructive hover:text-destructive"
            variant="ghost"
            @click="emit('delete', item)"
          >
            Delete
          </Button>
        </SheetFooter>
      </template>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import type { ItineraryItem, ResponseStatus, Trip } from '@/types'
import {
  affectedTravelers,
  eventTaskProgress,
  getResponse,
  isRecentlyUpdated
} from '@/lib/tripHelpers'
import { itemTypeBadgeClass, itemTypeLabel } from '@/lib/itemTypeStyles'
import { useTripsStore } from '@/stores/trips'
import ResponseRollup from '@/components/ResponseRollup.vue'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { X } from '@lucide/vue'

const props = defineProps<{
  open: boolean
  trip: Trip
  item: ItineraryItem | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  edit: [item: ItineraryItem]
  delete: [item: ItineraryItem]
  notify: [item: ItineraryItem]
}>()

const { setEventTaskDone, addEventTask, removeEventTask } = useTripsStore()
const newTaskTitle = ref('')

watch(
  () => props.item?.id,
  () => {
    newTaskTitle.value = ''
  }
)

const updated = computed(() =>
  props.item ? isRecentlyUpdated(props.item) : false
)

const taskProgress = computed(() =>
  props.item ? eventTaskProgress(props.item) : { done: 0, total: 0 }
)

const metaLine = computed(() => {
  if (!props.item) return ''
  const parts: string[] = []
  const date = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(new Date(props.item.date))
  parts.push(date)
  if (props.item.time) parts.push(props.item.time)
  if (props.item.location) parts.push(props.item.location)
  return parts.join(' · ')
})

const crewRows = computed(() => {
  if (!props.item) return []
  return affectedTravelers(props.trip, props.item).map((traveler) => ({
    traveler,
    status: (getResponse(props.trip, props.item!.id, traveler.id)?.status ??
      'pending') as ResponseStatus
  }))
})

const notifyDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
})

const lastNotify = computed(() => {
  if (!props.item) return null
  const logs = (props.trip.notificationLogs ?? []).filter(
    (n) => n.itineraryItemId === props.item!.id
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

function statusClass(status: ResponseStatus): string {
  if (status === 'confirmed') {
    return 'border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-100'
  }
  if (status === 'declined') {
    return 'border-transparent bg-red-100 text-red-800 hover:bg-red-100'
  }
  return 'border-transparent bg-amber-100 text-amber-900 hover:bg-amber-100'
}

function onTaskDone(taskId: string, value: boolean | 'indeterminate') {
  if (!props.item || value === 'indeterminate') return
  setEventTaskDone(props.trip.id, props.item.id, taskId, value)
}

function removeTask(taskId: string) {
  if (!props.item) return
  removeEventTask(props.trip.id, props.item.id, taskId)
}

function submitNewTask() {
  if (!props.item) return
  const title = newTaskTitle.value.trim()
  if (!title) return
  try {
    addEventTask(props.trip.id, props.item.id, title)
    newTaskTitle.value = ''
  } catch {
    toast.error('Could not add sub-task')
  }
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
</script>
