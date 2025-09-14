<template>
  <div v-if="showSettings" class="settings-panel">
    <div class="settings-header">
      <h3>{{ $t('Plugin Settings') }}</h3>
      <button @click="closeSettings" class="close-btn">×</button>
    </div>
    
    <div class="settings-content">
      <div class="setting-item">
        <label>
          <input 
            type="checkbox" 
            v-model="localSettings.booleanFavAndRecent"
            @change="updateSetting('booleanFavAndRecent', $event.target.checked)"
          >
          {{ $t('Hide duplicate items in Favorites and History') }}
        </label>
        <p class="setting-description">
          {{ $t('Automatically removes duplicates in Favorites and History when the plugin starts and every 10 minutes.') }}
        </p>
      </div>

      <div class="setting-item">
        <label>
          <input 
            type="checkbox" 
            v-model="localSettings.loadShowByMouseOver"
            @change="updateSetting('loadShowByMouseOver', $event.target.checked)"
          >
          {{ $t('Show left sidebar on mouse hover') }}
        </label>
        <p class="setting-description">
          {{ $t('Choose between three modes: show on hover, always show, or hide.') }}
        </p>
      </div>

      <div class="setting-item">
        <label>
          <input 
            type="checkbox" 
            v-model="localSettings.booleanDateSelector"
            @change="updateSetting('booleanDateSelector', $event.target.checked)"
          >
          {{ $t('Enable date selector in the left sidebar') }}
        </label>
        <p class="setting-description">
          {{ $t('Not compatible with the Logseq db version.') }}
        </p>
      </div>

      <div class="setting-item">
        <label>
          <input 
            type="checkbox" 
            v-model="localSettings.booleanLeftTOC"
            @change="updateSetting('booleanLeftTOC', $event.target.checked)"
          >
          {{ $t('Enable Table of Contents') }}
        </label>
      </div>

      <div class="setting-item">
        <label>
          <input 
            type="checkbox" 
            v-model="localSettings.highlightBlockOnHover"
            @change="updateSetting('highlightBlockOnHover', $event.target.checked)"
          >
          {{ $t('Highlight blocks when hovering over headers') }}
        </label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'

// Props
interface Props {
  showSettings: boolean
  settings: Record<string, any>
}

const props = withDefaults(defineProps<Props>(), {
  showSettings: false,
  settings: () => ({})
})

// Emits
const emit = defineEmits<{
  close: []
  updateSettings: [settings: Record<string, any>]
}>()

// Local reactive copy of settings
const localSettings = reactive({ ...props.settings })

// Watch for external settings changes
watch(() => props.settings, (newSettings) => {
  Object.assign(localSettings, newSettings)
}, { deep: true })

// Methods
const closeSettings = () => {
  emit('close')
}

const updateSetting = (key: string, value: any) => {
  localSettings[key] = value
  emit('updateSettings', { ...localSettings })
  
  // Update Logseq settings if available
  if (window.logseq?.updateSettings) {
    window.logseq.updateSettings({ [key]: value })
  }
}

// Basic translation function (placeholder)
const $t = (key: string) => {
  // This would normally use a proper i18n system
  // For now, just return the key
  return key
}
</script>

<style scoped>
.settings-panel {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 400px;
  max-height: 80vh;
  background: var(--ls-primary-background-color, #fff);
  border: 1px solid var(--ls-border-color, #ccc);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--ls-secondary-background-color, #f8f9fa);
  border-bottom: 1px solid var(--ls-border-color, #ccc);
}

.settings-header h3 {
  margin: 0;
  color: var(--ls-primary-text-color, #000);
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: var(--ls-secondary-text-color, #666);
}

.close-btn:hover {
  background: var(--ls-tertiary-background-color, #e9ecef);
}

.settings-content {
  max-height: calc(80vh - 80px);
  overflow-y: auto;
  padding: 16px;
}

.setting-item {
  margin-bottom: 20px;
}

.setting-item label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-weight: 500;
  color: var(--ls-primary-text-color, #000);
  cursor: pointer;
}

.setting-item input[type="checkbox"] {
  margin-top: 2px;
  flex-shrink: 0;
}

.setting-description {
  margin: 8px 0 0 24px;
  font-size: 14px;
  color: var(--ls-secondary-text-color, #666);
  line-height: 1.4;
}
</style>