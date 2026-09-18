<template>
  <section class="rounded-xl border">
    <div class="flex flex-wrap items-center gap-2 px-4 py-3">
      <button
        type="button"
        class="flex min-w-0 flex-1 items-center gap-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
        :aria-expanded="open"
        @click="open = !open"
      >
        <ChevronDown
          class="h-4 w-4 shrink-0 text-muted-foreground transition-transform"
          :class="open ? 'rotate-180' : ''"
        />
        <h2 class="text-lg font-semibold">Travelers</h2>
        <span class="text-sm text-muted-foreground">{{ trip.travelers.length }}</span>
      </button>
      <Button size="sm" class="shrink-0" @click.stop="formOpen = true">
        <Plus class="mr-2 h-4 w-4" />
        Add traveler
      </Button>
    </div>

    <div v-show="open" class="space-y-3 border-t px-4 py-3">
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
          class="flex flex-wrap items-start justify-between gap-3 px-4 py-3"
        >
          <div class="min-w-0 flex-1 space-y-0.5">
            <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
              <p class="font-medium">{{ traveler.name }}</p>
              <div class="flex flex-wrap items-center gap-1.5">
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
            </div>
            <p class="text-sm text-muted-foreground">{{ traveler.roleOnProduction }}</p>
            <p class="text-sm text-muted-foreground truncate">{{ traveler.email }}</p>
            <p v-if="traveler.phone" class="text-sm text-muted-foreground">
              Tel. {{ traveler.phone }}
            </p>
          </div>
        </li>
      </ul>
    </div>

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
import { ChevronDown, Plus } from '@lucide/vue'

const props = defineProps<{
  trip: Trip
}>()

const { removeTraveler } = useTripsStore()

/** Default closed per trip page chrome */
const open = ref(false)
const formOpen = ref(false)
const deleteTarget = ref<Traveler | null>(null)
const deleteOpen = ref(false)

function askRemove(traveler: Traveler) {
  deleteTarget.value = traveler
  deleteOpen.value = true
}

function onDeleteOpenChange(value: boolean) {
  deleteOpen.value = value
  if (!value) deleteTarget.value = null
}

function confirmRemove() {
  if (!deleteTarget.value) return
  removeTraveler(props.trip.id, deleteTarget.value.id)
  toast.success('Traveler removed')
  deleteOpen.value = false
  deleteTarget.value = null
}
</script>
