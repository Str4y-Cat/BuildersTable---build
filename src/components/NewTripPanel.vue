<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent side="right" class="flex w-full flex-col gap-0 p-0 sm:max-w-md">
      <SheetHeader class="border-b pr-12">
        <SheetTitle>New trip</SheetTitle>
        <SheetDescription>
          Description-first create. Dates come from itinerary events later — no
          destination or date fields here.
        </SheetDescription>
      </SheetHeader>

      <form class="flex flex-1 flex-col gap-0 overflow-hidden" @submit.prevent="handleSubmit">
        <div class="flex-1 space-y-5 overflow-y-auto px-4 py-4">
          <div class="space-y-2">
            <Label for="new-trip-name">Name</Label>
            <Input
              id="new-trip-name"
              v-model="form.name"
              required
              placeholder="Milan → Paris shoot"
              title="Trip name on the board and trip page"
            />
          </div>

          <div class="space-y-2">
            <div class="flex items-baseline justify-between gap-2">
              <Label for="new-trip-description">Description</Label>
              <span
                class="text-xs tabular-nums"
                :class="
                  remainingChars < 0
                    ? 'text-destructive'
                    : remainingChars <= 40
                      ? 'text-amber-700'
                      : 'text-muted-foreground'
                "
                :title="`${remainingChars} characters remaining`"
              >
                {{ form.description.length }}/{{ TRIP_DESCRIPTION_MAX }}
              </span>
            </div>
            <Textarea
              id="new-trip-description"
              v-model="form.description"
              :maxlength="TRIP_DESCRIPTION_MAX"
              rows="4"
              placeholder="Short trip brief for the board card…"
              title="Shown on the board card (character-capped)"
            />
            <p class="text-xs text-muted-foreground">
              {{ remainingChars }} characters remaining
            </p>
          </div>

          <div class="space-y-2">
            <Label for="new-trip-badge">Badge</Label>
            <Select v-model="form.badge">
              <SelectTrigger id="new-trip-badge" class="w-full" title="Status-style badge on board cards">
                <SelectValue placeholder="Select badge" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="badge in TRIP_BADGES"
                  :key="badge"
                  :value="badge"
                >
                  {{ tripBadgeLabel[badge] }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label>Tags</Label>
            <p class="text-xs text-muted-foreground">
              Fixed set — pick any that apply.
            </p>
            <div class="flex flex-wrap gap-2">
              <label
                v-for="tag in TRIP_TAGS"
                :key="tag"
                class="inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-xs"
                :class="
                  form.tags.includes(tag)
                    ? 'border-foreground bg-foreground text-background'
                    : 'bg-background'
                "
                :title="tripTagLabel[tag]"
              >
                <Checkbox
                  class="sr-only"
                  :model-value="form.tags.includes(tag)"
                  @update:model-value="(v) => toggleTag(tag, v === true)"
                />
                {{ tripTagLabel[tag] }}
              </label>
            </div>
          </div>

          <label
            class="flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2 text-sm"
            title="When on, newly assigned crew are auto-notified once"
          >
            <Checkbox
              class="mt-0.5"
              :model-value="form.autoNotifyOnAssign"
              @update:model-value="(v) => (form.autoNotifyOnAssign = v === true)"
            />
            <span>
              <span class="font-medium">Auto-notify on first assign</span>
              <span class="mt-0.5 block text-xs text-muted-foreground">
                Simulated email + Telegram when someone is newly assigned.
              </span>
            </span>
          </label>
        </div>

        <SheetFooter class="border-t sm:flex-row">
          <Button
            type="button"
            variant="outline"
            class="w-full"
            title="Cancel create"
            @click="emit('update:open', false)"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            class="w-full"
            :disabled="!canSubmit"
            title="Create trip and open it"
          >
            Create trip
          </Button>
        </SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useTripsStore } from '@/stores/trips'
import {
  TRIP_BADGES,
  TRIP_DESCRIPTION_MAX,
  TRIP_TAGS,
  type TripBadge,
  type TripTag
} from '@/types'
import { tripBadgeLabel, tripTagLabel } from '@/lib/tripLabels'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const router = useRouter()
const { createTrip } = useTripsStore()

const form = reactive({
  name: '',
  description: '',
  badge: 'planning' as TripBadge,
  tags: [] as TripTag[],
  autoNotifyOnAssign: true
})

const remainingChars = computed(
  () => TRIP_DESCRIPTION_MAX - form.description.length
)

const canSubmit = computed(
  () =>
    form.name.trim().length > 0 &&
    form.description.length <= TRIP_DESCRIPTION_MAX
)

function resetForm() {
  form.name = ''
  form.description = ''
  form.badge = 'planning'
  form.tags = []
  form.autoNotifyOnAssign = true
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) resetForm()
  }
)

function toggleTag(tag: TripTag, checked: boolean) {
  if (checked) {
    if (!form.tags.includes(tag)) form.tags = [...form.tags, tag]
  } else {
    form.tags = form.tags.filter((t) => t !== tag)
  }
}

function handleSubmit() {
  const name = form.name.trim()
  if (!name) {
    toast.error('Name is required')
    return
  }
  if (form.description.length > TRIP_DESCRIPTION_MAX) {
    toast.error(`Description must be ${TRIP_DESCRIPTION_MAX} characters or fewer`)
    return
  }

  const trip = createTrip({
    name,
    description: form.description.trim(),
    badge: form.badge,
    tags: [...form.tags],
    autoNotifyOnAssign: form.autoNotifyOnAssign
  })
  toast.success('Trip created')
  emit('update:open', false)
  router.push(`/dashboard/trips/${trip.id}`)
}
</script>
