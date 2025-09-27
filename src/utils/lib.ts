import { PageEntity } from '@logseq/libs/dist/LSPlugin'
import { getPageUuid } from './query/advancedQuery'
import { logger } from './logger'
import { safeGetElementById } from './domUtils'

/**
 * Enhanced library utilities with improved error handling
 */

export const removeProvideStyle = (className: string): void => {
  try {
    const doc = parent.document.head.querySelector(
      `style[data-injected-style^="${className}"]`
    ) as HTMLStyleElement | null
    
    if (doc) {
      doc.remove()
      logger.debug('Removed provided style', { className })
    } else {
      logger.debug('Style not found for removal', { className })
    }
  } catch (error) {
    logger.error('Failed to remove provided style', { className, error })
  }
}

export const pageOpen = async (
  pageName: string, 
  shiftKey: boolean, 
  replaceState: boolean
): Promise<void> => {
  try {
    const pageUuid = await getPageUuid(pageName) as PageEntity['uuid'] | null
    
    if (pageUuid) {
      if (shiftKey) {
        await logseq.Editor.openInRightSidebar(pageUuid)
      } else {
        await logseq.Editor.scrollToBlockInPage(pageName, pageUuid, { replaceState })
      }
      logseq.UI.showMsg(pageName)
      
      logger.info('Opened page successfully', { 
        pageName, 
        shiftKey, 
        replaceState 
      })
    } else {
      logger.warn('Page UUID not found', { pageName })
      throw new Error(`Page not found: ${pageName}`)
    }
  } catch (error) {
    logger.error('Failed to open page', { pageName, error })
    throw error
  }
}

export const removeContainer = (elementById: string): void => {
  try {
    const element = safeGetElementById(elementById)
    if (element) {
      element.remove()
      logger.debug('Container removed', { elementById })
    } else {
      logger.debug('Container not found for removal', { elementById })
    }
  } catch (error) {
    logger.error('Failed to remove container', { elementById, error })
  }
}

/**
 * Safely execute a function with timeout
 */
export const withTimeout = <T>(
  fn: () => Promise<T>, 
  timeoutMs: number,
  operation: string = 'operation'
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      logger.warn(`Operation timed out after ${timeoutMs}ms`, { operation })
      reject(new Error(`${operation} timed out after ${timeoutMs}ms`))
    }, timeoutMs)

    fn()
      .then(result => {
        clearTimeout(timeoutId)
        resolve(result)
      })
      .catch(error => {
        clearTimeout(timeoutId)
        reject(error)
      })
  })
}

