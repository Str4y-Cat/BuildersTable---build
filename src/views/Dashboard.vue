<template>
  <div class="min-h-screen bg-background">
    <!-- Header -->
    <header class="border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <!-- Left: Title + New Trip button -->
          <div class="flex items-center gap-4">
            <h1 class="text-2xl font-bold">My Trips</h1>
            <Button @click="handleNewTrip">
              <Plus class="h-4 w-4 mr-2" />
              New Trip
            </Button>
          </div>

          <!-- Right: User profile dropdown -->
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <button class="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <Avatar>
                  <AvatarFallback>{{ userInitials }}</AvatarFallback>
                </Avatar>
                <span class="hidden sm:block font-medium">{{ currentUser.name }}</span>
                <ChevronDown class="h-4 w-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem @click="handleSettings">
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem @click="handleLogout">
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Empty state -->
      <div v-if="trips.length === 0" class="text-center py-12">
        <CalendarDays class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 class="text-lg font-semibold mb-2">No trips yet</h2>
        <p class="text-sm text-muted-foreground">
          Create your first trip to get started
        </p>
      </div>

      <!-- Trips grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <TripCard v-for="trip in trips" :key="trip.id" :trip="trip" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { toast } from 'vue-sonner'
import { useTripsStore } from '@/stores/trips'
import TripCard from '@/components/TripCard.vue'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Plus, ChevronDown, CalendarDays } from '@lucide/vue'

const { currentUser, trips } = useTripsStore()

const userInitials = computed(() => {
  const names = currentUser.value.name.split(' ')
  return names.map((n) => n[0]).join('').toUpperCase()
})

const handleNewTrip = () => {
  toast.success('Creating new trip...')
}

const handleSettings = () => {
  toast.info('Settings')
}

const handleLogout = () => {
  toast.info('Logout')
}
</script>
