<template>
  <div class="space-y-3">
    <Label>{{ label }}</Label>
    <p v-if="hint" class="text-xs text-muted-foreground">{{ hint }}</p>

    <div
      v-if="documents.length === 0"
      class="rounded-md border border-dashed px-3 py-3 text-sm text-muted-foreground"
    >
      No trip documents yet. Add some in the Documents panel.
    </div>

    <div v-else class="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
      <label
        v-for="doc in sortedDocuments"
        :key="doc.id"
        class="flex cursor-pointer items-start gap-2 text-sm"
        :title="doc.name"
      >
        <Checkbox
          class="mt-0.5"
          :model-value="modelValue.includes(doc.id)"
          @update:model-value="(v) => toggle(doc.id, v === true)"
        />
        <span class="min-w-0">
          <span class="font-medium">{{ doc.name }}</span>
          <span v-if="doc.pinned" class="ml-1 text-xs text-muted-foreground">· pinned</span>
        </span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Document } from '@/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

const props = withDefaults(
  defineProps<{
    documents: Document[]
    modelValue: string[]
    label?: string
    hint?: string
  }>(),
  {
    label: 'Documents',
    hint: 'Link trip documents to this event.'
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const sortedDocuments = computed(() =>
  [...props.documents].sort((a, b) => Number(b.pinned) - Number(a.pinned))
)

function toggle(id: string, checked: boolean) {
  if (checked) {
    if (!props.modelValue.includes(id)) {
      emit('update:modelValue', [...props.modelValue, id])
    }
  } else {
    emit(
      'update:modelValue',
      props.modelValue.filter((x) => x !== id)
    )
  }
}
</script>
