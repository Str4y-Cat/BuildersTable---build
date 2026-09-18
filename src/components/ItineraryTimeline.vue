<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
    <!-- Progress tracker — left of itinerary -->
    <aside
      class="w-full shrink-0 rounded-xl border bg-muted/20 p-3 sm:sticky sm:top-4 sm:w-44 lg:w-48"
    >
      <ItineraryProgress :trip="trip" @select="emit('select', $event)" />
    </aside>

    <div class="min-w-0 flex-1 space-y-6">
      <div
        v-if="dayGroups.length === 0"
        class="rounded-lg border border-dashed p-6 text-sm text-muted-foreground"
      >
        No itinerary events yet.
      </div>

      <section v-for="group in dayGroups" :key="group.date" class="space-y-2">
        <h3
          class="text-sm font-semibold text-muted-foreground"
          :title="`Events on ${group.label}`"
        >
          {{ group.label }}
        </h3>
        <div class="divide-y rounded-lg border">
          <ItineraryItemCard
            v-for="item in group.items"
            :key="item.id"
            :trip="trip"
            :item="item"
            :highlighted="item.id === highlightItemId"
            @select="emit('select', $event)"
            @edit="emit('edit', $event)"
            @delete="emit('delete', $event)"
            @notify="emit('notify', $event)"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ItineraryItem, Trip } from '@/types'
import ItineraryItemCard from '@/components/ItineraryItemCard.vue'
import ItineraryProgress from '@/components/ItineraryProgress.vue'

const props = defineProps<{
  trip: Trip
  highlightItemId?: string | null
}>()

const emit = defineEmits<{
  select: [item: ItineraryItem]
  edit: [item: ItineraryItem]
  delete: [item: ItineraryItem]
  notify: [item: ItineraryItem]
}>()

const dayFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'short',
  day: 'numeric',
  year: 'numeric'
})

const dayGroups = computed(() => {
  const byDate = new Map<string, ItineraryItem[]>()
  for (const item of props.trip.itinerary) {
    const list = byDate.get(item.date) ?? []
    list.push(item)
    byDate.set(item.date, list)
  }

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, items]) => ({
      date,
      label: dayFormatter.format(new Date(date)),
      items: [...items].sort(
        (a, b) =>
          (a.time ?? '').localeCompare(b.time ?? '') || a.title.localeCompare(b.title)
      )
    }))
})
</script>
