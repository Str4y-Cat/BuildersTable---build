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
      class="space-y-2 px-4 py-3"
    >
      <div class="flex flex-wrap items-start justify-between gap-2">
        <div class="flex min-w-0 flex-1 items-start gap-2">
          <button
            v-if="manageable"
            type="button"
            class="mt-0.5 shrink-0 rounded p-0.5 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            :title="doc.pinned ? 'Unpin document' : 'Pin document'"
            :aria-pressed="doc.pinned"
            @click="emit('toggle-pin', doc)"
          >
            <Pin
              class="h-3.5 w-3.5"
              :class="doc.pinned ? 'fill-current text-foreground' : ''"
            />
          </button>
          <Pin
            v-else-if="doc.pinned"
            class="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <div class="min-w-0 space-y-0.5">
            <a
              :href="doc.url"
              target="_blank"
              rel="noopener noreferrer"
              class="block truncate font-medium text-foreground underline-offset-4 hover:underline"
            >
              {{ doc.name }}
            </a>
            <p v-if="showAssignment" class="text-xs text-muted-foreground">
              {{ assignmentLabel(doc) }}
            </p>
            <div
              v-if="manageable && assignedNames(doc).length"
              class="flex flex-wrap gap-1 pt-0.5"
            >
              <span
                v-for="row in assignedNames(doc)"
                :key="row.id"
                class="inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] text-muted-foreground"
                :title="row.phone ? `Tel. ${row.phone}` : undefined"
              >
                {{ row.name }}
                <template v-if="row.phone"> · Tel.</template>
              </span>
            </div>
          </div>
        </div>

        <div v-if="manageable" class="flex shrink-0 flex-wrap gap-1">
          <Button
            variant="outline"
            size="sm"
            title="Edit document"
            @click="emit('edit', doc)"
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            class="text-destructive hover:text-destructive"
            title="Remove document"
            @click="emit('remove', doc)"
          >
            Remove
          </Button>
        </div>
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { Document, Trip } from '@/types'
import { Button } from '@/components/ui/button'
import { Pin } from '@lucide/vue'

const props = defineProps<{
  documents: Document[]
  trip?: Trip
  showAssignment?: boolean
  manageable?: boolean
}>()

const emit = defineEmits<{
  edit: [doc: Document]
  remove: [doc: Document]
  'toggle-pin': [doc: Document]
}>()

function assignmentLabel(doc: Document): string {
  if (!doc.assignedTravelerIds.length) return 'All crew'
  const n = doc.assignedTravelerIds.length
  return `${n} assigned`
}

function assignedNames(doc: Document) {
  if (!props.trip || !doc.assignedTravelerIds.length) return []
  const idSet = new Set(doc.assignedTravelerIds)
  return props.trip.travelers
    .filter((t) => idSet.has(t.id))
    .map((t) => ({ id: t.id, name: t.name, phone: t.phone }))
}
</script>
