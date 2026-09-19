<template>
  <section id="demo" class="scroll-mt-20 py-24 sm:py-32">
    <div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      <!-- Solution intro — the pain → product bridge, capped at two sentences -->
      <div class="mx-auto max-w-3xl text-center">
        <h2
          class="text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
        >
          One live itinerary instead of three artifacts.
        </h2>
        <p class="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
          TellMe replaces the spreadsheet-plus-inbox-plus-PDF routine with a
          single live itinerary. Change it once — everyone affected finds out
          automatically.
        </p>
      </div>

      <div class="mt-14">
        <BrowserFrame url="tellme.app/dashboard/trips/sundance-2026">
          <PropagationDemo />
        </BrowserFrame>
        <p class="mt-4 text-center text-sm text-muted-foreground">
          A call time moves by 90 minutes. The three travelers attached to it are
          notified and re-set to pending; the other three aren't touched.
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import BrowserFrame from './BrowserFrame.vue'
import PropagationDemo from './PropagationDemo.vue'
</script>
