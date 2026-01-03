/**
 * Heading numbering module
 * Provides hierarchical heading numbering with display-only and file-update modes
 */

import { BlockEntity, PageEntity } from '@logseq/libs/dist/LSPlugin'
import { settingKeys } from '../settings/keys'
import headingNumberingCSS from './headingNumbering.css?inline'
import { getHeaderLevel } from '../page-outline/regex'

let isFileBasedGraph = false
let headingNumberingStyleElement: HTMLStyleElement | null = null

/**
 * Initialize heading numbering features
 */
export const initHeadingNumbering = async () => {
    // Detect if current graph is file-based
    isFileBasedGraph = await detectFileBasedGraph()
    
    // Apply initial settings
    updateHeadingNumberingDisplay()
    updateHeadingLevelMarks()
    
    // Apply base CSS
    applyBaseStyles()
}

/**
 * Detect if current graph is file-based (not cloud-based)
 */
const detectFileBasedGraph = async (): Promise<boolean> => {
    try {
        const currentGraph = await logseq.App.getCurrentGraph()
        // File-based graphs have a 'path' property
        return !!(currentGraph && 'path' in currentGraph && currentGraph.path !== null)
    } catch (error) {
        console.warn('Could not detect graph type:', error)
        return false
    }
}

/**
 * Apply base CSS styles for heading numbering
 */
const applyBaseStyles = () => {
    logseq.provideStyle(headingNumberingCSS)
}

/**
 * Update display-only heading numbering based on settings
 */
export const updateHeadingNumberingDisplay = () => {
    const enabled = logseq.settings?.[settingKeys.toc.headingNumberDisplayEnable] === true
    const delimiter = (logseq.settings?.[settingKeys.toc.headingNumberDelimiterDisplay] as string) || '.'
    
    const body = parent.document.body
    
    if (enabled) {
        body.classList.add('lse-heading-numbering-display')
        updateHeadingNumberingCSS(delimiter)
    } else {
        body.classList.remove('lse-heading-numbering-display')
        removeHeadingNumberingCSS()
    }
}

/**
 * Update heading level markers based on settings
 */
export const updateHeadingLevelMarks = () => {
    const enabled = logseq.settings?.[settingKeys.toc.headingLevelMarkEnable] === true
    const body = parent.document.body
    
    if (enabled) {
        body.classList.add('lse-heading-level-mark')
    } else {
        body.classList.remove('lse-heading-level-mark')
    }
}

/**
 * Generate dynamic CSS for heading numbering with custom delimiter
 */
const updateHeadingNumberingCSS = (delimiter: string) => {
    // Remove old style element if exists
    removeHeadingNumberingCSS()
    
    // Create new style element
    headingNumberingStyleElement = parent.document.createElement('style')
    headingNumberingStyleElement.id = 'lse-heading-numbering-dynamic'
    
    // Generate CSS with custom delimiter
    const css = `
body.lse-heading-numbering-display #main-content-container h1.uniline-block::before {
    content: counter(h1) "${delimiter} ";
    margin-right: 0.5em;
}

body.lse-heading-numbering-display #main-content-container h2.uniline-block::before {
    content: counter(h1) "${delimiter}" counter(h2) "${delimiter} ";
    margin-right: 0.5em;
}

body.lse-heading-numbering-display #main-content-container h3.uniline-block::before {
    content: counter(h1) "${delimiter}" counter(h2) "${delimiter}" counter(h3) "${delimiter} ";
    margin-right: 0.5em;
}

body.lse-heading-numbering-display #main-content-container h4.uniline-block::before {
    content: counter(h1) "${delimiter}" counter(h2) "${delimiter}" counter(h3) "${delimiter}" counter(h4) "${delimiter} ";
    margin-right: 0.5em;
}

body.lse-heading-numbering-display #main-content-container h5.uniline-block::before {
    content: counter(h1) "${delimiter}" counter(h2) "${delimiter}" counter(h3) "${delimiter}" counter(h4) "${delimiter}" counter(h5) "${delimiter} ";
    margin-right: 0.5em;
}

body.lse-heading-numbering-display #main-content-container h6.uniline-block::before {
    content: counter(h1) "${delimiter}" counter(h2) "${delimiter}" counter(h3) "${delimiter}" counter(h4) "${delimiter}" counter(h5) "${delimiter}" counter(h6) "${delimiter} ";
    margin-right: 0.5em;
}
`
    
    headingNumberingStyleElement.textContent = css
    parent.document.head.appendChild(headingNumberingStyleElement)
}

