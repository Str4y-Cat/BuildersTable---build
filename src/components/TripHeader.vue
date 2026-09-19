<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div class="min-w-0 space-y-3">
      <div class="flex flex-wrap items-center gap-2">
        <Badge :class="tripBadgeClass[trip.badge]">
          {{ tripBadgeLabel[trip.badge] }}
        </Badge>
        <Badge
          v-for="tag in trip.tags"
          :key="tag"
          variant="outline"
          class="font-normal"
        >
          {{ tripTagLabel[tag] }}
        </Badge>
      </div>

      <h1 class="text-2xl font-bold tracking-tight">{{ trip.name }}</h1>
      <p v-if="trip.destination" class="text-muted-foreground">{{ trip.destination }}</p>
      <p class="text-sm text-muted-foreground">
        {{ dateRange }}
        <span
          v-if="datesDerived"
          class="ml-1.5 text-xs text-muted-foreground/80"
          title="Date range is calculated from itinerary event dates"
        >
          · from events
        </span>
      </p>
      <p
        v-if="trip.description"
        class="max-w-2xl text-sm text-muted-foreground"
      >
        {{ trip.description }}
      </p>

      <div class="flex flex-wrap gap-2 pt-1">
        <Badge variant="secondary">{{ trip.travelers.length }} travelers</Badge>
        <Badge variant="secondary">{{ trip.itinerary.length }} events</Badge>
        <Badge
          v-if="tasks.total"
          variant="secondary"
          :title="`${tasks.done} of ${tasks.total} sub-tasks complete`"
        >
          {{ tasks.done }}/{{ tasks.total }} tasks
        </Badge>
        <Badge variant="outline">{{ pendingCount }} pending</Badge>
      </div>

      <label
        class="flex max-w-md cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm"
        title="When on, newly assigned crew are auto-notified once — not on every assignment edit"
      >
        <Checkbox
          class="mt-0.5"
          :model-value="trip.autoNotifyOnAssign"
          @update:model-value="onAutoNotifyChange"
        />
        <span>
          <span class="font-medium">Auto-notify on first assign</span>
          <span class="mt-0.5 block text-xs text-muted-foreground">
            Simulated email + Telegram when someone is newly assigned to an event or document.
          </span>
        </span>
      </label>
    </div>

    <div class="flex shrink-0 flex-wrap gap-2">
      <Button variant="outline" @click="goBack">
        <ArrowLeft class="mr-2 h-4 w-4" />
        Back to trips
      </Button>
      <Button
        variant="outline"
        title="Download full trip itinerary and documents as PDF"
        @click="downloadPdf"
      >
        <Download class="mr-2 h-4 w-4" />
        Download PDF
      </Button>
      <Button :disabled="!firstShareCode" @click="previewTraveler">
        <ExternalLink class="mr-2 h-4 w-4" />
        Preview traveler view
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import type { Trip } from '@/types'
import { displayDateRange, isDateRangeDerived, responseRollup, taskProgress } from '@/lib/tripHelpers'
import { tripBadgeClass, tripBadgeLabel, tripTagLabel } from '@/lib/tripLabels'
import { downloadTripPdf } from '@/lib/tripPdf'
import { useTripsStore } from '@/stores/trips'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Download, ExternalLink } from '@lucide/vue'

const props = defineProps<{
  trip: Trip
}>()

const router = useRouter()
const { updateTrip } = useTripsStore()

const dateRange = computed(() => {
  const { startDate, endDate } = displayDateRange(props.trip)
  if (!startDate || !endDate) return 'Dates TBD'
  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
  return `${formatter.format(new Date(startDate))} – ${formatter.format(new Date(endDate))}`
})

const datesDerived = computed(() => isDateRangeDerived(props.trip))

const tasks = computed(() => taskProgress(props.trip))

const pendingCount = computed(() =>
  props.trip.itinerary.reduce(
    (sum, item) => sum + responseRollup(props.trip, item).pending,
    0
  )
)

const firstShareCode = computed(() => props.trip.travelers[0]?.shareCode)

function onAutoNotifyChange(value: boolean | 'indeterminate') {
  if (value === 'indeterminate') return
  updateTrip(props.trip.id, { autoNotifyOnAssign: value })
  toast.success(value ? 'Auto-notify on first assign enabled' : 'Auto-notify on first assign disabled')
}

const goBack = () => {
  router.push('/dashboard')
}

function downloadPdf() {
  try {
    downloadTripPdf(props.trip)
    toast.success('PDF downloaded')
  } catch {
    toast.error('Could not generate PDF')
  }
}

const previewTraveler = () => {
  if (!firstShareCode.value) {
    toast.info('Add a traveler before previewing their view')
    return
  }
  router.push(`/trips/${firstShareCode.value}`)
}
</script>
