<script lang="ts">
  import { onMount } from 'svelte'
  import { loadDateSelector } from '../../dateSelector'

  let mounted = false

  onMount(() => {
    mounted = true
    // Initialize the date selector functionality
    loadDateSelector()
    
    return () => {
      // Cleanup if needed
      const container = document.getElementById('lse-dataSelector-container')
      if (container) {
        container.remove()
      }
    }
  })
</script>

{#if mounted}
  <!-- Date selector container will be populated by the original dateSelector logic -->
  <div id="lse-date-selector-root"></div>
{/if}

<style>
  #lse-date-selector-root {
    /* Styles for date selector root */
  }
</style>