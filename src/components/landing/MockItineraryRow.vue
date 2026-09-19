<template>
  <div
    class="flex items-start gap-3 rounded-xl border px-3 py-3 transition-all duration-500"
    :class="highlighted ? 'border-foreground/20 bg-muted/60' : 'border-transparent'"
  >
    <div class="w-12 shrink-0 pt-0.5">
      <span
        class="font-mono text-xs tabular-nums transition-colors duration-500"
        :class="highlighted ? 'font-semibold text-foreground' : 'text-muted-foreground'"
      >
        {{ time }}
      </span>
    </div>

    <div class="min-w-0 flex-1 space-y-1.5">
      <div class="flex flex-wrap items-center gap-2">
        <Badge :class="itemTypeBadgeClass(type)">{{ itemTypeLabel(type) }}</Badge>
        <span
          v-if="updated"
          class="inline-flex items-center gap-1.5 text-[11px] font-medium text-orange-700"
        >
          <span class="size-1.5 rounded-full bg-orange-500" />
          Updated
        </span>
      </div>
      <p class="truncate text-sm font-medium leading-snug">{{ title }}</p>
      <p class="truncate text-xs text-muted-foreground">{{ location }}</p>
    </div>

    <div v-if="attendees.length" class="flex shrink-0 -space-x-1.5 pt-0.5">
      <MockAvatar
        v-for="person in attendees"
        :key="person"
        :label="person"
        :active="highlighted"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ItineraryItemType } from '@/types'
import { Badge } from '@/components/ui/badge'
import { itemTypeBadgeClass, itemTypeLabel } from '@/lib/itemTypeStyles'
import MockAvatar from './MockAvatar.vue'

withDefaults(
  defineProps<{
    time: string
    title: string
    location: string
    type: ItineraryItemType
    attendees?: string[]
    /** Row is the focus of the demo's current phase. */
    highlighted?: boolean
    /** Show the "Updated" accent flag. */
    updated?: boolean
  }>(),
  { attendees: () => [], highlighted: false, updated: false }
)
</script>
