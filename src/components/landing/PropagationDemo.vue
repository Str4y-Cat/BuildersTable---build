<template>
  <!--
    Self-running recreation of the core loop: edit -> auto-notify -> confirm.
    Built from the app's real tokens and badge helpers so it cannot drift from
    the product's actual look.

    SWAP POINT: if a real screen recording lands later, replace this component's
    root with a <video autoplay loop muted playsinline> and nothing in the
    surrounding section needs to change.
  -->
  <div
    ref="root"
    class="grid items-start gap-4 p-4 sm:p-6 lg:grid-cols-[1.45fr_1fr] lg:gap-6"
  >
    <!-- ── Curator pane ─────────────────────────────────────────────── -->
    <div class="min-w-0 space-y-4">
      <div class="flex items-baseline justify-between gap-3">
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold">{{ TRIP_NAME }}</p>
          <p class="truncate text-xs text-muted-foreground">
            Day 3 · {{ TRIP_DESTINATION }}
          </p>
        </div>
        <span class="shrink-0 text-xs text-muted-foreground">Curator view</span>
      </div>

      <div class="space-y-1">
        <MockItineraryRow
          :time="DEMO_CONTEXT_ROWS[0]!.time"
          :title="DEMO_CONTEXT_ROWS[0]!.title"
          :location="DEMO_CONTEXT_ROWS[0]!.location"
          :type="DEMO_CONTEXT_ROWS[0]!.type"
          :attendees="DEMO_CONTEXT_ROWS[0]!.attendees"
        />

        <!-- The edited item -->
        <div
          class="rounded-xl border px-3 py-3 transition-all duration-500"
          :class="
            isEditing
              ? 'border-foreground/25 bg-muted/70 shadow-sm'
              : 'border-transparent'
          "
        >
          <div class="flex items-start gap-3">
            <div class="w-12 shrink-0 pt-0.5">
              <span
                class="inline-block font-mono text-xs font-semibold tabular-nums transition-all duration-500"
                :class="
                  timeChanged
                    ? 'scale-105 text-orange-700'
                    : 'text-muted-foreground'
                "
              >
                {{ displayTime }}
              </span>
            </div>

            <div class="min-w-0 flex-1 space-y-1.5">
              <div class="flex flex-wrap items-center gap-2">
                <Badge :class="itemTypeBadgeClass(DEMO_ITEM.type)">
                  {{ itemTypeLabel(DEMO_ITEM.type) }}
                </Badge>
                <Transition name="demo-fade">
                  <span
                    v-if="timeChanged"
                    class="inline-flex items-center gap-1.5 text-[11px] font-medium text-orange-700"
                  >
                    <span class="size-1.5 rounded-full bg-orange-500" />
                    Updated
                  </span>
                </Transition>
              </div>
              <p class="truncate text-sm font-medium leading-snug">
                {{ DEMO_ITEM.title }}
              </p>
              <p class="truncate text-xs text-muted-foreground">
                {{ DEMO_ITEM.location }}
              </p>
            </div>
          </div>

          <!-- Affected travelers + rollup -->
          <div class="mt-3 space-y-2 border-t border-border/70 pt-3 pl-15">
            <div class="flex flex-wrap items-center gap-1.5">
              <span
                v-for="person in AFFECTED_TRAVELERS"
                :key="person.id"
                class="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs transition-all duration-500"
                :class="
                  travelersLit
                    ? 'border-foreground/25 bg-background font-medium text-foreground'
                    : 'border-transparent bg-muted text-muted-foreground'
                "
              >
                <MockAvatar :label="initials(person.name)" :active="travelersLit" />
                {{ person.name }}
              </span>
            </div>

            <p class="text-xs text-muted-foreground">
              <span class="font-semibold tabular-nums text-foreground">
                {{ confirmedCount }}
              </span>
              of
              <span class="font-semibold tabular-nums text-foreground">3</span>
              confirmed
              <span class="mx-1 text-border">·</span>
              <span class="font-semibold tabular-nums text-foreground">
                {{ 3 - confirmedCount }}
              </span>
              pending
            </p>
          </div>
        </div>

        <MockItineraryRow
          :time="DEMO_CONTEXT_ROWS[1]!.time"
          :title="DEMO_CONTEXT_ROWS[1]!.title"
          :location="DEMO_CONTEXT_ROWS[1]!.location"
          :type="DEMO_CONTEXT_ROWS[1]!.type"
          :attendees="DEMO_CONTEXT_ROWS[1]!.attendees"
        />
      </div>

      <!-- Unaffected travelers stay deliberately quiet -->
      <div class="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2">
        <span class="text-[11px] text-muted-foreground">Not on this item:</span>
        <div class="flex -space-x-1.5">
          <MockAvatar
            v-for="person in UNAFFECTED_TRAVELERS"
            :key="person.id"
            :label="initials(person.name)"
          />
        </div>
        <span class="ml-auto text-[11px] text-muted-foreground">Not notified</span>
      </div>
    </div>

    <!-- ── Traveler pane ────────────────────────────────────────────── -->
    <div class="min-w-0">
      <div
        class="mx-auto flex max-w-[280px] flex-col overflow-hidden rounded-[1.75rem] border-[6px] border-foreground/90 bg-background"
      >
        <div class="flex items-center justify-between bg-foreground/90 px-4 pb-2">
          <span class="text-[10px] font-medium text-background/70">9:41</span>
          <span class="text-[10px] font-medium text-background/70">TellMe</span>
        </div>

        <!-- min-height keeps the frame from resizing as the notification enters -->
        <div class="min-h-[248px] space-y-3 p-3">
          <div>
            <p class="text-xs font-semibold">Marcus Williams</p>
            <p class="text-[11px] text-muted-foreground">Director · Day 3</p>
          </div>

          <Transition name="demo-slide">
            <div
              v-if="notificationVisible"
              class="space-y-2.5 rounded-xl border border-foreground/20 bg-muted/50 p-3"
            >
              <div class="flex items-center gap-1.5">
                <Bell class="size-3 text-orange-600" />
                <span class="text-[11px] font-semibold text-orange-700">
                  Schedule change
                </span>
              </div>

              <p class="text-xs font-medium leading-snug">
                {{ DEMO_ITEM.title }}
              </p>
              <p class="text-[11px] leading-snug text-muted-foreground">
                Moved
                <span class="line-through">{{ DEMO_ITEM.originalTime }}</span>
                →
                <span class="font-semibold text-foreground">
                  {{ DEMO_ITEM.updatedTime }}
                </span>
              </p>

              <div v-if="!hasConfirmed" class="flex gap-1.5 pt-0.5">
                <span
                  class="flex-1 rounded-md px-2 py-1.5 text-center text-[11px] font-medium transition-all duration-300"
                  :class="
                    confirmPressed
                      ? 'scale-95 bg-foreground/80 text-background'
                      : 'bg-foreground text-background'
                  "
                >
                  Confirm
                </span>
                <span
                  class="flex-1 rounded-md border border-border px-2 py-1.5 text-center text-[11px] font-medium text-muted-foreground"
                >
                  Decline
                </span>
              </div>

              <Transition name="demo-fade">
                <div
                  v-if="hasConfirmed"
                  class="flex items-center gap-1.5 rounded-md bg-emerald-100 px-2 py-1.5"
                >
                  <Check class="size-3 text-emerald-700" />
                  <span class="text-[11px] font-medium text-emerald-800">
                    Confirmed
                  </span>
                </div>
              </Transition>
            </div>
          </Transition>

          <div
            v-if="!notificationVisible"
            class="rounded-xl border border-dashed border-border p-4 text-center"
          >
            <p class="text-[11px] text-muted-foreground">Itinerary up to date</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  useIntersectionObserver,
  usePreferredReducedMotion
} from '@vueuse/core'
import { Bell, Check } from '@lucide/vue'
import { Badge } from '@/components/ui/badge'
import { itemTypeBadgeClass, itemTypeLabel } from '@/lib/itemTypeStyles'
import MockAvatar from './MockAvatar.vue'
import MockItineraryRow from './MockItineraryRow.vue'
import {
  AFFECTED_TRAVELERS,
  DEMO_CONTEXT_ROWS,
  DEMO_ITEM,
  TRIP_DESTINATION,
  TRIP_NAME,
  UNAFFECTED_TRAVELERS
} from './mockContent'
import { initials } from '@/lib/tripHelpers'

