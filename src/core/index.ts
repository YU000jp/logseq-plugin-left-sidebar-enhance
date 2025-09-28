/**
 * Main exports for the Left Sidebar Enhance plugin core modules
 * This provides easy access to the main utilities and services
 */

// Core services
export { stateManager } from './state'
export { versionManager } from './version'
export { logger, LogLevel } from '../utils/logger'

// Configuration
export { ELEMENT_IDS, TIMEOUTS, CSS_SELECTORS, VERSION_PATTERNS, DEFAULTS, PERFORMANCE } from '../config/constants'

// Utilities
export { 
  createElementWithAttributes, 
  scrollToWithOffset, 
  safeGetElementById, 
  safeQuerySelector,
  batchDOMUpdates,
  createElementsBatch
} from '../utils/domUtils'
export { removeProvideStyle, pageOpen, removeContainer, withTimeout } from '../utils/lib'

// Performance utilities
export {
  debounce,
  throttle,
  nextFrame,
  batchDOMOperations,
  domCache,
  smartTimeout,
  performanceMonitor
} from '../utils/performance'

// Types
export * from '../types'