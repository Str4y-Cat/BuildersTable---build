<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Add traveler</DialogTitle>
        <DialogDescription>
          Add a crew member to this trip. A share link is generated automatically.
        </DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="space-y-2">
          <Label for="traveler-name">Name</Label>
          <Input id="traveler-name" v-model="form.name" required placeholder="Jordan Lee" />
        </div>

        <div class="space-y-2">
          <Label for="traveler-email">Email</Label>
          <Input
            id="traveler-email"
            v-model="form.email"
            type="email"
            required
            placeholder="jordan@example.com"
          />
        </div>

        <div class="space-y-2">
          <Label for="traveler-phone">Phone / Telegram</Label>
          <Input id="traveler-phone" v-model="form.phone" placeholder="Optional" />
        </div>

        <div class="space-y-2">
          <Label for="traveler-role">Role on production</Label>
          <Input
            id="traveler-role"
            v-model="form.roleOnProduction"
            required
            placeholder="e.g. DP, Talent, 1st AD"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="emit('update:open', false)">
            Cancel
          </Button>
          <Button type="submit">Add traveler</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { toast } from 'vue-sonner'
import type { Trip } from '@/types'
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
  trip: Trip
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const { addTraveler } = useTripsStore()

const form = reactive({
  name: '',
  email: '',
  phone: '',
  roleOnProduction: ''
})

function resetForm() {
  form.name = ''
  form.email = ''
  form.phone = ''
  form.roleOnProduction = ''
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) resetForm()
  }
)

function handleSubmit() {
  const name = form.name.trim()
  const email = form.email.trim()
  const roleOnProduction = form.roleOnProduction.trim()
  const phone = form.phone.trim()

  if (!name || !email || !roleOnProduction) {
    toast.error('Name, email, and role are required')
    return
  }

  addTraveler(props.trip.id, {
    name,
    email,
    roleOnProduction,
    ...(phone ? { phone } : {})
  })

  toast.success('Traveler added')
  emit('update:open', false)
}
</script>
