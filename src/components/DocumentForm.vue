<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ document ? 'Edit document' : 'Add document' }}</DialogTitle>
        <DialogDescription>
          {{
            document
              ? 'Update file details, pin, and crew assignment.'
              : 'Link a file for this trip. Empty assignment = all crew.'
          }}
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="space-y-2">
          <Label for="doc-name">Name</Label>
          <Input
            id="doc-name"
            v-model="form.name"
            required
            placeholder="Call sheet — Day 1.pdf"
            title="Display name for this document"
          />
        </div>

        <div class="space-y-2">
          <Label for="doc-url">URL</Label>
          <Input
            id="doc-url"
            v-model="form.url"
            required
            type="url"
            placeholder="https://…"
            title="Link to the file (mock — no real upload)"
          />
        </div>

        <div class="space-y-2">
          <Label for="doc-type">Type</Label>
          <Select v-model="form.type">
            <SelectTrigger id="doc-type" class="w-full" title="Document type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="opt in DOC_TYPES"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <label
          class="flex cursor-pointer items-center gap-2 text-sm"
          title="Pinned documents appear at the top of the list"
        >
          <Checkbox
            :model-value="form.pinned"
            @update:model-value="(v) => (form.pinned = v === true)"
          />
          <span>
            Pinned
            <span class="text-muted-foreground">· show at top of the list</span>
          </span>
        </label>

        <TravelerAssignPicker
          ref="assignPicker"
          v-model="selectedIds"
          :travelers="trip.travelers"
          label="Assign crew"
          :hint="assignHint"
        />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            title="Discard changes"
            @click="emit('update:open', false)"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            :title="document ? 'Save document changes' : 'Add document to trip'"
          >
            {{ document ? 'Save changes' : 'Add document' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { toast } from 'vue-sonner'
import type { Document, Trip } from '@/types'
import { newlyAssignedTravelerIds } from '@/lib/tripHelpers'
import { useTripsStore } from '@/stores/trips'
import TravelerAssignPicker from '@/components/TravelerAssignPicker.vue'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

const DOC_TYPES = [
  { value: 'application/pdf', label: 'PDF' },
  { value: 'image/*', label: 'Image' },
  { value: 'text/plain', label: 'Text / notes' },
  { value: 'application/vnd.google-apps.document', label: 'Google Doc' },
  { value: 'other', label: 'Other' }
] as const

const props = defineProps<{
  open: boolean
  trip: Trip
  document: Document | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { addDocument, updateDocument, notifyDocumentAssignees } = useTripsStore()

const form = reactive({
  name: '',
  url: '',
  type: 'application/pdf',
  pinned: false
})

const selectedIds = ref<string[]>([])
const assignPicker = ref<{ resetSearch: () => void } | null>(null)

const assignHint = computed(() => {
  const base = 'Search, then select. Leave unchecked for all travelers (default).'
  if (props.trip.autoNotifyOnAssign) {
    return `${base} First-time assignees are auto-notified.`
  }
  return `${base} Auto-notify on assign is off for this trip.`
})

function resetForm() {
  if (props.document) {
    form.name = props.document.name
    form.url = props.document.url
    form.type = props.document.type
    form.pinned = props.document.pinned
    selectedIds.value = [...props.document.assignedTravelerIds]
  } else {
    form.name = ''
    form.url = ''
    form.type = 'application/pdf'
    form.pinned = false
    selectedIds.value = []
  }
  assignPicker.value?.resetSearch()
}

watch(
  () => [props.open, props.document?.id] as const,
  ([isOpen]) => {
    if (isOpen) resetForm()
  }
)

function handleSubmit() {
  const name = form.name.trim()
  const url = form.url.trim()
  if (!name || !url) {
    toast.error('Name and URL are required')
    return
  }

  const nextIds = [...selectedIds.value]
  const previousIds = props.document
    ? [...props.document.assignedTravelerIds]
    : undefined
  const allIds = props.trip.travelers.map((t) => t.id)

  const payload = {
    name,
    url,
    type: form.type,
    pinned: form.pinned,
    assignedTravelerIds: nextIds
  }

  let docId: string
  if (props.document) {
    updateDocument(props.trip.id, props.document.id, payload)
    docId = props.document.id
    toast.success('Document updated')
  } else {
    const created = addDocument(props.trip.id, payload)
    docId = created.id
    toast.success('Document added')
  }

  if (props.trip.autoNotifyOnAssign) {
    const firstAssignIds = newlyAssignedTravelerIds(previousIds, nextIds, allIds)
    if (firstAssignIds.length) {
      const count = notifyDocumentAssignees(
        props.trip.id,
        docId,
        ['email', 'telegram'],
        `New document for you: “${name}”.`,
        firstAssignIds
      )
      if (count) {
        toast.message(`Auto-notified ${count} newly assigned traveler${count === 1 ? '' : 's'}`)
      }
    }
  }

  emit('update:open', false)
}
</script>
