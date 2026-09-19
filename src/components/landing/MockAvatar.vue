<template>
  <Avatar
    :class="
      cn(
        sizeClass,
        'border-2 border-background transition-all duration-500',
        active
          ? 'bg-foreground text-background'
          : 'bg-muted text-muted-foreground shadow-[inset_0_0_0_1px_var(--border)]'
      )
    "
  >
    <AvatarFallback class="bg-transparent text-[10px] font-medium text-inherit">
      {{ label }}
    </AvatarFallback>
  </Avatar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

/**
 * Landing-only avatar: the real Avatar primitive plus the separator border and
 * inset ring that keep overlapping stacks legible, and an `active` state the
 * propagation demo uses to light up affected travelers.
 */
const props = withDefaults(
  defineProps<{
    label: string
    size?: 'sm' | 'md'
    active?: boolean
  }>(),
  { size: 'sm', active: false }
)

const sizeClass = computed(() => (props.size === 'md' ? 'size-7' : 'size-6'))
</script>
