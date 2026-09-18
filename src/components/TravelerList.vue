<template>
  <section class="space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="flex items-baseline gap-2">
        <h2 class="text-lg font-semibold">Travelers</h2>
        <span class="text-sm text-muted-foreground">{{ trip.travelers.length }}</span>
      </div>
      <Button size="sm" @click="formOpen = true">
        <Plus class="mr-2 h-4 w-4" />
        Add traveler
      </Button>
    </div>

    <div
      v-if="trip.travelers.length === 0"
      class="rounded-lg border border-dashed p-4 text-sm text-muted-foreground"
    >
      No travelers yet.
    </div>

    <ul v-else class="divide-y rounded-lg border">
      <li
        v-for="traveler in trip.travelers"
        :key="traveler.id"
        class="space-y-2 px-4 py-3"
      >
        <div class="min-w-0">
          <p class="font-medium">{{ traveler.name }}</p>
          <p class="text-sm text-muted-foreground">{{ traveler.roleOnProduction }}</p>
          <p class="text-sm text-muted-foreground truncate">{{ traveler.email }}</p>
          <p v-if="traveler.phone" class="text-sm text-muted-foreground">
            {{ traveler.phone }}
          </p>
        </div>
        <div class="flex flex-wrap gap-2">
          <ShareLinkButton :share-code="traveler.shareCode" />
          <Button
            variant="ghost"
            size="sm"
            class="text-destructive hover:text-destructive"
            @click="askRemove(traveler)"
          >
            Remove
          </Button>
        </div>
      </li>
    </ul>

    <TravelerForm v-model:open="formOpen" :trip="trip" />

    <Dialog :open="deleteOpen" @update:open="onDeleteOpenChange">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Remove traveler?</DialogTitle>
          <DialogDescription>
            <template v-if="deleteTarget">
              “{{ deleteTarget.name }}” will be removed from this trip and any item assignments.
            </template>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" @click="deleteOpen = false">Cancel</Button>
          <Button variant="destructive" @click="confirmRemove">Remove</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import type { Traveler, Trip } from '@/types'
import { useTripsStore } from '@/stores/trips'
import ShareLinkButton from '@/components/ShareLinkButton.vue'
import TravelerForm from '@/components/TravelerForm.vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Plus } from '@lucide/vue'

const props = defineProps<{
  trip: Trip
}>()

const { removeTraveler } = useTripsStore()

const formOpen = ref(false)
const deleteTarget = ref<Traveler | null>(null)
const deleteOpen = ref(false)

function askRemove(traveler: Traveler) {
  deleteTarget.value = traveler
  deleteOpen.value = true
}

function onDeleteOpenChange(open: boolean) {
  deleteOpen.value = open
  if (!open) deleteTarget.value = null
}

function confirmRemove() {
  if (!deleteTarget.value) return
  removeTraveler(props.trip.id, deleteTarget.value.id)
  toast.success('Traveler removed')
  deleteOpen.value = false
  deleteTarget.value = null
}
</script>
