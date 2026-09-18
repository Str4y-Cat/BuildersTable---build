<template>
  <div
    v-if="documents.length === 0"
    class="rounded-lg border border-dashed p-4 text-sm text-muted-foreground"
  >
    No documents yet.
  </div>

  <ul v-else class="divide-y rounded-lg border">
    <li v-for="doc in documents" :key="doc.id" class="px-4 py-3">
      <a
        :href="doc.url"
        target="_blank"
        rel="noopener noreferrer"
        class="font-medium text-foreground underline-offset-4 hover:underline"
      >
        {{ doc.name }}
      </a>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { Document } from '@/types'

defineProps<{
  documents: Document[]
}>()
</script>
