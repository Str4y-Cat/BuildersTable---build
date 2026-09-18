<template>
  <section v-if="collapsible" class="rounded-xl border">
    <button
      type="button"
      class="flex w-full items-center gap-2 rounded-xl px-4 py-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
      :aria-expanded="open"
      @click="open = !open"
    >
      <ChevronDown
        class="h-4 w-4 shrink-0 text-muted-foreground transition-transform"
        :class="open ? 'rotate-180' : ''"
      />
      <h2 class="text-lg font-semibold">Documents</h2>
      <span class="text-sm text-muted-foreground">{{ documents.length }}</span>
      <Badge
        v-if="pinnedCount"
        variant="secondary"
        class="ml-auto font-normal"
      >
        {{ pinnedCount }} pinned
      </Badge>
    </button>

    <div v-show="open" class="border-t px-4 py-3">
      <DocumentEntries :documents="sortedDocuments" :show-assignment="Boolean(trip)" />
    </div>
  </section>

  <div v-else>
    <DocumentEntries :documents="sortedDocuments" :show-assignment="Boolean(trip)" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Document, Trip } from '@/types'
import { Badge } from '@/components/ui/badge'
import { ChevronDown } from '@lucide/vue'
import DocumentEntries from '@/components/DocumentEntries.vue'

const props = withDefaults(
  defineProps<{
    documents: Document[]
    trip?: Trip
    /** Trip page: collapsible + default closed. Traveler view: flat list. */
    collapsible?: boolean
    defaultOpen?: boolean
  }>(),
  {
    collapsible: false,
    defaultOpen: false
  }
)

const open = ref(props.defaultOpen)

const pinnedCount = computed(
  () => props.documents.filter((d) => d.pinned).length
)

const sortedDocuments = computed(() =>
  [...props.documents].sort((a, b) => Number(b.pinned) - Number(a.pinned))
)
</script>
