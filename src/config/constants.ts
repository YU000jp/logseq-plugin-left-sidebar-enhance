/**
 * Application constants and configuration values
 */

// Element IDs
export const ELEMENT_IDS = {
  TOC_CONTAINER: 'lse-toc-container',
  TOC_INNER: 'lse-toc-inner',
  TOC_CONTENT: 'lse-toc-content',
  DATE_SELECTOR_CONTAINER: 'lse-dataSelector-container'
} as const

// Timeouts and delays (in milliseconds)
export const TIMEOUTS = {
  SETTINGS_UI_DELAY: 300,
  PROCESSING_LOCK_DURATION: 5000,
  ROUTE_CHECK_DELAY: 200,
  TOC_UPDATE_DELAY: 300,
  PAGE_CHANGE_PROCESSING_DELAY: 300,
  PAGE_CHANGE_EXECUTION_DELAY: 50,
  BLOCK_CHANGE_CALLBACK_DELAY: 200,
  CONTAINER_SETUP_DELAY: 500,
  CONTAINER_FLAG_DELAY: 1
} as const

// CSS Selectors
export const CSS_SELECTORS = {
  LEFT_SIDEBAR_MD: '#left-sidebar>div.left-sidebar-inner div.nav-contents-container',
  LEFT_SIDEBAR_DB: '#left-sidebar>div.left-sidebar-inner div.sidebar-contents-container',
  MAIN_CONTENT_CONTAINER: '#main-content-container div.ls-page-blocks',
  LEFT_CONTAINER: '#left-container'
} as const

// Version patterns
export const VERSION_PATTERNS = {
  VERSION_REGEX: /(\d+)\.(\d+)\.(\d+)/,
  MD_VERSION_REGEX: /0\.([0-9]|10)\.\d+/,
  DEFAULT_VERSION: '0.0.0'
} as const

// Default values
export const DEFAULTS = {
  CURRENT_PAGE_NAME: '',
  LOGSEQ_VERSION: '',
  LOGSEQ_VERSION_MD: false
} as const