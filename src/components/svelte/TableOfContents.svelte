<script lang="ts">
  import { onMount } from 'svelte'
  import { setupTOCHandlers } from '../../page-outline/setup'
  import { refreshPageHeaders } from '../../page-outline/pageHeaders'

  export let currentPage: string = ""
  export let logseqVersionMd: boolean = false

  let mounted = false

  onMount(() => {
    mounted = true
    // Initialize TOC handlers
    setupTOCHandlers(logseqVersionMd)
    
    return () => {
      // Cleanup TOC container
      const container = document.getElementById('lse-toc-container')
      if (container) {
        container.remove()
      }
    }
  })

  // Reactive statement to update TOC when currentPage changes
  $: if (mounted && currentPage) {
    refreshPageHeaders(currentPage)
  }
</script>

{#if mounted}
  <!-- Table of Contents container will be populated by the original TOC logic -->
  <div id="lse-toc-root"></div>
{/if}

<style>
  #lse-toc-root {
    /* Styles for TOC root */
  }
</style>