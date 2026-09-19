<template>
  <div class="min-h-screen bg-background">
    <LandingNav />
    <main>
      <LandingHero />
      <ProblemSection />
      <DemoSection />
      <ValueProps />
      <ClosingCta />
    </main>
  </div>
</template>

<script setup lang="ts">
import LandingNav from '@/components/landing/LandingNav.vue'
import LandingHero from '@/components/landing/LandingHero.vue'
import ProblemSection from '@/components/landing/ProblemSection.vue'
import DemoSection from '@/components/landing/DemoSection.vue'
import ValueProps from '@/components/landing/ValueProps.vue'
import ClosingCta from '@/components/landing/ClosingCta.vue'
</script>
