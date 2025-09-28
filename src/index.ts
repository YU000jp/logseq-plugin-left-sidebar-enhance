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
import { debounce, throttle, performanceMonitor, smartTimeout } from './utils/performance'

// Export functions for backward compatibility and external use
export const booleanLogseqVersionMd = (): boolean => stateManager.isLogseqVersionMd()
export const getCurrentPageOriginalName = (): string => stateManager.getCurrentPageOriginalName()

export const updateCurrentPage = async (
  pageName: string, 
  pageUuid: string
): Promise<void> => {
  try {
    const startTime = performanceMonitor.startMeasure('updateCurrentPage')
    stateManager.setCurrentPageOriginalName(pageName)
    logger.debug('Current page updated', { pageName, pageUuid })
    performanceMonitor.endMeasure('updateCurrentPage', startTime)
  } catch (error) {
    logger.error('Failed to update current page', error)
  }
}


/**
 * Main plugin initialization function with performance monitoring
 */
const main = async (): Promise<void> => {
  try {
    const startTime = performanceMonitor.startMeasure('plugin-initialization')
    logger.info('Initializing Left Sidebar Enhance plugin')

    // Initialize internationalization
    await logger.measureTime('L10n setup', async () => {
      await l10nSetup({ builtinTranslations: { ja } })
    })

    // Setup user settings
    logseq.useSettingsSchema(settingsTemplate())

    // Show settings UI on first time (with reduced delay)
    if (!logseq.settings) {
      smartTimeout.set('settingsUI', () => logseq.showSettingsUI(), TIMEOUTS.SETTINGS_UI_DELAY)
    }

    // Check Logseq version and initialize version-dependent features
    const isMdVersion = await logger.measureTime('Version check', async () => {
      return await versionManager.checkLogseqVersion()
    })
    
    // Initialize features in parallel for better performance
    await Promise.all([
      logger.measureTime('TOC setup', async () => {
        setupTOCHandlers(isMdVersion)
      }),
      logger.measureTime('Date selector setup', async () => {
        loadDateSelector()
      }),
      logger.measureTime('Mouse over setup', async () => {
        loadShowByMouseOver()
      }),
      logger.measureTime('Favorites and recent setup', async () => {
        loadFavAndRecent()
      })
    ])

    // Setup cleanup handlers
    setupCleanupHandlers()

    // Setup app-level event handlers
    setupAppEventHandlers()

    const totalTime = performanceMonitor.endMeasure('plugin-initialization', startTime)
    logger.info(`Plugin initialization completed successfully in ${totalTime.toFixed(2)}ms`)

    // Log performance stats every 30 seconds in debug mode
    if (logger.constructor.name === 'Logger') {
      setInterval(() => {
        const stats = performanceMonitor.getAllStats()
        if (Object.keys(stats).length > 0) {
          logger.debug('Performance stats', stats)
        }
      }, 30000)
    }
    
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
    // Clear all timeouts and performance monitoring
    smartTimeout.clearAll()
    removeContainer(ELEMENT_IDS.TOC_CONTAINER)
    removeContainer(ELEMENT_IDS.DATE_SELECTOR_CONTAINER)
    
    // Log final performance stats
    const stats = performanceMonitor.getAllStats()
    if (Object.keys(stats).length > 0) {
      logger.info('Final performance stats', stats)
    }
  })
}

/**
 * Setup application-level event handlers with performance optimization
 */
const setupAppEventHandlers = (): void => {
  // Debounce graph change events to avoid excessive processing
  const debouncedGraphChange = debounce(async () => {
    logger.info('Graph changed - resetting state')
    stateManager.resetCurrentPage()
    await versionManager.checkLogseqVersion()
  }, TIMEOUTS.DEBOUNCE_DELAY)

  logseq.App.onCurrentGraphChanged(debouncedGraphChange)
}

// Processing flags
export let onBlockChangedOnce: boolean = false

// Debounced TOC update for better performance
const debouncedTocUpdate = debounce((): void => {
  if (stateManager.isProcessingBlockChanged()) return
  
  stateManager.setProcessingBlockChanged(true)
  smartTimeout.set('tocUpdate', () => {
    const startTime = performanceMonitor.startMeasure('toc-update')
    refreshPageHeaders(stateManager.getCurrentPageOriginalName())
    performanceMonitor.endMeasure('toc-update', startTime)
    stateManager.setProcessingBlockChanged(false)
  }, TIMEOUTS.TOC_UPDATE_DELAY)
}, TIMEOUTS.DEBOUNCE_DELAY)

export const onBlockChanged = (): void => {
  if (onBlockChangedOnce === true) return
  
  onBlockChangedOnce = true
  stateManager.setOnBlockChangedOnce(true)
  
  // Throttle block change events to improve performance
  const throttledBlockChange = throttle(async ({ blocks }) => {
    if (stateManager.isProcessingBlockChanged() ||
        stateManager.getCurrentPageOriginalName() === '' ||
        logseq.settings!.booleanTableOfContents === false) {
      return
    }

    const startTime = performanceMonitor.startMeasure('block-change-processing')
    const findBlock = blocks.find((block: any) => block.properties?.heading) as { uuid: BlockEntity['uuid'] } | null
    if (!findBlock) {
      performanceMonitor.endMeasure('block-change-processing', startTime)
      return
    }
    
    const uuid = findBlock.uuid
    debouncedTocUpdate()

    smartTimeout.set('blockChangeCallback', () => {
      if (uuid) {
        logseq.DB.onBlockChanged(uuid, debouncedTocUpdate)
      }
    }, TIMEOUTS.BLOCK_CHANGE_CALLBACK_DELAY)
    
    performanceMonitor.endMeasure('block-change-processing', startTime)
  }, TIMEOUTS.THROTTLE_DELAY)

  logseq.DB.onChanged(throttledBlockChange)
}

/**
 * Page change callback with improved performance and state management
 */
export const onPageChangedCallback = debounce(async (
  pageName: string, 
  flag?: PageChangeCallbackOptions
): Promise<void> => {
  if (stateManager.isProcessingOnPageChanged()) {
    logger.debug('Page change already in progress, skipping')
    return
  }
  
  const startTime = performanceMonitor.startMeasure('page-change-callback')
  stateManager.setProcessingOnPageChanged(true)
  
  // Automatic reset with smart timeout
  smartTimeout.set('pageChangeReset', () => {
    stateManager.setProcessingOnPageChanged(false)
  }, TIMEOUTS.PAGE_CHANGE_PROCESSING_DELAY)

  smartTimeout.set('pageChangeExecution', async () => {
    try {
      if (logseq.settings!.booleanLeftTOC === true) {
        await refreshPageHeaders(pageName, flag)
        logger.debug('Page headers refreshed', { pageName })
      }
      performanceMonitor.endMeasure('page-change-callback', startTime)
    } catch (error) {
      logger.error('Failed to refresh page headers', error)
      performanceMonitor.endMeasure('page-change-callback', startTime)
    }
  }, TIMEOUTS.PAGE_CHANGE_EXECUTION_DELAY)
}, TIMEOUTS.DEBOUNCE_DELAY)

// Initialize plugin with performance monitoring
logseq.ready(main).catch((error) => {
  logger.error('Plugin initialization failed', error)
  console.error('Left Sidebar Enhance plugin failed to start:', error)
})