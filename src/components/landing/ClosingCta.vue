<template>
  <section class="border-t border-border py-24 sm:py-32">
    <div class="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
      <h2 :class="displayTitle">
        Change it once. Everyone affected knows.
      </h2>
      <p class="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
        The demo runs on a seeded six-person festival shoot across Park City.
        Move a call time and watch it propagate.
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
    </div>

    <footer class="mx-auto mt-24 max-w-6xl border-t border-border px-4 pt-8 sm:px-6 lg:px-8">
      <div class="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <span class="text-sm font-semibold tracking-tight">TellMe</span>
        <p class="text-xs text-muted-foreground">
          Itinerary management for crews.
        </p>
      </div>
    </footer>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ArrowRight } from '@lucide/vue'
import { Button } from '@/components/ui/button'
import { displayTitle } from '@/lib/typography'
</script>
