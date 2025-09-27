import { logger } from './logger'

/**
 * Enhanced DOM utilities with improved error handling and type safety
 */

export interface ElementAttributes {
  [key: string]: string
}

export interface ScrollOptions {
  block?: ScrollLogicalPosition
  inline?: ScrollLogicalPosition
  behavior?: ScrollBehavior
}

/**
 * Utility function to create an HTML element with attributes and optional text content.
 */
export const createElementWithAttributes = (
  tag: string, 
  attributes: ElementAttributes, 
  textContent?: string
): HTMLElement => {
  try {
    const element = document.createElement(tag)
    
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value)
    })
    
    if (textContent) {
      element.textContent = textContent
    }
    
    logger.debug('Created element', { tag, attributes, hasTextContent: !!textContent })
    return element
  } catch (error) {
    logger.error('Failed to create element', { tag, attributes, error })
    throw new Error(`Failed to create element: ${tag}`)
  }
}

/**
 * Scrolls to a specific element with customizable options.
 */
export const scrollToWithOffset = (
  element: HTMLElement, 
  options: ScrollOptions = {}
): void => {
  try {
    const scrollOptions = {
      block: options.block || 'center' as ScrollLogicalPosition,
      inline: options.inline || 'nearest' as ScrollLogicalPosition,
      behavior: options.behavior || 'smooth' as ScrollBehavior
    }
    
    element.scrollIntoView(scrollOptions)
    logger.debug('Scrolled to element', { scrollOptions })
  } catch (error) {
    logger.error('Failed to scroll to element', { error })
    throw new Error('Failed to scroll to element')
  }
}

/**
 * Safely get element by ID with null checking
 */
export const safeGetElementById = <T extends HTMLElement = HTMLElement>(
  id: string
): T | null => {
  try {
    const element = parent.document.getElementById(id) as T | null
    if (!element) {
      logger.debug('Element not found', { id })
    }
    return element
  } catch (error) {
    logger.error('Error getting element by ID', { id, error })
    return null
  }
}

/**
 * Safely query selector with error handling
 */
export const safeQuerySelector = <T extends Element = Element>(
  selector: string,
  context: Document | Element = parent.document
): T | null => {
  try {
    const element = context.querySelector(selector) as T | null
    if (!element) {
      logger.debug('Element not found with selector', { selector })
    }
    return element
  } catch (error) {
    logger.error('Error querying selector', { selector, error })
    return null
  }
}