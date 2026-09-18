<template>
  <div class="space-y-6">
    <div
      v-if="dayGroups.length === 0"
      class="rounded-lg border border-dashed p-6 text-sm text-muted-foreground"
    >
      No itinerary items yet.
    </div>

    <section v-for="group in dayGroups" :key="group.date" class="space-y-2">
      <h3 class="text-sm font-semibold text-muted-foreground">
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ItineraryItem, Trip } from '@/types'
import ItineraryItemCard from '@/components/ItineraryItemCard.vue'

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
