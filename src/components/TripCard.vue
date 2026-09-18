<template>
  <Card class="hover:shadow-lg transition-shadow duration-200">
    <CardHeader>
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <CardTitle class="text-xl">{{ trip.name }}</CardTitle>
          <CardDescription class="mt-1">{{ trip.destination }}</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" class="h-8 w-8">
              <MoreVertical class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="handleEdit">
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem @click="handleDuplicate">
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem @click="handleDelete" class="text-destructive">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardHeader>

    <CardContent class="space-y-4">
      <div class="text-sm text-muted-foreground">
        {{ dateRange }}
      </div>

      <Separator />

      <div class="space-y-2 text-sm">
        <div class="flex items-center gap-2">
          <Users class="h-4 w-4 text-muted-foreground" />
          <span>{{ trip.travelers.length }} travelers</span>
        </div>
        <div class="flex items-center gap-2">
          <Calendar class="h-4 w-4 text-muted-foreground" />
          <span>{{ trip.itinerary.length }} items</span>
        </div>
        <div class="flex items-center gap-2">
          <FileText class="h-4 w-4 text-muted-foreground" />
          <span>{{ trip.documents.length }} documents</span>
        </div>
      </div>
    </CardContent>

    <CardFooter class="flex justify-between items-center">
      <Badge :variant="status.variant">{{ status.label }}</Badge>
      <Button @click="viewDetails" size="sm">
        View Details
        <ArrowRight class="ml-2 h-4 w-4" />
      </Button>
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import type { Trip } from '@/types'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Users, Calendar, FileText, MoreVertical, ArrowRight } from '@lucide/vue'

interface Props {
  trip: Trip
}

const props = defineProps<Props>()
const router = useRouter()

const status = computed(() => {
  const now = new Date()
  const start = new Date(props.trip.startDate)
  const end = new Date(props.trip.endDate)

  if (now < start) {
    return { label: 'Upcoming', variant: 'default' as const }
  }
  if (now > end) {
    return { label: 'Completed', variant: 'secondary' as const }
  }
  return { label: 'Ongoing', variant: 'destructive' as const }
})

const dateRange = computed(() => {
  const start = new Date(props.trip.startDate)
  const end = new Date(props.trip.endDate)

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  return `${formatter.format(start)} - ${formatter.format(end)}`
})

const viewDetails = () => {
  router.push(`/dashboard/trips/${props.trip.id}`)
}

const handleEdit = () => {
  toast.info('Edit trip')
}

const handleDuplicate = () => {
  toast.info('Duplicate trip')
}

const handleDelete = () => {
  toast.error('Delete trip')
}
</script>
