<template>
  <section v-if="collapsible" class="rounded-xl border">
    <div class="flex flex-wrap items-center gap-2 px-4 py-3">
      <button
        type="button"
        class="flex min-w-0 flex-1 items-center gap-2 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          class="font-normal"
        >
          {{ pinnedCount }} pinned
        </Badge>
      </button>
      <Button
        v-if="trip"
        size="sm"
        class="shrink-0"
        title="Add a document"
        @click.stop="openCreate"
      >
        <Plus class="mr-2 h-4 w-4" />
        Add
      </Button>
    </div>

    <div v-show="open" class="space-y-3 border-t px-4 py-3">
      <DocumentEntries
        :documents="sortedDocuments"
        :trip="trip"
        :show-assignment="Boolean(trip)"
        :manageable="Boolean(trip)"
        @edit="openEdit"
        @remove="askRemove"
        @toggle-pin="togglePin"
      />
    </div>
  </section>

  <div v-else>
    <DocumentEntries :documents="sortedDocuments" />
  </div>

  <DocumentForm
    v-if="trip"
    v-model:open="formOpen"
    :trip="trip"
    :document="editingDoc"
  />

  <Dialog :open="deleteOpen" @update:open="onDeleteOpenChange">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Remove document?</DialogTitle>
        <DialogDescription>
          <template v-if="deleteTarget">
            “{{ deleteTarget.name }}” will be removed from this trip.
          </template>
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" @click="deleteOpen = false">Cancel</Button>
        <Button variant="destructive" @click="confirmRemove">Remove</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import type { Document, Trip } from '@/types'
import { useTripsStore } from '@/stores/trips'
import DocumentEntries from '@/components/DocumentEntries.vue'
import DocumentForm from '@/components/DocumentForm.vue'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { ChevronDown, Plus } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    documents: Document[]
    trip?: Trip
    collapsible?: boolean
    defaultOpen?: boolean
  }>(),
  {
    collapsible: false,
    defaultOpen: false
  }
)

const { updateDocument, removeDocument } = useTripsStore()

const open = ref(props.defaultOpen)
const formOpen = ref(false)
const editingDoc = ref<Document | null>(null)
const deleteTarget = ref<Document | null>(null)
const deleteOpen = ref(false)

const pinnedCount = computed(
  () => props.documents.filter((d) => d.pinned).length
)

const sortedDocuments = computed(() =>
  [...props.documents].sort((a, b) => Number(b.pinned) - Number(a.pinned))
)

function openCreate() {
  editingDoc.value = null
  formOpen.value = true
}

function openEdit(doc: Document) {
  editingDoc.value = doc
  formOpen.value = true
}

function togglePin(doc: Document) {
  if (!props.trip) return
  updateDocument(props.trip.id, doc.id, { pinned: !doc.pinned })
  toast.success(doc.pinned ? 'Document unpinned' : 'Document pinned')
}

function askRemove(doc: Document) {
  deleteTarget.value = doc
  deleteOpen.value = true
}

function onDeleteOpenChange(value: boolean) {
  deleteOpen.value = value
  if (!value) deleteTarget.value = null
}

function confirmRemove() {
  if (!props.trip || !deleteTarget.value) return
  removeDocument(props.trip.id, deleteTarget.value.id)
  toast.success('Document removed')
  deleteOpen.value = false
  deleteTarget.value = null
}
</script>
