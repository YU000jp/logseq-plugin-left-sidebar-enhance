/**
 * Toolbar icon for per-page heading numbering activation
 */

import { createElementWithAttributes } from '../util/domUtils'
import { isPageActive, applyHeadingNumbersToPage, togglePageState } from './index'

let currentPageName: string = ''

let toolbarIcon: HTMLElement | null = null
let isHandlingClick = false

/**
 * Create and add toolbar icon
 */
export const createToolbarIcon = (pageName: string) => {
    // Remove existing icon if present
    removeToolbarIcon()
    currentPageName = pageName

    // Find toolbar area - try multiple selectors for robustness
    let toolbar = parent.document.querySelector('#head>.r') as HTMLElement
    if (!toolbar) {
        // Fallback to alternative selector
        toolbar = parent.document.querySelector('.cp__header-right-menu') as HTMLElement
    }
    if (!toolbar) {
        console.warn('Toolbar not found - heading numbering toggle icon could not be added')
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

    // Add click handler; reference dynamic currentPageName
    toolbarIcon.addEventListener('click', async () => {
        if (isHandlingClick) return
        isHandlingClick = true
        try {
            // Use shared togglePageState which updates settings and returns {newState, hadEntry}
            const result = await togglePageState(currentPageName)
            const newState = result.newState
            const hadEntry = result.hadEntry

            if (newState) await applyHeadingNumbersToPage(currentPageName)

            // Update visual state and recreate icon if needed
            updateToolbarIconState(newState)
            if (!toolbarIcon || !toolbarIcon.parentNode) createToolbarIcon(currentPageName)

            // Single concise message to avoid duplicates
            // const storageMode = (logseq.settings?.["pageStateStorageMode"] as string) || logseq.settings?.["toc.pageStateStorageMode"] as string
            let combinedMsg = ''
            // Build message using hadEntry and newState — storageMode used only for wording
            if (newState) {
                combinedMsg = hadEntry ? 'Page enabled and updated' : 'Page enabled and saved'
            } else {
                combinedMsg = hadEntry ? 'Page disabled and removed from storage' : 'Page disabled'
            }
            await logseq.UI.showMsg(combinedMsg, 'info', { timeout: 1800 })
        } catch (error) {
            console.error('Error handling toolbar icon click', error)
            await logseq.UI.showMsg('Error toggling heading numbering', 'error')
        } finally {
            setTimeout(() => { isHandlingClick = false }, 300)
        }
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
    currentPageName = pageName

    if (!toolbarIcon) {
        createToolbarIcon(pageName)
        return
    }

    const isActive = isPageActive(pageName)
    updateToolbarIconState(isActive)
}
