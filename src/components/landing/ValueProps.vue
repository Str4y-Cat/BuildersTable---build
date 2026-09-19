<template>
  <section id="value" class="scroll-mt-20 border-t border-border bg-muted/30 py-24 sm:py-32">
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div class="max-w-2xl">
        <p class="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          What changes
        </p>
        <h2
          class="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
        >
          Three things the sheet structurally can't do.
        </h2>
      </div>

      <!-- Asymmetric bento: the lead prop takes the full width, two below -->
      <div class="mt-12 grid gap-4 lg:grid-cols-2">
        <article
          v-for="(prop, index) in props_"
          :key="prop.feature"
          class="flex flex-col rounded-2xl border border-border bg-card p-6 sm:p-8"
          :class="index === 0 ? 'lg:col-span-2' : ''"
        >
          <component :is="prop.icon" class="size-5 text-muted-foreground" />

          <!-- feature → capability → benefit, separated by weight not colour -->
          <p
            class="mt-5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
          >
            {{ prop.feature }}
          </p>

          <h3
            class="mt-2 text-xl font-semibold leading-snug tracking-tight sm:text-2xl"
            :class="index === 0 ? 'max-w-2xl' : ''"
          >
            {{ prop.benefit }}
          </h3>

          <p
            class="mt-3 text-sm leading-relaxed text-muted-foreground"
            :class="index === 0 ? 'max-w-2xl' : ''"
          >
            {{ prop.capability }}
          </p>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { BellRing, CheckCheck, Layers } from '@lucide/vue'

/**
 * Content is lifted from the value-prop table in the build spec.
 * Each block carries a concrete feature, capability and benefit —
 * no vague "increases efficiency" framing.
 */
const props_ = [
  {
    icon: BellRing,
    feature: 'Itinerary items linked to affected travelers',
    capability:
      'You edit the item once. TellMe works out which travelers are attached to it and notifies exactly those people — nobody else on the trip gets a message that does not concern them.',
    benefit: 'Stop working out who to call after every schedule change.'
  },
  {
    icon: CheckCheck,
    feature: 'Confirm / decline per traveler, per item',
    capability:
      'Every affected traveler acknowledges in one tap, and you see at a glance who has and has not responded to the change.',
    benefit: 'No more duplicate bookings or conflicting itineraries.'
  },
  {
    icon: Layers,
    feature: 'Trips hold the itinerary and the traveler list together',
    capability:
      'One place to maintain, instead of reconciling a sheet against an inbox against last night’s PDF.',
    benefit: 'Get your evenings back.'
  }
]
</script>