/**
 * Remove dynamic heading numbering CSS
 */
const removeHeadingNumberingCSS = () => {
    if (headingNumberingStyleElement && headingNumberingStyleElement.parentNode) {
        headingNumberingStyleElement.parentNode.removeChild(headingNumberingStyleElement)
        headingNumberingStyleElement = null
    }
}

/**
 * Check if page should have heading numbering features applied
 */
export const isPageActive = (pageName: string): boolean => {
    const storageMode = logseq.settings?.[settingKeys.toc.pageStateStorageMode] as string || 'storeTrueOnly'
    const pageStates = logseq.settings?.[settingKeys.toc.pageStates] as Record<string, boolean> || {}
    
    if (storageMode === 'storeTrueOnly') {
        // Only pages explicitly set to true are active
        return pageStates[pageName] === true
    } else {
        // All pages active except those explicitly set to false
        return pageStates[pageName] !== false
    }
}

/**
 * Toggle page activation state
 */
export const togglePageState = async (pageName: string): Promise<boolean> => {
    const storageMode = logseq.settings?.[settingKeys.toc.pageStateStorageMode] as string || 'storeTrueOnly'
    const pageStates = logseq.settings?.[settingKeys.toc.pageStates] as Record<string, boolean> || {}
    
    const currentState = isPageActive(pageName)
    const newState = !currentState
    
    if (storageMode === 'storeTrueOnly') {
        if (newState) {
            pageStates[pageName] = true
        } else {
            delete pageStates[pageName]
        }
    } else {
        // storeFalseOnly
        if (newState) {
            delete pageStates[pageName]
        } else {
            pageStates[pageName] = false
        }
    }
    
    await logseq.updateSettings({
        [settingKeys.toc.pageStates]: pageStates
    })
    
    return newState
}

/**
 * File-update mode: Calculate hierarchical heading numbers
 */
interface HeadingBlock {
    uuid: string
    content: string
    level: number
}

/**
 * Calculate heading numbers for all headings in a page
 */
const calculateHeadingNumbers = (blocks: HeadingBlock[], delimiter: string): Map<string, string> => {
    const numbering = new Map<string, string>()
    const counters = [0, 0, 0, 0, 0, 0] // h1-h6 counters
    
    for (const block of blocks) {
        const level = block.level
        if (level < 1 || level > 6) continue
        
        // Increment current level counter
        counters[level - 1]++
        
        // Reset all deeper level counters
        for (let i = level; i < 6; i++) {
            counters[i] = 0
        }
        
        // Generate number string
        const numbers = counters.slice(0, level).filter(n => n > 0)
        const numberStr = numbers.join(delimiter)
        
        numbering.set(block.uuid, numberStr)
    }
    
    return numbering
}

/**
 * Extract heading number from content using old delimiter
 */
const extractOldNumber = (content: string, oldDelimiter: string): { number: string | null, textWithoutNumber: string } => {
    // Match patterns like "1.2.3 Heading text" or "1-2-3 Heading text"
    const escapedDelimiter = oldDelimiter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = new RegExp(`^(#+)\\s+(\\d+(?:${escapedDelimiter}\\d+)*)${escapedDelimiter}?\\s+(.*)$`)
    const match = content.match(pattern)
    
    if (match) {
        const hashTags = match[1]
        const number = match[2]
        const text = match[3]
        return {
            number,
            textWithoutNumber: `${hashTags} ${text}`
        }
    }
    
    return {
        number: null,
        textWithoutNumber: content
    }
}

/**
 * Apply heading numbers to page blocks (file-update mode)
 */
