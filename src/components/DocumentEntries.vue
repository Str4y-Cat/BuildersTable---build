<template>
  <div
    v-if="documents.length === 0"
    class="rounded-lg border border-dashed p-4 text-sm text-muted-foreground"
  >
    No documents yet.
  </div>

  <ul v-else class="divide-y rounded-lg border">
    <li
      v-for="doc in documents"
      :key="doc.id"
      class="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
    >
      <div class="flex min-w-0 items-center gap-2">
        <Pin
          v-if="doc.pinned"
          class="h-3.5 w-3.5 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <a
          :href="doc.url"
          target="_blank"
          rel="noopener noreferrer"
          class="truncate font-medium text-foreground underline-offset-4 hover:underline"
        >
          {{ doc.name }}
        </a>
      </div>
      <span v-if="showAssignment" class="text-xs text-muted-foreground">
        {{ assignmentLabel(doc) }}
      </span>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { Document } from '@/types'
import { Pin } from '@lucide/vue'

defineProps<{
  documents: Document[]
  showAssignment?: boolean
}>()

function assignmentLabel(doc: Document): string {
  if (!doc.assignedTravelerIds.length) return 'All crew'
  const n = doc.assignedTravelerIds.length
  return `${n} assigned`
}
</script>
