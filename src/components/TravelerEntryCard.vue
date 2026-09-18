<template>
  <article class="space-y-3 px-4 py-4">
    <div class="space-y-1">
      <div class="flex flex-wrap items-center gap-2">
        <Badge :class="itemTypeBadgeClass(item.type)">
          {{ itemTypeLabel(item.type) }}
        </Badge>
        <Badge v-if="updated" variant="outline">Updated</Badge>
        <Badge
          v-if="responseStatus === 'confirmed'"
          class="border-transparent bg-green-100 text-green-800"
        >
          Confirmed
        </Badge>
        <Badge v-else-if="responseStatus === 'declined'" variant="destructive">
          Declined
        </Badge>
      </div>
      <h3 class="font-medium leading-snug">{{ item.title }}</h3>
      <p v-if="metaLine" class="text-sm text-muted-foreground">{{ metaLine }}</p>
      <p v-if="item.description" class="text-sm text-muted-foreground">
        {{ item.description }}
      </p>
    </div>

    <div v-if="showActions" class="flex flex-wrap gap-2">
      <Button size="sm" @click="respond('confirmed')">Confirm</Button>
      <Button size="sm" variant="outline" @click="respond('declined')">
        Decline
      </Button>
    </div>

    <div v-else-if="hasSettledResponse" class="flex flex-wrap items-center gap-2">
      <Button size="sm" variant="ghost" @click="editing = true">
        Change response
      </Button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import type { ItineraryItem, ResponseStatus, Trip } from '@/types'
import { getResponse, isRecentlyUpdated } from '@/lib/tripHelpers'
import { itemTypeBadgeClass, itemTypeLabel } from '@/lib/itemTypeStyles'
import { useTripsStore } from '@/stores/trips'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const props = defineProps<{
  trip: Trip
  item: ItineraryItem
  travelerId: string
}>()

const { respondToItem } = useTripsStore()
const editing = ref(false)

watch(
  () => props.item.id,
  () => {
    editing.value = false
  }
)

const response = computed(() =>
  getResponse(props.trip, props.item.id, props.travelerId)
)

const responseStatus = computed((): ResponseStatus | null => response.value?.status ?? null)

const updated = computed(() => isRecentlyUpdated(props.item, response.value))

const hasSettledResponse = computed(
  () => responseStatus.value === 'confirmed' || responseStatus.value === 'declined'
)

const needsResponse = computed(() => {
  if (responseStatus.value === 'pending') return true
  if (!response.value && updated.value) return true
  return false
})

const showActions = computed(() => editing.value || needsResponse.value)

const metaLine = computed(() => {
  const parts: string[] = []
  if (props.item.time) parts.push(props.item.time)
  if (props.item.location) parts.push(props.item.location)
  return parts.join(' · ')
})

function respond(status: Exclude<ResponseStatus, 'pending'>) {
  respondToItem(props.trip.id, props.item.id, props.travelerId, status)
  editing.value = false
  toast.success(status === 'confirmed' ? 'Confirmed' : 'Declined')
}
</script>