export const applyHeadingNumbersToPage = async (pageName: string): Promise<void> => {
    // Only work on file-based graphs
    if (!isFileBasedGraph) {
        console.warn('Heading numbering file-update mode is only available for file-based graphs')
        return
    }
    
    // Check if file-update mode is enabled
    if (logseq.settings?.[settingKeys.toc.headingNumberFileEnable] !== true) {
        return
    }
    
    // Check if page is active
    if (!isPageActive(pageName)) {
        return
    }
    
    const newDelimiter = (logseq.settings?.[settingKeys.toc.headingNumberDelimiterFile] as string) || '.'
    const oldDelimiter = (logseq.settings?.[settingKeys.toc.headingNumberDelimiterFileOld] as string) || '.'
    
    try {
        // Get all blocks from the page
        const pageBlocks = await logseq.Editor.getPageBlocksTree(pageName)
        if (!pageBlocks) return
        
        // Extract heading blocks
        const headingBlocks: HeadingBlock[] = []
        const extractHeadings = (blocks: any[]) => {
            for (const block of blocks) {
                const level = getHeaderLevel(block.content)
                if (level > 0 && level <= 6) {
                    headingBlocks.push({
                        uuid: block.uuid,
                        content: block.content,
                        level
                    })
                }
                if (block.children) {
                    extractHeadings(block.children)
                }
            }
        }
        extractHeadings(pageBlocks)
        
        // Calculate new numbering
        const numbering = calculateHeadingNumbers(headingBlocks, newDelimiter)
        
        // Update blocks that need changes
        for (const block of headingBlocks) {
            const expectedNumber = numbering.get(block.uuid)
            if (!expectedNumber) continue
            
            // Extract old number if present
            const { number: oldNumber, textWithoutNumber } = extractOldNumber(block.content, oldDelimiter)
            
            // Generate new content
            const level = block.level
            const hashTags = '#'.repeat(level)
            const newContent = `${hashTags} ${expectedNumber}${newDelimiter} ${textWithoutNumber.replace(/^#+\s+/, '')}`
            
            // Only update if content changed
            if (newContent !== block.content) {
                await logseq.Editor.updateBlock(block.uuid, newContent)
            }
        }
    } catch (error) {
        console.error('Error applying heading numbers:', error)
    }
}

/**
 * Handle settings changed
 */
export const handleHeadingNumberingSettingsChanged = async (newSet: any, oldSet: any): Promise<void> => {
    // Display-only mode toggle
    if (oldSet[settingKeys.toc.headingNumberDisplayEnable] !== newSet[settingKeys.toc.headingNumberDisplayEnable] ||
        oldSet[settingKeys.toc.headingNumberDelimiterDisplay] !== newSet[settingKeys.toc.headingNumberDelimiterDisplay]) {
        updateHeadingNumberingDisplay()
    }
    
    // Heading level markers toggle
    if (oldSet[settingKeys.toc.headingLevelMarkEnable] !== newSet[settingKeys.toc.headingLevelMarkEnable]) {
        updateHeadingLevelMarks()
    }
    
    // File-update mode changes
    if (oldSet[settingKeys.toc.headingNumberFileEnable] !== newSet[settingKeys.toc.headingNumberFileEnable] ||
        oldSet[settingKeys.toc.headingNumberDelimiterFile] !== newSet[settingKeys.toc.headingNumberDelimiterFile] ||
        oldSet[settingKeys.toc.headingNumberDelimiterFileOld] !== newSet[settingKeys.toc.headingNumberDelimiterFileOld]) {
        // Re-apply numbering to current page if enabled
        const currentPage = await logseq.Editor.getCurrentPage()
        if (currentPage && newSet[settingKeys.toc.headingNumberFileEnable] === true) {
            const pageName = (currentPage.originalName || currentPage.name) as string
            await applyHeadingNumbersToPage(pageName)
        }
    }
}

/**
 * Cleanup function
 */
export const cleanupHeadingNumbering = () => {
    removeHeadingNumberingCSS()
    const body = parent.document.body
    body.classList.remove('lse-heading-numbering-display')
    body.classList.remove('lse-heading-level-mark')
}
