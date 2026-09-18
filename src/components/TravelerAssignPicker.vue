<template>
  <div class="space-y-2" data-traveler-assign-root="true">
    <Label v-if="label">{{ label }}</Label>
    <p v-if="hint" class="text-xs text-muted-foreground">{{ hint }}</p>

    <div
      v-if="travelers.length === 0"
      class="rounded-md border border-dashed p-3 text-sm text-muted-foreground"
    >
      No travelers on this trip yet.
    </div>

    <template v-else>
      <div class="relative" @keydown.escape="showSuggestions = false">
        <Search
          class="pointer-events-none absolute top-1/2 left-2.5 z-[1] h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          v-model="query"
          type="search"
          class="pl-8"
          role="combobox"
          :aria-expanded="showSuggestions && suggestions.length > 0"
          aria-autocomplete="list"
          aria-controls="traveler-suggest-list"
          :placeholder="searchPlaceholder"
          :title="searchTitle"
          autocomplete="off"
          @focus="showSuggestions = true"
          @input="showSuggestions = true"
        />

        <!-- Suggested names while searching -->
        <ul
          v-if="showSuggestions && query.trim() && suggestions.length"
          id="traveler-suggest-list"
          role="listbox"
          class="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          <li
            v-for="traveler in suggestions"
            :key="traveler.id"
            role="option"
            :aria-selected="selectedIds.includes(traveler.id)"
          >
            <button
              type="button"
              class="flex w-full items-start gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent"
              :title="travelerTitle(traveler)"
              @mousedown.prevent="pickSuggestion(traveler)"
            >
              <span class="min-w-0 flex-1">
                <span class="font-medium">{{ traveler.name }}</span>
                <span class="text-muted-foreground">
                  · {{ traveler.roleOnProduction }}
                </span>
                <span
                  v-if="traveler.phone"
                  class="mt-0.5 block text-xs text-muted-foreground"
                >
                  Tel. {{ traveler.phone }}
                </span>
              </span>
              <span
                v-if="selectedIds.includes(traveler.id)"
                class="shrink-0 text-xs text-muted-foreground"
              >
                Selected
              </span>
            </button>
          </li>
        </ul>
        <p
          v-else-if="showSuggestions && query.trim() && suggestions.length === 0"
          class="absolute z-20 mt-1 w-full rounded-md border bg-popover px-3 py-2 text-sm text-muted-foreground shadow-md"
        >
          No suggested names for “{{ query.trim() }}”
        </p>
      </div>

      <!-- Quick name chips from current matches -->
      <div
        v-if="query.trim() && suggestions.length"
        class="flex flex-wrap gap-1.5"
        aria-label="Suggested names"
      >
        <button
          v-for="traveler in suggestions.slice(0, 6)"
          :key="`chip-${traveler.id}`"
          type="button"
          class="inline-flex items-center rounded-md border px-2 py-0.5 text-xs transition-colors hover:bg-accent"
          :class="
            selectedIds.includes(traveler.id)
              ? 'border-foreground bg-foreground text-background'
              : 'bg-background text-foreground'
          "
          :title="`Assign ${traveler.name}`"
          @click="pickSuggestion(traveler)"
        >
          {{ traveler.name }}
        </button>
      </div>

      <div
        v-if="selectedIds.length"
        class="flex flex-wrap gap-1"
        title="Currently selected crew (empty selection = all travelers)"
      >
        <Badge
          v-for="id in selectedIds"
          :key="id"
          variant="secondary"
          class="font-normal"
        >
          {{ nameFor(id) }}
        </Badge>
      </div>
      <p v-else class="text-xs text-muted-foreground" title="No subset selected">
        All travelers (default)
      </p>

      <div class="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
        <p
          v-if="filtered.length === 0"
          class="text-sm text-muted-foreground"
        >
          No matches for “{{ query.trim() }}”
        </p>
        <label
          v-for="traveler in filtered"
          :key="traveler.id"
          class="flex cursor-pointer items-start gap-2 text-sm"
          :title="travelerTitle(traveler)"
        >
          <Checkbox
            class="mt-0.5"
            :model-value="selectedIds.includes(traveler.id)"
            @update:model-value="(v) => toggle(traveler.id, v === true)"
          />
          <span class="min-w-0">
            <span class="font-medium">{{ traveler.name }}</span>
            <span class="text-muted-foreground">
              · {{ traveler.roleOnProduction }}
            </span>
            <span
              v-if="traveler.phone"
              class="mt-0.5 block text-xs text-muted-foreground"
            >
              Tel. {{ traveler.phone }}
            </span>
          </span>
        </label>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { Traveler } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search } from '@lucide/vue'

const props = withDefaults(
  defineProps<{
    travelers: Traveler[]
    modelValue: string[]
    label?: string
    hint?: string
    searchPlaceholder?: string
  }>(),
  {
    label: 'Assign travelers',
    hint: 'Search for suggested names, then select. Leave unchecked for all travelers.',
    searchPlaceholder: 'Search crew by name, role, or Tel.…'
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const query = ref('')
const showSuggestions = ref(false)

const searchTitle = 'Type to see suggested traveler names, then select assignees'

const selectedIds = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

function matchesQuery(traveler: Traveler, q: string): boolean {
  const hay = [traveler.name, traveler.roleOnProduction, traveler.email, traveler.phone ?? '']
    .join(' ')
    .toLowerCase()
  return hay.includes(q)
}

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return props.travelers
  return props.travelers.filter((t) => matchesQuery(t, q))
})

/** Name-forward suggestions while searching (prefer name prefix matches). */
const suggestions = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return []
  const scored = props.travelers
    .filter((t) => matchesQuery(t, q))
    .map((t) => {
      const name = t.name.toLowerCase()
      const score = name.startsWith(q) ? 0 : name.includes(q) ? 1 : 2
      return { t, score }
    })
    .sort((a, b) => a.score - b.score || a.t.name.localeCompare(b.t.name))
  return scored.map((s) => s.t).slice(0, 8)
})

watch(
  () => props.travelers,
  () => {
    query.value = ''
    showSuggestions.value = false
  }
)

function onDocPointerDown(event: PointerEvent) {
  const path = event.composedPath?.() ?? []
  const inside = path.some(
    (node) => node instanceof HTMLElement && node.dataset?.travelerAssignRoot === 'true'
  )
  if (!inside) showSuggestions.value = false
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocPointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocPointerDown)
})

function nameFor(id: string): string {
  return props.travelers.find((t) => t.id === id)?.name ?? id
}

function travelerTitle(traveler: Traveler): string {
  const parts = [traveler.name, traveler.roleOnProduction]
  if (traveler.phone) parts.push(`Tel. ${traveler.phone}`)
  return parts.join(' · ')
}

function toggle(id: string, checked: boolean) {
  if (checked) {
    if (!selectedIds.value.includes(id)) {
      selectedIds.value = [...selectedIds.value, id]
    }
  } else {
    selectedIds.value = selectedIds.value.filter((x) => x !== id)
  }
}

function pickSuggestion(traveler: Traveler) {
  if (!selectedIds.value.includes(traveler.id)) {
    selectedIds.value = [...selectedIds.value, traveler.id]
  }
  query.value = traveler.name
  showSuggestions.value = false
}

defineExpose({
  resetSearch: () => {
    query.value = ''
    showSuggestions.value = false
  }
})
</script>
