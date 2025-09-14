<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { setupTOCHandlers } from '../../page-outline/setup'
  import { refreshPageHeaders } from '../../page-outline/pageHeaders'

  export let currentPage: string = ""
  export let logseqVersionMd: boolean = false

  let mounted = false
  let cleanup: (() => void) | null = null
  let previousPage = ""

  onMount(() => {
    mounted = true
    // Initialize TOC handlers
    setupTOCHandlers(logseqVersionMd)
    
    // Setup cleanup function
    cleanup = () => {
      const container = document.getElementById('lse-toc-container')
      if (container) {
        container.remove()
      }
    }

    // Initial load if there's a current page
    if (currentPage) {
      refreshPageHeaders(currentPage)
      previousPage = currentPage
    }
  })

  onDestroy(() => {
    if (cleanup) {
      cleanup()
    }
  })

  // Watch for changes to currentPage
  $: if (mounted && currentPage && currentPage !== previousPage) {
    refreshPageHeaders(currentPage)
    previousPage = currentPage
  }

  // Watch for changes to logseqVersionMd
  $: if (mounted && logseqVersionMd !== undefined) {
    // Re-setup TOC handlers if version changes
    setupTOCHandlers(logseqVersionMd)
    if (currentPage) {
      refreshPageHeaders(currentPage)
    }
  }
</script>

{#if mounted}  
  <!-- TOC will be injected into the DOM by the original logic -->
  <!-- This component just serves as a mount point and lifecycle manager -->
{/if}

<style>
  /* Styles are handled by the original page-outline CSS and logic */
</style>