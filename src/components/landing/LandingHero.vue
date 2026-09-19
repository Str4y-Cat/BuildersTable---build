<template>
  <section class="landing-hero-bg relative overflow-hidden pt-32 pb-20 sm:pt-36 sm:pb-28">
    <div class="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-3xl text-center">
        <span
          class="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground"
        >
          Itinerary management for crews
        </span>

        <h1
          class="mt-6 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
        >
          One schedule change.<br class="hidden sm:block" />
          Every traveler notified.
        </h1>

        <p class="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          For production and travel coordinators running a 5–20 person crew
          across a multi-day, multi-city shoot.
        </p>

        <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button as-child size="lg" class="w-full sm:w-auto">
            <RouterLink to="/dashboard">
              Open the curator demo
              <ArrowRight class="ml-1.5 size-4" />
            </RouterLink>
          </Button>
          <Button as-child variant="outline" size="lg" class="w-full sm:w-auto">
            <RouterLink to="/trips/marcus-sundance">
              See a traveler's view
            </RouterLink>
          </Button>
        </div>

        <p class="mt-4 text-xs text-muted-foreground">
          No sign-up — both views open on a seeded production trip.
        </p>
      </div>

      <!-- Product shot bleeds toward the section's bottom edge -->
      <!-- Product shot is cropped so it bleeds past the viewport edge, then
           fades into the page background rather than ending on a hard line. -->
      <div class="relative mt-14 max-h-[440px] overflow-hidden sm:mt-16">
        <BrowserFrame url="tellme.app/dashboard/trips/sundance-2026">
          <HeroProductShot />
        </BrowserFrame>
        <div
          class="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/85 to-transparent"
          aria-hidden="true"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ArrowRight } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import BrowserFrame from './BrowserFrame.vue'
import HeroProductShot from './HeroProductShot.vue'
</script>
