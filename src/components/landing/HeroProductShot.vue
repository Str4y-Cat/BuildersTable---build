<template>
  <!-- Static composition of the curator surface. Shows what the app *is*;
       PropagationDemo below shows what it *does*. -->
  <div class="grid gap-0 sm:grid-cols-[1fr_240px]">
    <div class="min-w-0 space-y-4 p-4 sm:p-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="min-w-0 space-y-1.5">
          <Badge :class="tripBadgeClass.locked">{{ tripBadgeLabel.locked }}</Badge>
          <h3 class="truncate text-lg font-semibold tracking-tight">
            {{ TRIP_NAME }}
          </h3>
          <p class="truncate text-xs text-muted-foreground">
            {{ TRIP_DESTINATION }} · {{ TRIP_DATES }}
          </p>
        </div>
        <div class="flex shrink-0 gap-1.5">
          <Badge variant="outline" class="font-normal">
            {{ tripTagLabel.festival }}
          </Badge>
          <Badge variant="outline" class="font-normal">
            {{ tripTagLabel['multi-city'] }}
          </Badge>
        </div>
      </div>

      <div class="space-y-1 border-t border-border pt-3">
        <p class="px-3 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Friday, Jan 23
        </p>
        <MockItineraryRow
          v-for="row in HERO_ROWS"
          :key="row.id"
          :time="row.time"
          :title="row.title"
          :location="row.location"
          :type="row.type"
          :attendees="row.attendees"
        />
      </div>
    </div>

    <!-- Traveler rail -->
    <aside class="space-y-3 border-border p-4 sm:border-l sm:p-5">
      <p class="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Travelers · 6
      </p>
      <div class="space-y-2.5">
        <div
          v-for="person in railTravelers"
          :key="person.id"
          class="flex items-center gap-2.5"
        >
          <MockAvatar :label="initials(person.name)" size="md" />
          <div class="min-w-0 flex-1">
            <p class="truncate text-xs font-medium">{{ person.name }}</p>
            <p class="truncate text-[11px] text-muted-foreground">
              {{ person.role }}
            </p>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { tripBadgeClass, tripBadgeLabel, tripTagLabel } from '@/lib/tripLabels'
import MockAvatar from './MockAvatar.vue'
import MockItineraryRow from './MockItineraryRow.vue'
import {
  AFFECTED_TRAVELERS,
  HERO_ROWS,
  TRIP_DATES,
  TRIP_DESTINATION,
  TRIP_NAME,
  UNAFFECTED_TRAVELERS
} from './mockContent'
import { initials } from '@/lib/tripHelpers'

const railTravelers = [...AFFECTED_TRAVELERS, ...UNAFFECTED_TRAVELERS]
</script>
