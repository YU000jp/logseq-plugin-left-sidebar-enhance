/**
 * Main exports for the Left Sidebar Enhance plugin core modules
 * This provides easy access to the main utilities and services
 */

// Core services
export { stateManager } from './state'
export { versionManager } from './version'
export { logger, LogLevel } from '../utils/logger'

// Configuration
export { ELEMENT_IDS, TIMEOUTS, CSS_SELECTORS, VERSION_PATTERNS, DEFAULTS } from '../config/constants'

// Utilities
export { 
  createElementWithAttributes, 
  scrollToWithOffset, 
  safeGetElementById, 
  safeQuerySelector 
} from '../utils/domUtils'
export { removeProvideStyle, pageOpen, removeContainer, withTimeout } from '../utils/lib'

// Types
export * from '../types'