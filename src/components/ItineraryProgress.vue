<template>
  <nav
    class="space-y-4"
    aria-label="Itinerary task progress"
  >
    <div class="space-y-1.5">
      <div class="flex items-baseline justify-between gap-2">
        <p :class="eyebrow">
          Progress
        </p>
        <p
          class="text-xs tabular-nums text-muted-foreground"
          :title="overallTitle"
        >
          <template v-if="overall.total">
            {{ overall.done }}/{{ overall.total }}
          </template>
          <template v-else>No tasks</template>
        </p>
      </div>
      <div
        class="h-1.5 overflow-hidden rounded-full bg-muted"
        :title="overallTitle"
        role="progressbar"
        :aria-valuenow="overall.done"
        :aria-valuemin="0"
        :aria-valuemax="overall.total || 0"
        :aria-label="overallTitle"
      >
        <div
          class="h-full rounded-full bg-primary transition-[width] duration-300"
          :style="{ width: `${percent}%` }"
        />
      </div>
    </div>

    <ol v-if="steps.length" class="relative space-y-0">
      <li
        v-for="(step, index) in steps"
        :key="step.item.id"
        class="relative flex gap-2 pb-4 last:pb-0"
      >
        <div
          v-if="index < steps.length - 1"
          class="absolute left-[7px] top-4 bottom-0 w-px bg-border"
          aria-hidden="true"
        />

        <button
          type="button"
          class="relative z-[1] flex min-w-0 flex-1 items-start gap-2 rounded-md px-1 py-0.5 text-left outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring"
          :class="step.tasksComplete ? 'ring-2 ring-foreground ring-offset-1 ring-offset-background' : ''"
          :title="stepTitle(step)"
          :aria-label="stepTitle(step)"
          @click="emit('select', step.item)"
        >
          <span
            class="mt-0.5 flex size-3.5 shrink-0 items-center justify-center rounded-full border-2 bg-background"
            :class="dotClass(step)"
            aria-hidden="true"
          />
          <span class="min-w-0 flex-1 pb-0.5">
            <span
              class="block truncate text-xs font-medium leading-snug"
              :class="step.timeElapsed ? 'text-muted-foreground line-through' : ''"
            >
              {{ step.item.title }}
            </span>
            <span class="mt-0.5 block text-[11px] tabular-nums text-muted-foreground">
              <template v-if="step.progress.total">
                {{ step.progress.done }}/{{ step.progress.total }}
                <span v-if="step.tasksComplete"> · tasks done</span>
              </template>
              <template v-else>No sub-tasks</template>
              <span v-if="step.timeElapsed"> · elapsed</span>
            </span>
          </span>
        </button>
      </li>
    </ol>

    <p
      v-else
      class="text-xs text-muted-foreground"
      title="Add events with sub-tasks to track progress"
    >
      No events yet
    </p>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ItineraryItem, Trip } from '@/types'
import {
  areEventTasksComplete,
  eventTaskProgress,
  isEventTimeElapsed,
  taskProgress
} from '@/lib/tripHelpers'
import { eyebrow } from '@/lib/typography'

const props = defineProps<{
  trip: Trip
}>()

const emit = defineEmits<{
  select: [item: ItineraryItem]
}>()

const overall = computed(() => taskProgress(props.trip))

const percent = computed(() => {
  if (!overall.value.total) return 0
  return Math.round((overall.value.done / overall.value.total) * 100)
})

const overallTitle = computed(() => {
  if (!overall.value.total) return 'No sub-tasks on this trip yet'
  return `${overall.value.done} of ${overall.value.total} sub-tasks complete (${percent.value}%)`
})

const steps = computed(() => {
  const items = [...props.trip.itinerary].sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      (a.time ?? '').localeCompare(b.time ?? '') ||
      a.title.localeCompare(b.title)
  )
  return items.map((item) => {
    const progress = eventTaskProgress(item)
    return {
      item,
      progress,
      tasksComplete: areEventTasksComplete(item),
      timeElapsed: isEventTimeElapsed(item),
      started: progress.done > 0
    }
  })
})

function stepTitle(step: {
  item: ItineraryItem
  progress: { done: number; total: number }
  tasksComplete: boolean
  timeElapsed: boolean
}): string {
  const parts = [step.item.title]
  if (step.timeElapsed) parts.push('time elapsed (done)')
  if (!step.progress.total) {
    parts.push('no sub-tasks')
  } else if (step.tasksComplete) {
    parts.push(`all ${step.progress.total} sub-tasks done`)
  } else {
    parts.push(`${step.progress.done} of ${step.progress.total} sub-tasks done`)
  }
  return parts.join(' — ')
}

function dotClass(step: {
  tasksComplete: boolean
  started: boolean
  timeElapsed: boolean
  progress: { total: number }
}): string {
  if (step.tasksComplete) {
    return 'border-foreground bg-foreground'
  }
  if (step.timeElapsed) {
    return 'border-foreground/70 bg-foreground/40'
  }
  if (step.started) {
    return 'border-primary'
  }
  if (!step.progress.total) {
    return 'border-muted-foreground/30'
  }
  return 'border-muted-foreground/50'
}
</script>
