<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>New trip</DialogTitle>
        <DialogDescription>
          Create a trip folder. You can add itinerary and travelers on the next screen.
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="space-y-2">
          <Label for="new-trip-name">Name</Label>
          <Input id="new-trip-name" v-model="form.name" required placeholder="Milan → Paris shoot" />
        </div>
        <div class="space-y-2">
          <Label for="new-trip-description">Description</Label>
          <Input
            id="new-trip-description"
            v-model="form.description"
            :maxlength="TRIP_DESCRIPTION_MAX"
            placeholder="Short trip brief"
          />
          <p class="text-xs text-muted-foreground">
            {{ form.description.length }}/{{ TRIP_DESCRIPTION_MAX }}
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="emit('update:open', false)">
            Cancel
          </Button>
          <Button type="submit">Create trip</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import { useTripsStore } from '@/stores/trips'
import { TRIP_DESCRIPTION_MAX } from '@/types'
import { Button } from '@/components/ui/button'
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
  description: ''
})

function resetForm() {
  form.name = ''
  form.description = ''
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) resetForm()
  }
)

function handleSubmit() {
  const name = form.name.trim()
  if (!name) {
    toast.error('Name is required')
    return
  }

  const trip = createTrip({
    name,
    description: form.description.trim()
  })
  toast.success('Trip created')
  emit('update:open', false)
  router.push(`/dashboard/trips/${trip.id}`)
}
</script>
