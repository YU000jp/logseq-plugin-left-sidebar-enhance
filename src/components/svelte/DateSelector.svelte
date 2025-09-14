<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { loadDateSelector } from '../../dateSelector'

  let mounted = false
  let cleanup: (() => void) | null = null

  onMount(() => {
    mounted = true
    // Initialize the date selector functionality
    loadDateSelector()
    
    // Setup cleanup function
    cleanup = () => {
      const container = document.getElementById('lse-dataSelector-container')
      if (container) {
        container.remove()
      }
    }
  })

  onDestroy(() => {
    if (cleanup) {
      cleanup()
    }
  })
</script>

{#if mounted}
  <!-- Date selector will be injected into the DOM by the original logic -->
  <!-- This component just serves as a mount point and lifecycle manager -->
{/if}

<style>
  /* Styles are handled by the original dateSelector.ts logic */
</style>