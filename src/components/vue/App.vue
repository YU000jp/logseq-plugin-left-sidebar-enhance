<template>
  <div id="logseq-plugin-left-sidebar-enhance">
    <!-- Main plugin container -->
    <div v-if="settings.booleanDateSelector" id="date-selector-mount"></div>
    <div v-if="settings.booleanLeftTOC" id="toc-mount"></div>
    
    <!-- Settings panel (example of Vue UI integration) -->
    <Settings 
      :show-settings="showSettings"
      :settings="settings"
      @close="showSettings = false"
      @update-settings="updateSettings"
    />
    
    <!-- Mouse over functionality is handled globally -->
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue'
import type { PageEntity } from '@logseq/libs/dist/LSPlugin'
import Settings from './Settings.vue'

// Import Svelte components - we'll mount them manually
import DateSelector from '../svelte/DateSelector.svelte'
import TableOfContents from '../svelte/TableOfContents.svelte'

// Reactive state
const currentPage = ref<PageEntity["originalName"]>("")
const logseqVersionMd = ref<boolean>(false)
const showSettings = ref<boolean>(false)
const settings = reactive({
  booleanDateSelector: false,
  booleanTableOfContents: true,
  booleanLeftTOC: true,
  booleanFavAndRecent: true,
  loadShowByMouseOver: false,
  highlightBlockOnHover: true,
  highlightHeaderOnHover: true,
  enableJournalsList: true
})

// Svelte component instances
let dateSelectorInstance: any = null
let tocInstance: any = null

// Methods for external access
const updateCurrentPage = (pageName: string, pageUuid: PageEntity["uuid"]) => {
  currentPage.value = pageName
}

const setLogseqVersionMd = (value: boolean) => {
  logseqVersionMd.value = value
}

const updateSettings = (newSettings: any) => {
  Object.assign(settings, newSettings)
}

// Mount Svelte components when needed
const mountDateSelector = async () => {
  await nextTick()
  const target = document.getElementById('date-selector-mount')
  if (target && !dateSelectorInstance) {
    dateSelectorInstance = new DateSelector({
      target
    })
  }
}

const mountTableOfContents = async () => {
  await nextTick()
  const target = document.getElementById('toc-mount')
  if (target && !tocInstance) {
    tocInstance = new TableOfContents({
      target,
      props: {
        currentPage: currentPage.value,
        logseqVersionMd: logseqVersionMd.value
      }
    })
  }
}

// Watch for changes to update Svelte components
watch([currentPage, logseqVersionMd], () => {
  if (tocInstance) {
    tocInstance.$set({
      currentPage: currentPage.value,
      logseqVersionMd: logseqVersionMd.value
    })
  }
})

watch(() => settings.booleanDateSelector, (newVal) => {
  if (newVal) {
    mountDateSelector()
  } else if (dateSelectorInstance) {
    dateSelectorInstance.$destroy()
    dateSelectorInstance = null
  }
})

watch(() => settings.booleanLeftTOC, (newVal) => {
  if (newVal) {
    mountTableOfContents()
  } else if (tocInstance) {
    tocInstance.$destroy()
    tocInstance = null
  }
})

// Lifecycle
onMounted(() => {
  // Initialize settings from logseq.settings
  if (window.logseq?.settings) {
    updateSettings(window.logseq.settings)
  }
  
  // Mount initial components
  if (settings.booleanDateSelector) {
    mountDateSelector()
  }
  if (settings.booleanLeftTOC) {
    mountTableOfContents()
  }

  // Setup global keyboard shortcut for settings (example)
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
      e.preventDefault()
      showSettings.value = !showSettings.value
    }
  }
  
  document.addEventListener('keydown', handleKeydown)
  
  // Cleanup event listener
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
  })
})

onUnmounted(() => {
  // Cleanup Svelte instances
  if (dateSelectorInstance) {
    dateSelectorInstance.$destroy()
  }
  if (tocInstance) {
    tocInstance.$destroy()
  }
})

// Export methods for use by the main plugin
defineExpose({
  updateCurrentPage,
  setLogseqVersionMd,
  updateSettings,
  currentPage,
  logseqVersionMd
})
</script>

<style scoped>
#logseq-plugin-left-sidebar-enhance {
  /* Plugin-specific styles */
}
</style>