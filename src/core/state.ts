import { PageEntity } from '@logseq/libs/dist/LSPlugin'
import { PluginState, ProcessingFlags } from '../types'
import { DEFAULTS } from '../config/constants'
import { logger } from '../utils/logger'

/**
 * Centralized state management for the plugin
 */
class StateManager {
  private static instance: StateManager
  private state: PluginState
  private flags: ProcessingFlags

  private constructor() {
    this.state = {
      currentPageOriginalName: DEFAULTS.CURRENT_PAGE_NAME,
      logseqVersion: DEFAULTS.LOGSEQ_VERSION,
      logseqVersionMd: DEFAULTS.LOGSEQ_VERSION_MD
    }
    
    this.flags = {
      processingBlockChanged: false,
      onBlockChangedOnce: false,
      processingOnPageChanged: false
    }
  }

  static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager()
    }
    return StateManager.instance
  }

  // State getters and setters
  getCurrentPageOriginalName(): PageEntity['originalName'] {
    return this.state.currentPageOriginalName
  }

  setCurrentPageOriginalName(name: PageEntity['originalName']): void {
    logger.debug('Setting current page name', { name })
    this.state.currentPageOriginalName = name
  }

  getLogseqVersion(): string {
    return this.state.logseqVersion
  }

  setLogseqVersion(version: string): void {
    logger.debug('Setting Logseq version', { version })
    this.state.logseqVersion = version
  }

  isLogseqVersionMd(): boolean {
    return this.state.logseqVersionMd
  }

  setLogseqVersionMd(isMd: boolean): void {
    logger.debug('Setting Logseq version MD flag', { isMd })
    this.state.logseqVersionMd = isMd
  }

  // Processing flags management
  isProcessingBlockChanged(): boolean {
    return this.flags.processingBlockChanged
  }

  setProcessingBlockChanged(processing: boolean): void {
    this.flags.processingBlockChanged = processing
  }

  isOnBlockChangedOnce(): boolean {
    return this.flags.onBlockChangedOnce
  }

  setOnBlockChangedOnce(once: boolean): void {
    this.flags.onBlockChangedOnce = once
  }

  isProcessingOnPageChanged(): boolean {
    return this.flags.processingOnPageChanged
  }

  setProcessingOnPageChanged(processing: boolean): void {
    this.flags.processingOnPageChanged = processing
  }

  // Reset methods
  resetCurrentPage(): void {
    logger.debug('Resetting current page')
    this.state.currentPageOriginalName = DEFAULTS.CURRENT_PAGE_NAME
  }

  resetAllFlags(): void {
    logger.debug('Resetting all processing flags')
    this.flags = {
      processingBlockChanged: false,
      onBlockChangedOnce: false,
      processingOnPageChanged: false
    }
  }

  // Complete state getter (for debugging)
  getDebugState(): { state: PluginState; flags: ProcessingFlags } {
    return {
      state: { ...this.state },
      flags: { ...this.flags }
    }
  }
}

// Export singleton instance
export const stateManager = StateManager.getInstance()