type Phase = 'idle' | 'edit' | 'propagate' | 'notify' | 'confirm' | 'hold'

/** Phase order and how long each one holds, in ms. Total ≈ 18s. */
const SCRIPT: ReadonlyArray<{ phase: Phase; duration: number }> = [
  { phase: 'idle', duration: 2000 },
  { phase: 'edit', duration: 3000 },
  { phase: 'propagate', duration: 3000 },
  { phase: 'notify', duration: 3000 },
  { phase: 'confirm', duration: 4000 },
  { phase: 'hold', duration: 3000 }
]

const root = ref<HTMLElement | null>(null)
const step = ref(0)
const reducedMotion = usePreferredReducedMotion()
const prefersReduced = computed(() => reducedMotion.value === 'reduce')

const phase = computed<Phase>(() => SCRIPT[step.value]!.phase)
const reachedIndex = computed(() =>
  SCRIPT.findIndex((entry) => entry.phase === phase.value)
)

function atOrAfter(target: Phase): boolean {
  // When reduced motion is on, render the settled end state with no animation.
  if (prefersReduced.value) return true
  return reachedIndex.value >= SCRIPT.findIndex((e) => e.phase === target)
}

const isEditing = computed(() => !prefersReduced.value && phase.value === 'edit')
const timeChanged = computed(() => atOrAfter('edit'))
const travelersLit = computed(() => atOrAfter('propagate'))
const notificationVisible = computed(() => atOrAfter('notify'))
const confirmPressed = computed(
  () => !prefersReduced.value && phase.value === 'confirm'
)
const hasConfirmed = computed(() => atOrAfter('hold'))

