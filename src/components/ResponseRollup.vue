<template>
  <p class="text-sm text-muted-foreground">
    <span class="font-semibold text-foreground">{{ rollup.confirmed }}</span>
    confirmed
    <span class="mx-1.5 text-border">·</span>
    <span class="font-semibold text-foreground">{{ rollup.declined }}</span>
    declined
    <span class="mx-1.5 text-border">·</span>
    <span class="font-semibold text-foreground">{{ rollup.pending }}</span>
    pending
  </p>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ItineraryItem, Trip } from '@/types'
import { responseRollup } from '@/lib/tripHelpers'

const props = defineProps<{
  trip: Trip
  item: ItineraryItem
}>()

const rollup = computed(() => responseRollup(props.trip, props.item))
</script>
