<template>
  <div
    class="overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-12px_rgba(0,0,0,0.12)]"
  >
    <!-- Faux browser chrome — hairline, not skeuomorphic -->
    <div class="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-2.5">
      <div class="flex gap-1.5">
        <span class="size-2.5 rounded-full bg-border" />
        <span class="size-2.5 rounded-full bg-border" />
        <span class="size-2.5 rounded-full bg-border" />
      </div>
      <div
        v-if="url"
        class="mx-auto hidden max-w-[60%] truncate rounded-md bg-background px-3 py-0.5 text-xs text-muted-foreground sm:block"
      >
        {{ url }}
      </div>
      <div v-else class="mx-auto" />
      <div class="w-[52px] shrink-0" aria-hidden="true" />
    </div>

    <div class="bg-background">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  /** Optional faux address-bar text. */
  url?: string
}>()
</script>
