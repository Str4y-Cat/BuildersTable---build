<template>
  <div class="space-y-3">
    <div class="flex items-baseline justify-between gap-2">
      <Label>{{ label }}</Label>
      <span v-if="modelValue.length" class="text-xs text-muted-foreground tabular-nums">
        {{ doneCount }}/{{ modelValue.length }}
      </span>
    </div>
    <p v-if="hint" class="text-xs text-muted-foreground">{{ hint }}</p>

    <ul v-if="modelValue.length" class="divide-y rounded-md border">
      <li
        v-for="(task, index) in modelValue"
        :key="task.id"
        class="flex items-start gap-2 px-3 py-2"
      >
        <Checkbox
          class="mt-0.5"
          :model-value="task.done"
          :title="task.done ? 'Mark not done' : 'Mark done'"
          @update:model-value="(v) => setDone(index, v === true)"
        />
        <Input
          :model-value="task.title"
          class="h-8 flex-1"
          maxlength="120"
          title="Sub-task title"
          @update:model-value="(v) => setTitle(index, String(v))"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          class="shrink-0 text-muted-foreground hover:text-destructive"
          :title="`Remove “${task.title || 'sub-task'}”`"
          @click="removeAt(index)"
        >
          <X class="h-3.5 w-3.5" />
        </Button>
      </li>
    </ul>
    <p
      v-else
      class="rounded-md border border-dashed px-3 py-3 text-sm text-muted-foreground"
    >
      No sub-tasks yet.
    </p>

    <div class="flex gap-2">
      <Input
        v-model="draft"
        placeholder="Add a sub-task…"
        class="flex-1"
        maxlength="120"
        title="Checklist item under this event"
        @keydown.enter.prevent="addDraft"
      />
      <Button
        type="button"
        variant="outline"
        :disabled="!draft.trim()"
        :title="draft.trim() ? 'Add sub-task' : 'Enter a title first'"
        @click="addDraft"
      >
        Add
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { EventTask } from '@/types'
import { newId } from '@/lib/tripHelpers'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    modelValue: EventTask[]
    label?: string
    hint?: string
  }>(),
  {
    label: 'Sub-tasks',
    hint: 'Optional checklist for this event.'
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: EventTask[]]
}>()

const draft = ref('')

const doneCount = computed(
  () => props.modelValue.filter((t) => t.done).length
)

function emitNext(next: EventTask[]) {
  emit('update:modelValue', next)
}

function setDone(index: number, done: boolean) {
  const next = props.modelValue.map((t, i) =>
    i === index ? { ...t, done } : t
  )
  emitNext(next)
}

function setTitle(index: number, title: string) {
  const next = props.modelValue.map((t, i) =>
    i === index ? { ...t, title } : t
  )
  emitNext(next)
}

function removeAt(index: number) {
  emitNext(props.modelValue.filter((_, i) => i !== index))
}

function addDraft() {
  const title = draft.value.trim()
  if (!title) return
  emitNext([
    ...props.modelValue,
    { id: newId('task'), title, done: false }
  ])
  draft.value = ''
}
</script>
