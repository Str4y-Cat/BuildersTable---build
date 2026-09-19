import type { Router } from 'vue-router'

/**
 * Prefer browser/app history when we came from inside the mock;
 * otherwise fall back to a known route.
 */
export function navigateBack(router: Router, fallback: string = '/dashboard'): void {
  const idx = window.history.state?.idx
  if (typeof idx === 'number' && idx > 0) {
    router.back()
    return
  }
  router.push(fallback)
}
