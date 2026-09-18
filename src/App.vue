<template>
  <div class="min-h-screen bg-background">
    <RouterView />
    <Toaster />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import { Toaster } from '@/components/ui/sonner'
</script>
