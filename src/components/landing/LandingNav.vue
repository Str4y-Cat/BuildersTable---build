<template>
  <header
    class="fixed inset-x-0 top-0 z-50 transition-all duration-300"
    :class="
      scrolled
        ? 'border-b border-border bg-background/80 backdrop-blur-md'
        : 'border-b border-transparent'
    "
  >
    <nav
      class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
    >
      <RouterLink
        to="/"
        class="text-base font-semibold tracking-tight transition-opacity hover:opacity-70"
      >
        TellMe
      </RouterLink>

      <div class="hidden items-center gap-1 md:flex">
        <a
          v-for="link in links"
          :key="link.href"
          :href="link.href"
          class="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {{ link.label }}
        </a>
      </div>

      <Button as-child size="sm">
        <RouterLink to="/dashboard">Open the demo</RouterLink>
      </Button>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useWindowScroll } from '@vueuse/core'
import { Button } from '@/components/ui/button'

const { y } = useWindowScroll()
const scrolled = computed(() => y.value > 24)

const links = [
  { href: '#problem', label: 'The problem' },
  { href: '#demo', label: 'How it works' },
  { href: '#value', label: 'Why it holds' }
]
</script>
