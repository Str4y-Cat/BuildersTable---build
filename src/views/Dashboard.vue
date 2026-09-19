<template>
  <div class="min-h-screen bg-background">
    <header class="border-b">
      <div class="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div class="flex flex-wrap items-center gap-3 sm:gap-4">
          <h1 :class="pageTitle">My Trips</h1>
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
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          v-model="searchQuery"
          class="sm:max-w-xs"
          placeholder="Search trips…"
          type="search"
        />
        <p class="text-sm text-muted-foreground">
          Board by trip status · {{ filteredTrips.length }} shown
        </p>
      </div>

      <div v-if="trips.length === 0" class="py-12 text-center">
        <CalendarDays class="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h2 :class="[sectionTitle, 'mb-2']">No trips yet</h2>
        <p class="text-sm text-muted-foreground">
          Create your first trip to get started
        </p>
        <Button class="mt-4" @click="newTripOpen = true">
          <Plus class="mr-2 h-4 w-4" />
          New Trip
        </Button>
      </div>

      <div v-else-if="filteredTrips.length === 0" class="py-12 text-center">
        <h2 :class="[sectionTitle, 'mb-2']">No matching trips</h2>
        <p class="text-sm text-muted-foreground">
          Try a different search
        </p>
      </div>

      <TripBoard v-else :trips="filteredTrips" />
    </main>

    <NewTripDialog v-model:open="newTripOpen" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { toast } from 'vue-sonner'
import { useTripsStore } from '@/stores/trips'
import { initials } from '@/lib/tripHelpers'
import { pageTitle, sectionTitle } from '@/lib/typography'
import TripBoard from '@/components/TripBoard.vue'
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
import { Plus, ChevronDown, CalendarDays } from '@lucide/vue'

const { currentUser, trips } = useTripsStore()

const newTripOpen = ref(false)
const searchQuery = ref('')

const userInitials = computed(() => initials(currentUser.value.name))

const filteredTrips = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return trips.value
  return trips.value.filter(
    (trip) =>
      trip.name.toLowerCase().includes(q) ||
      (trip.destination?.toLowerCase().includes(q) ?? false) ||
      trip.description.toLowerCase().includes(q) ||
      trip.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      trip.badge.toLowerCase().includes(q)
  )
})
</script>
