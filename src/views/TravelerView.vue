<template>
  <div class="min-h-screen bg-background">
    <div class="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <!-- Not found -->
      <div v-if="!resolved" class="py-16 text-center">
        <h1 class="text-2xl font-bold">Itinerary not found</h1>
        <p class="mt-2 text-muted-foreground">
          No traveler matches share code
          <span class="font-medium text-foreground">{{ shareCode }}</span>.
        </p>
        <Button class="mt-6" variant="outline" @click="goDashboard">
          Go to My Trips
        </Button>
      </div>

      <!-- Found -->
      <template v-else>
        <header class="space-y-4 border-b pb-6">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="min-w-0 space-y-2">
              <h1 class="text-2xl font-bold tracking-tight break-words">{{ trip.name }}</h1>
              <p v-if="trip.destination" class="text-muted-foreground">{{ trip.destination }}</p>
              <p class="text-sm text-muted-foreground">{{ dateRange }}</p>
              <p class="pt-1 text-base">
                Hi {{ traveler.name }}, here’s your itinerary for {{ trip.name }}.
              </p>
            </div>
            <Button
              variant="outline"
              class="shrink-0"
              title="Download your itinerary and documents as PDF"
              @click="downloadPdf"
            >
              <Download class="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </header>

        <!-- Documents at the top (locked decision) -->
        <section class="space-y-3 border-b py-8">
          <div class="flex items-baseline justify-between gap-2">
            <h2 class="text-lg font-semibold">Documents</h2>
            <span class="text-sm text-muted-foreground">
              {{ travelerDocuments.length }}
            </span>
          </div>
          <DocumentList :documents="travelerDocuments" />
        </section>

        <section class="space-y-6 py-8">
          <h2 class="text-lg font-semibold">Your schedule</h2>

          <div
            v-if="dayGroups.length === 0"
            class="rounded-lg border border-dashed p-6 text-sm text-muted-foreground"
          >
            No itinerary items assigned to you yet.
          </div>

          <div v-else class="space-y-6">
            <div v-for="group in dayGroups" :key="group.date" class="space-y-2">
              <h3 class="text-sm font-semibold text-muted-foreground">
                {{ group.label }}
              </h3>
              <div class="divide-y rounded-lg border">
                <TravelerEntryCard
                  v-for="item in group.items"
                  :key="item.id"
                  :trip="trip"
                  :item="item"
                  :traveler-id="traveler.id"
                />
              </div>
            </div>
          </div>
        </section>

        <footer class="border-t pt-6">
          <Button variant="outline" @click="contactCurator">
            <Mail class="mr-2 h-4 w-4" />
            Contact curator
          </Button>
        </footer>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useTripsStore } from '@/stores/trips'
import { displayDateRange, documentsForTraveler, entriesForTraveler } from '@/lib/tripHelpers'
import { downloadTripPdf } from '@/lib/tripPdf'
import type { ItineraryItem } from '@/types'
import TravelerEntryCard from '@/components/TravelerEntryCard.vue'
import DocumentList from '@/components/DocumentList.vue'
import { Button } from '@/components/ui/button'
import { Download, Mail } from '@lucide/vue'

const route = useRoute()
const router = useRouter()
const { getTravelerByShareCode, currentUser } = useTripsStore()

const shareCode = computed(() => String(route.params.shareCode))

const resolved = computed(() => getTravelerByShareCode(shareCode.value))

const trip = computed(() => resolved.value!.trip)
const traveler = computed(() => resolved.value!.traveler)

const dateRange = computed(() => {
  if (!resolved.value) return ''
  const { startDate, endDate } = displayDateRange(trip.value)
  if (!startDate || !endDate) return 'Dates TBD'
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
  return `${formatter.format(new Date(startDate))} – ${formatter.format(new Date(endDate))}`
})

const travelerDocuments = computed(() => {
  if (!resolved.value) return []
  return documentsForTraveler(trip.value, traveler.value.id)
})

const dayFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'short',
  day: 'numeric',
  year: 'numeric'
})

const dayGroups = computed(() => {
  if (!resolved.value) return []
  const items = entriesForTraveler(trip.value, traveler.value.id)
  const byDate = new Map<string, ItineraryItem[]>()
  for (const item of items) {
    const list = byDate.get(item.date) ?? []
    list.push(item)
    byDate.set(item.date, list)
  }
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, groupItems]) => ({
      date,
      label: dayFormatter.format(new Date(date)),
      items: [...groupItems].sort(
        (a, b) =>
          (a.time ?? '').localeCompare(b.time ?? '') || a.title.localeCompare(b.title)
      )
    }))
})

function goDashboard() {
  router.push('/dashboard')
}

function downloadPdf() {
  if (!resolved.value) return
  try {
    downloadTripPdf(trip.value, {
      traveler: traveler.value,
      items: entriesForTraveler(trip.value, traveler.value.id),
      documents: travelerDocuments.value
    })
    toast.success('PDF downloaded')
  } catch {
    toast.error('Could not generate PDF')
  }
}

function contactCurator() {
  const email = currentUser.value.email
  if (!email) {
    toast.info(`${currentUser.value.name} — no email on file`)
    return
  }
  const subject = encodeURIComponent(`Question about ${trip.value.name}`)
  window.location.href = `mailto:${email}?subject=${subject}`
}
</script>
