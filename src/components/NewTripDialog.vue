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
          <Label for="new-trip-destination">Destination</Label>
          <Input
            id="new-trip-destination"
            v-model="form.destination"
            required
            placeholder="Milan, Italy"
          />
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <Label for="new-trip-start">Start date</Label>
            <Input id="new-trip-start" v-model="form.startDate" type="date" required />
          </div>
          <div class="space-y-2">
            <Label for="new-trip-end">End date</Label>
            <Input id="new-trip-end" v-model="form.endDate" type="date" required />
          </div>
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
  destination: '',
  startDate: '',
  endDate: ''
})

function resetForm() {
  form.name = ''
  form.destination = ''
  form.startDate = ''
  form.endDate = ''
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) resetForm()
  }
)

function handleSubmit() {
  const name = form.name.trim()
  const destination = form.destination.trim()
  if (!name || !destination || !form.startDate || !form.endDate) {
    toast.error('All fields are required')
    return
  }
  if (form.endDate < form.startDate) {
    toast.error('End date must be on or after start date')
    return
  }

  const trip = createTrip({
    name,
    destination,
    startDate: form.startDate,
    endDate: form.endDate
  })
  toast.success('Trip created')
  emit('update:open', false)
  router.push(`/dashboard/trips/${trip.id}`)
}
</script>