const displayTime = computed(() =>
  timeChanged.value ? DEMO_ITEM.updatedTime : DEMO_ITEM.originalTime
)
// Edit resets every affected traveler to pending; one has re-confirmed by 'hold'.
const confirmedCount = computed(() => {
  if (prefersReduced.value) return 1
  if (!timeChanged.value) return 3
  return hasConfirmed.value ? 1 : 0
})

let timer: ReturnType<typeof setTimeout> | null = null

function clearTimer(): void {
  if (timer !== null) {
    clearTimeout(timer)
    timer = null
  }
}

function scheduleNext(): void {
  clearTimer()
  timer = setTimeout(() => {
    step.value = (step.value + 1) % SCRIPT.length
    scheduleNext()
  }, SCRIPT[step.value]!.duration)
}

function start(): void {
  if (prefersReduced.value) return
  scheduleNext()
}

/**
 * Runs on mount so the loop never depends on the observer firing, and pauses
 * off-screen so nothing animates for a viewer who isn't looking at it.
 * Re-entering the viewport restarts from the top, so it's always seen in order.
 */
const { stop } = useIntersectionObserver(
  root,
  ([entry]) => {
    if (prefersReduced.value) return
    if (entry?.isIntersecting) {
      step.value = 0
      start()
    } else {
      clearTimer()
    }
  },
  { threshold: 0.2 }
)

onMounted(start)

watch(prefersReduced, (reduced) => {
  if (reduced) clearTimer()
  else start()
})

onBeforeUnmount(() => {
  clearTimer()
  stop()
})
</script>

<style scoped>
.demo-fade-enter-active,
.demo-fade-leave-active {
  transition: opacity 400ms ease;
}
.demo-fade-enter-from,
.demo-fade-leave-to {
  opacity: 0;
}

.demo-slide-enter-active {
  transition: opacity 450ms ease, transform 450ms cubic-bezier(0.22, 1, 0.36, 1);
}
.demo-slide-leave-active {
  transition: opacity 250ms ease;
}
.demo-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}
.demo-slide-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .demo-fade-enter-active,
  .demo-fade-leave-active,
  .demo-slide-enter-active,
  .demo-slide-leave-active {
    transition: none;
  }
}
</style>
