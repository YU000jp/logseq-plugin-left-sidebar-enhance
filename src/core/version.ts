import { AppInfo } from '@logseq/libs/dist/LSPlugin'
import { VersionInfo } from '../types'
import { VERSION_PATTERNS } from '../config/constants'
import { logger } from '../utils/logger'
import { stateManager } from './state'

/**
 * Version management utilities for Logseq compatibility
 */
export class VersionManager {
  private static instance: VersionManager

  private constructor() {}

  static getInstance(): VersionManager {
    if (!VersionManager.instance) {
      VersionManager.instance = new VersionManager()
    }
    return VersionManager.instance
  }

  /**
   * Check Logseq version and determine if it's MD version
   */
  async checkLogseqVersion(): Promise<boolean> {
    try {
      const logseqInfo = await logseq.App.getInfo('version') as AppInfo | any
      const version = this.parseVersion(logseqInfo)
      
      if (version) {
        stateManager.setLogseqVersion(version.version)
        stateManager.setLogseqVersionMd(version.isMdVersion)
        
        logger.info('Logseq version detected', {
          version: version.version,
          isMdVersion: version.isMdVersion
        })
        
        return version.isMdVersion
      } else {
        logger.warn('Could not parse Logseq version, using defaults')
        stateManager.setLogseqVersion(VERSION_PATTERNS.DEFAULT_VERSION)
        stateManager.setLogseqVersionMd(false)
        return false
      }
    } catch (error) {
      logger.error('Failed to get Logseq version info', error)
      stateManager.setLogseqVersion(VERSION_PATTERNS.DEFAULT_VERSION)
      stateManager.setLogseqVersionMd(false)
      return false
    }
  }

  /**
   * Parse version string and determine if it's MD version
   */
  private parseVersion(versionInfo: string): VersionInfo | null {
    const versionMatch = versionInfo.match(VERSION_PATTERNS.VERSION_REGEX)
    
    if (versionMatch) {
      const version = versionMatch[0]
      const isMdVersion = VERSION_PATTERNS.MD_VERSION_REGEX.test(version)
      
      return {
        version,
        isMdVersion
      }
    }
    
    return null
  }

  /**
   * Get current version info from state
   */
  getCurrentVersionInfo(): VersionInfo {
    return {
      version: stateManager.getLogseqVersion(),
      isMdVersion: stateManager.isLogseqVersionMd()
    }
  }

  /**
   * Check if current version is MD version
   */
  isCurrentVersionMd(): boolean {
    return stateManager.isLogseqVersionMd()
  }
}

// Export singleton instance
export const versionManager = VersionManager.getInstance()