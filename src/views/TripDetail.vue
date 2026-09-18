<template>
  <div class="min-h-screen bg-background">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Not found -->
      <div v-if="!trip" class="mx-auto max-w-md py-16 text-center">
        <h1 class="text-2xl font-bold">Trip not found</h1>
        <p class="mt-2 text-muted-foreground">
          No trip matches
          <span class="font-medium text-foreground">{{ tripId }}</span>.
        </p>
        <Button class="mt-6" @click="goDashboard">
          <ArrowLeft class="mr-2 h-4 w-4" />
          Back to My Trips
        </Button>
      </div>

      <!-- Found -->
      <template v-else>
        <div class="mb-6">
          <button
            type="button"
            class="mb-4 inline-flex items-center text-sm text-muted-foreground transition-opacity hover:text-foreground hover:opacity-80"
            @click="goDashboard"
          >
            <ArrowLeft class="mr-1.5 h-4 w-4" />
            My Trips
          </button>
          <TripHeader :trip="trip" />
        </div>

        <div class="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <!-- Itinerary ~60% -->
          <section class="space-y-4 lg:col-span-3">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-baseline gap-2">
                <h2 class="text-lg font-semibold">Itinerary</h2>
                <span class="text-sm text-muted-foreground">
                  {{ trip.itinerary.length }} items
                </span>
              </div>
              <Button size="sm" @click="openCreate">
                <Plus class="mr-2 h-4 w-4" />
                Add entry
              </Button>
            </div>

            <ItineraryTimeline
              :trip="trip"
              :highlight-item-id="highlightItemId"
              @select="openItemPanel"
              @edit="openEdit"
              @delete="askDelete"
              @notify="openNotify"
            />

            <!-- Mobile: reveal travelers & documents -->
            <Button
              class="w-full lg:hidden"
              variant="outline"
              @click="mobileSidebarOpen = !mobileSidebarOpen"
            >
              <ChevronDown
                class="mr-2 h-4 w-4 transition-transform"
                :class="mobileSidebarOpen ? 'rotate-180' : ''"
              />
              Travelers &amp; documents
              <span class="ml-1 text-muted-foreground">
                ({{ trip.travelers.length }} · {{ trip.documents.length }})
              </span>
            </Button>
          </section>

          <!-- Sidebar ~40% — always on lg; collapsible on mobile -->
          <aside
            class="space-y-8 lg:col-span-2"
            :class="mobileSidebarOpen ? 'block' : 'hidden lg:block'"
          >
            <TravelerList :trip="trip" />

            <section class="space-y-3">
              <div class="flex items-baseline justify-between gap-2">
                <h2 class="text-lg font-semibold">Documents</h2>
                <span class="text-sm text-muted-foreground">
                  {{ trip.documents.length }}
                </span>
              </div>
              <DocumentList :documents="trip.documents" />
            </section>
          </aside>
        </div>

        <ItineraryItemForm
          v-model:open="formOpen"
          :trip="trip"
          :item="editingItem"
        />

        <ItineraryItemPanel
          v-model:open="panelOpen"
          :trip="trip"
          :item="panelItem"
          @edit="onPanelEdit"
          @delete="onPanelDelete"
          @notify="onPanelNotify"
        />

        <NotificationComposer
          v-model:open="notifyOpen"
          :trip="trip"
          :item="notifyItem"
          @sent="onNotifySent"
        />

        <Dialog :open="deleteOpen" @update:open="onDeleteOpenChange">
          <DialogContent class="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Delete this item?</DialogTitle>
              <DialogDescription>
                <template v-if="deleteTarget">
                  “{{ deleteTarget.title }}” will be removed from this trip’s itinerary.
                </template>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" @click="deleteOpen = false">Cancel</Button>
              <Button variant="destructive" @click="confirmDelete">Delete</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useTripsStore } from '@/stores/trips'
import type { ItineraryItem } from '@/types'
import TripHeader from '@/components/TripHeader.vue'
import ItineraryTimeline from '@/components/ItineraryTimeline.vue'
import ItineraryItemForm from '@/components/ItineraryItemForm.vue'
import ItineraryItemPanel from '@/components/ItineraryItemPanel.vue'
import NotificationComposer from '@/components/NotificationComposer.vue'
import TravelerList from '@/components/TravelerList.vue'
import DocumentList from '@/components/DocumentList.vue'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { ArrowLeft, Plus, ChevronDown } from '@lucide/vue'

const route = useRoute()
const router = useRouter()
const { getTrip, removeItineraryItem } = useTripsStore()

const tripId = computed(() => String(route.params.tripId))
const trip = computed(() => getTrip(tripId.value))

const formOpen = ref(false)
const editingItem = ref<ItineraryItem | null>(null)
const panelOpen = ref(false)
const panelItemId = ref<string | null>(null)
const deleteTarget = ref<ItineraryItem | null>(null)
const deleteOpen = ref(false)
const notifyOpen = ref(false)
const notifyItem = ref<ItineraryItem | null>(null)
const mobileSidebarOpen = ref(false)
const highlightItemId = ref<string | null>(null)
let highlightTimer: ReturnType<typeof setTimeout> | null = null

const panelItem = computed(() => {
  if (!trip.value || !panelItemId.value) return null
  return trip.value.itinerary.find((i) => i.id === panelItemId.value) ?? null
})

const goDashboard = () => {
  router.push('/dashboard')
}

function openCreate() {
  editingItem.value = null
  formOpen.value = true
}

function openItemPanel(item: ItineraryItem) {
  panelItemId.value = item.id
  panelOpen.value = true
}

function openEdit(item: ItineraryItem) {
  editingItem.value = item
  formOpen.value = true
}

function openNotify(item: ItineraryItem) {
  notifyItem.value = item
  notifyOpen.value = true
}

function onPanelEdit(item: ItineraryItem) {
  panelOpen.value = false
  openEdit(item)
}

function onPanelDelete(item: ItineraryItem) {
  panelOpen.value = false
  askDelete(item)
}

function onPanelNotify(item: ItineraryItem) {
  panelOpen.value = false
  openNotify(item)
}

function onNotifySent(itemId: string) {
  if (highlightTimer) clearTimeout(highlightTimer)
  highlightItemId.value = itemId
  highlightTimer = setTimeout(() => {
    highlightItemId.value = null
    highlightTimer = null
  }, 1500)
}

function askDelete(item: ItineraryItem) {
  deleteTarget.value = item
  deleteOpen.value = true
}

function onDeleteOpenChange(open: boolean) {
  deleteOpen.value = open
  if (!open) deleteTarget.value = null
}

function confirmDelete() {
  if (!trip.value || !deleteTarget.value) return
  const deletedId = deleteTarget.value.id
  removeItineraryItem(trip.value.id, deletedId)
  if (panelItemId.value === deletedId) {
    panelOpen.value = false
    panelItemId.value = null
  }
  toast.success('Entry deleted')
  deleteOpen.value = false
  deleteTarget.value = null
}
</script>
