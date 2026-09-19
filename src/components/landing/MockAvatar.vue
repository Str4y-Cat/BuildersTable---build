<template>
  <span
    class="inline-flex shrink-0 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px] font-medium text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)] transition-all duration-500"
    :class="[sizeClass, active ? 'bg-foreground text-background shadow-none' : '']"
  >
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    size?: 'sm' | 'md'
    /** Highlighted state — used when the demo marks a traveler as affected. */
    active?: boolean
  }>(),
  { size: 'sm', active: false }
)

const sizeClass = computed(() => (props.size === 'md' ? 'size-7' : 'size-6'))
</script>
