<template>
  <Button variant="outline" size="sm" type="button" @click="copyLink">
    <Copy class="mr-1.5 h-3.5 w-3.5" />
    Copy link
  </Button>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Copy } from '@lucide/vue'

const props = defineProps<{
  shareCode: string
}>()

function shareUrl(): string {
  const path = `/trips/${props.shareCode}`
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${path}`
  }
  return path
}

async function copyLink() {
  const url = shareUrl()
  try {
    await navigator.clipboard.writeText(url)
    toast.success('Link copied')
  } catch {
    toast.error('Could not copy link')
  }
}
</script>
