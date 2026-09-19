<template>
  <!-- `dark` flips the existing token set for this band — no new brand colours. -->
  <section id="problem" class="dark scroll-mt-20 bg-background py-24 text-foreground sm:py-32">
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div class="max-w-2xl">
        <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          The current workflow
        </p>
        <h2
          class="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
        >
          Three artifacts, kept in sync by hand.
        </h2>
        <p class="mt-4 text-base leading-relaxed text-muted-foreground">
          Every production travel desk runs the same stack. None of the three
          pieces knows the other two exist.
        </p>
      </div>

      <div class="mt-12 grid gap-4 sm:grid-cols-3">
        <div
          v-for="artifact in artifacts"
          :key="artifact.title"
          class="rounded-2xl border border-border bg-card p-5"
        >
          <component :is="artifact.icon" class="size-5 text-muted-foreground" />
          <h3 class="mt-4 text-sm font-semibold">{{ artifact.title }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
            {{ artifact.body }}
          </p>
        </div>
      </div>

      <div class="mt-12 grid gap-8 border-t border-border pt-12 lg:grid-cols-2">
        <div>
          <h3 class="text-xl font-semibold tracking-tight sm:text-2xl">
            Then the schedule moves.
          </h3>
          <p class="mt-4 text-base leading-relaxed text-muted-foreground">
            Weather, permits, a talent conflict — the shooting schedule changes
            several times a day. Nothing propagates. You work out who's affected
            from the sheet, then re-notify each of them by hand, one message at a
            time, while the next change is already landing.
          </p>
        </div>

        <div class="space-y-4">
          <div class="rounded-2xl border border-border bg-card p-5">
            <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              What it costs you
            </p>
            <p class="mt-3 text-sm leading-relaxed">
              Duplicate bookings. Two people on conflicting itineraries. A
              driver waiting at a pickup nobody moved.
            </p>
          </div>
          <div class="rounded-2xl border border-border bg-card p-5">
            <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Today's patch
            </p>
            <p class="mt-3 text-sm leading-relaxed">
              Make one person the single point of contact — a people-patch that
              holds right up until that person is on a plane.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { FileSpreadsheet, Inbox, FileText } from '@lucide/vue'

const artifacts = [
  {
    icon: FileSpreadsheet,
    title: 'The shared sheet',
    body: 'Flights, hotels and rental cars in a Google Sheet that four people edit and nobody owns.'
  },
  {
    icon: Inbox,
    title: 'The shared inbox',
    body: 'travel+projectname@gmail.com — every booking confirmation, buried under every other booking confirmation.'
  },
  {
    icon: FileText,
    title: 'The nightly call sheet',
    body: 'Assembled by hand each evening from the other two, and out of date by the time it sends.'
  }
]
</script>
