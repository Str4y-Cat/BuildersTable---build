<template>
  <div class="min-h-screen bg-background">
    <header class="border-b">
      <div class="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div class="flex flex-wrap items-center gap-3 sm:gap-4">
          <h1 class="text-2xl font-bold">My Trips</h1>
          <Button @click="newTripOpen = true">
            <Plus class="mr-2 h-4 w-4" />
            New Trip
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button class="flex items-center gap-2 self-end transition-opacity hover:opacity-80 sm:self-auto">
              <Avatar>
                <AvatarFallback>{{ userInitials }}</AvatarFallback>
              </Avatar>
              <span class="hidden font-medium sm:block">{{ currentUser.name }}</span>
              <ChevronDown class="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="toast.info('Settings')">Settings</DropdownMenuItem>
            <DropdownMenuItem @click="toast.info('Logout')">Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>

    <main class="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          v-model="searchQuery"
          class="sm:max-w-xs"
          placeholder="Search trips…"
          type="search"
        />
        <Select v-model="statusFilter">
          <SelectTrigger class="w-full sm:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="past">Past</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div v-if="trips.length === 0" class="py-12 text-center">
        <CalendarDays class="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h2 class="mb-2 text-lg font-semibold">No trips yet</h2>
        <p class="text-sm text-muted-foreground">
          Create your first trip to get started
        </p>
        <Button class="mt-4" @click="newTripOpen = true">
          <Plus class="mr-2 h-4 w-4" />
          New Trip
        </Button>
      </div>

      <div v-else-if="filteredTrips.length === 0" class="py-12 text-center">
        <h2 class="mb-2 text-lg font-semibold">No matching trips</h2>
        <p class="text-sm text-muted-foreground">
          Try a different search or status filter
        </p>
      </div>

      <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        <TripCard v-for="trip in filteredTrips" :key="trip.id" :trip="trip" />
      </div>
    </main>

    <NewTripDialog v-model:open="newTripOpen" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import { useTripsStore } from '@/stores/trips'
import { tripStatus } from '@/lib/tripHelpers'
import type { TripStatus } from '@/types'
import TripCard from '@/components/TripCard.vue'
import NewTripDialog from '@/components/NewTripDialog.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Plus, ChevronDown, CalendarDays } from '@lucide/vue'

type StatusFilter = 'all' | TripStatus

const { currentUser, trips } = useTripsStore()

const newTripOpen = ref(false)
const searchQuery = ref('')
const statusFilter = ref<StatusFilter>('all')

const userInitials = computed(() => {
  const names = currentUser.value.name.split(' ')
  return names.map((n) => n[0]).join('').toUpperCase()
})

const filteredTrips = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return trips.value.filter((trip) => {
    if (statusFilter.value !== 'all' && tripStatus(trip) !== statusFilter.value) {
      return false
    }
    if (!q) return true
    return (
      trip.name.toLowerCase().includes(q) ||
      (trip.destination?.toLowerCase().includes(q) ?? false) ||
      trip.description.toLowerCase().includes(q)
    )
  })
})
</script>
