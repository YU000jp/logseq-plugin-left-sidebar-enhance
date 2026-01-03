/**
 * Toolbar icon for per-page heading numbering activation
 */

import { createElementWithAttributes } from '../util/domUtils'
import { isPageActive, togglePageState, applyHeadingNumbersToPage } from './index'

let toolbarIcon: HTMLElement | null = null

/**
 * Create and add toolbar icon
 */
export const createToolbarIcon = (pageName: string) => {
    // Remove existing icon if present
    removeToolbarIcon()
    
    // Find toolbar area
    const toolbar = parent.document.querySelector('#head>.r') as HTMLElement
    if (!toolbar) {
        console.warn('Toolbar not found')
        return
    }
    
    // Create icon button
    const isActive = isPageActive(pageName)
    toolbarIcon = createElementWithAttributes('a', {
        class: 'button',
        id: 'lse-heading-numbering-toggle',
        title: isActive 
            ? 'Heading numbering is enabled for this page (click to disable)' 
            : 'Heading numbering is disabled for this page (click to enable)',
        style: `
            cursor: pointer;
            opacity: ${isActive ? '1' : '0.4'};
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0 8px;
        `
    })
    
    // Add icon (using numbers 1,2,3 to represent heading hierarchy)
    toolbarIcon.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <text x="0" y="6" font-size="7" font-weight="bold">1</text>
            <text x="0" y="12" font-size="6" font-weight="bold">1.1</text>
            <text x="0" y="16" font-size="5" font-weight="bold">1.1.1</text>
        </svg>
    `
    
    // Add click handler
    toolbarIcon.addEventListener('click', async () => {
        const newState = await togglePageState(pageName)
        updateToolbarIconState(newState)
        
        // Trigger page reload to apply/remove numbering
        const currentPage = await logseq.Editor.getCurrentPage()
        if (currentPage && newState) {
            await applyHeadingNumbersToPage(pageName)
        }
        // Note: Removing numbers would require similar logic but removing them
    })
    
    // Insert before the first child or append
    if (toolbar.firstChild) {
        toolbar.insertBefore(toolbarIcon, toolbar.firstChild)
    } else {
        toolbar.appendChild(toolbarIcon)
    }
}

/**
 * Update toolbar icon state
 */
const updateToolbarIconState = (isActive: boolean) => {
    if (!toolbarIcon) return
    
    toolbarIcon.style.opacity = isActive ? '1' : '0.4'
    toolbarIcon.title = isActive 
        ? 'Heading numbering is enabled for this page (click to disable)' 
        : 'Heading numbering is disabled for this page (click to enable)'
}

/**
 * Remove toolbar icon
 */
export const removeToolbarIcon = () => {
    if (toolbarIcon && toolbarIcon.parentNode) {
        toolbarIcon.parentNode.removeChild(toolbarIcon)
        toolbarIcon = null
    }
}

/**
 * Update toolbar icon for new page
 */
export const updateToolbarIcon = (pageName: string) => {
    if (!toolbarIcon) {
        createToolbarIcon(pageName)
        return
    }
    
    const isActive = isPageActive(pageName)
    updateToolbarIconState(isActive)
}
