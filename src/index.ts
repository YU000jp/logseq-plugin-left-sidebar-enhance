import '@logseq/libs'
import { setup as l10nSetup } from 'logseq-l10n'
import { BlockEntity } from '@logseq/libs/dist/LSPlugin'
import { loadDateSelector } from './dateSelector'
import { loadFavAndRecent } from './favAndRecent'
import { loadShowByMouseOver } from './mouseover'
import { refreshPageHeaders } from './page-outline/pageHeaders'
import { setupTOCHandlers } from './page-outline/setup'
import { settingsTemplate } from './settings'
import ja from './translations/ja.json'
import { removeContainer } from './utils/lib'
import { logger } from './utils/logger'
import { stateManager } from './core/state'
import { versionManager } from './core/version'
import { ELEMENT_IDS, TIMEOUTS } from './config/constants'
import { PageChangeCallbackOptions } from './types'

// Export functions for backward compatibility and external use
export const booleanLogseqVersionMd = (): boolean => stateManager.isLogseqVersionMd()
export const getCurrentPageOriginalName = (): string => stateManager.getCurrentPageOriginalName()

export const updateCurrentPage = async (
  pageName: string, 
  pageUuid: string
): Promise<void> => {
  try {
    stateManager.setCurrentPageOriginalName(pageName)
    logger.debug('Current page updated', { pageName, pageUuid })
  } catch (error) {
    logger.error('Failed to update current page', error)
  }
}


/**
 * Main plugin initialization function
 */
const main = async (): Promise<void> => {
  try {
    logger.info('Initializing Left Sidebar Enhance plugin')

    // Initialize internationalization
    await l10nSetup({ builtinTranslations: { ja } })
    logger.debug('L10n setup completed')

    // Setup user settings
    logseq.useSettingsSchema(settingsTemplate())

    // Show settings UI on first time
    if (!logseq.settings) {
      setTimeout(() => logseq.showSettingsUI(), TIMEOUTS.SETTINGS_UI_DELAY)
    }

    // Check Logseq version and initialize version-dependent features
    const isMdVersion = await versionManager.checkLogseqVersion()
    
    // Initialize features
    await logger.measureTime('TOC setup', async () => {
      setupTOCHandlers(isMdVersion)
    })

    await logger.measureTime('Date selector setup', async () => {
      loadDateSelector()
    })

    await logger.measureTime('Mouse over setup', async () => {
      loadShowByMouseOver()
    })

    await logger.measureTime('Favorites and recent setup', async () => {
      loadFavAndRecent()
    })

    // Setup cleanup handlers
    setupCleanupHandlers()

    // Setup app-level event handlers
    setupAppEventHandlers()

    logger.info('Plugin initialization completed successfully')
  } catch (error) {
    logger.error('Failed to initialize plugin', error)
    throw error
  }
}


/**
 * Setup cleanup handlers for plugin lifecycle
 */
const setupCleanupHandlers = (): void => {
  logseq.beforeunload(async () => {
    logger.info('Plugin unloading - cleaning up')
    removeContainer(ELEMENT_IDS.TOC_CONTAINER)
    removeContainer(ELEMENT_IDS.DATE_SELECTOR_CONTAINER)
  })
}

/**
 * Setup application-level event handlers
 */
const setupAppEventHandlers = (): void => {
  logseq.App.onCurrentGraphChanged(async () => {
    logger.info('Graph changed - resetting state')
    stateManager.resetCurrentPage()
    await versionManager.checkLogseqVersion()
  })
}

// Processing flags
export let onBlockChangedOnce: boolean = false

export const onBlockChanged = (): void => {
  if (onBlockChangedOnce === true) return
  
  onBlockChangedOnce = true
  stateManager.setOnBlockChangedOnce(true)
  
  logseq.DB.onChanged(async ({ blocks }) => {
    if (stateManager.isProcessingBlockChanged() ||
        stateManager.getCurrentPageOriginalName() === '' ||
        logseq.settings!.booleanTableOfContents === false) {
      return
    }

    const findBlock = blocks.find((block) => block.properties?.heading) as { uuid: BlockEntity['uuid'] } | null
    if (!findBlock) return
    
    const uuid = findBlock.uuid
    updateToc()

    setTimeout(() => {
      if (uuid) {
        logseq.DB.onBlockChanged(uuid, () => updateToc())
      }
    }, TIMEOUTS.BLOCK_CHANGE_CALLBACK_DELAY)
  })
}

const updateToc = (): void => {
  if (stateManager.isProcessingBlockChanged()) return
  
  stateManager.setProcessingBlockChanged(true)
  setTimeout(() => {
    refreshPageHeaders(stateManager.getCurrentPageOriginalName())
    stateManager.setProcessingBlockChanged(false)
  }, TIMEOUTS.TOC_UPDATE_DELAY)
}

/**
 * Page change callback with improved state management
 */
export const onPageChangedCallback = async (
  pageName: string, 
  flag?: PageChangeCallbackOptions
): Promise<void> => {
  if (stateManager.isProcessingOnPageChanged()) {
    logger.debug('Page change already in progress, skipping')
    return
  }
  
  stateManager.setProcessingOnPageChanged(true)
  
  // Automatic reset after timeout
  setTimeout(() => {
    stateManager.setProcessingOnPageChanged(false)
  }, TIMEOUTS.PAGE_CHANGE_PROCESSING_DELAY)

  setTimeout(async () => {
    try {
      if (logseq.settings!.booleanLeftTOC === true) {
        await refreshPageHeaders(pageName, flag)
        logger.debug('Page headers refreshed', { pageName })
      }
    } catch (error) {
      logger.error('Failed to refresh page headers', error)
    }
  }, TIMEOUTS.PAGE_CHANGE_EXECUTION_DELAY)
}

// Initialize plugin
logseq.ready(main).catch((error) => {
  logger.error('Plugin initialization failed', error)
  console.error('Left Sidebar Enhance plugin failed to start:', error)
})