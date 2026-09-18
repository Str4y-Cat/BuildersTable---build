<template>
  <div class="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
    <div class="flex min-w-[48rem] gap-4 lg:min-w-0 lg:grid lg:grid-cols-3">
      <section
        v-for="column in columns"
        :key="column.status"
        class="flex w-72 shrink-0 flex-col rounded-xl border bg-muted/30 lg:w-auto"
      >
        <header class="flex items-center justify-between gap-2 border-b px-3 py-3">
          <div class="flex items-center gap-2">
            <h2 class="text-sm font-semibold">{{ column.label }}</h2>
            <Badge variant="secondary" class="tabular-nums">
              {{ column.trips.length }}
            </Badge>
          </div>
        </header>

        <div class="flex flex-1 flex-col gap-3 p-3">
          <TripCard
            v-for="trip in column.trips"
            :key="trip.id"
            :trip="trip"
          />
          <p
            v-if="column.trips.length === 0"
            class="rounded-lg border border-dashed px-3 py-8 text-center text-sm text-muted-foreground"
          >
            No {{ column.label.toLowerCase() }} trips
          </p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Trip, TripStatus } from '@/types'
import { tripStatus } from '@/lib/tripHelpers'
import TripCard from '@/components/TripCard.vue'
import { Badge } from '@/components/ui/badge'

const props = defineProps<{
  trips: Trip[]
}>()

const COLUMN_META: { status: TripStatus; label: string }[] = [
  { status: 'upcoming', label: 'Upcoming' },
  { status: 'ongoing', label: 'Ongoing' },
  { status: 'past', label: 'Past' }
]

const columns = computed(() =>
  COLUMN_META.map((meta) => ({
    ...meta,
    trips: props.trips.filter((trip) => tripStatus(trip) === meta.status)
  }))
)
</script>
