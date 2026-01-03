/**
 * Heading numbering module
 * Provides hierarchical heading numbering with display-only and file-update modes
 */

import { BlockEntity, PageEntity } from '@logseq/libs/dist/LSPlugin'
import { settingKeys } from '../settings/keys'
import headingNumberingCSS from './headingNumbering.css?inline'
import { getHeaderLevel } from '../page-outline/regex'
import { getHierarchicalTocBlocks, getHierarchicalTocBlocksForDb, HierarchicalTocBlock } from '../page-outline/findHeaders'
import { booleanLogseqVersionMd } from '..'

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
    
    // Generate CSS with custom delimiter - targeting Logseq's block structure
    const css = `
body.lse-heading-numbering-display #main-content-container div.ls-block[data-refs-self*="\\"heading\\" 1"] .block-content::before {
    content: counter(h1) "${delimiter} ";
    margin-right: 0.5em;
}

body.lse-heading-numbering-display #main-content-container div.ls-block[data-refs-self*="\\"heading\\" 2"] .block-content::before {
    content: counter(h1) "${delimiter}" counter(h2) "${delimiter} ";
    margin-right: 0.5em;
}

body.lse-heading-numbering-display #main-content-container div.ls-block[data-refs-self*="\\"heading\\" 3"] .block-content::before {
    content: counter(h1) "${delimiter}" counter(h2) "${delimiter}" counter(h3) "${delimiter} ";
    margin-right: 0.5em;
}

body.lse-heading-numbering-display #main-content-container div.ls-block[data-refs-self*="\\"heading\\" 4"] .block-content::before {
    content: counter(h1) "${delimiter}" counter(h2) "${delimiter}" counter(h3) "${delimiter}" counter(h4) "${delimiter} ";
    margin-right: 0.5em;
}

body.lse-heading-numbering-display #main-content-container div.ls-block[data-refs-self*="\\"heading\\" 5"] .block-content::before {
    content: counter(h1) "${delimiter}" counter(h2) "${delimiter}" counter(h3) "${delimiter}" counter(h4) "${delimiter}" counter(h5) "${delimiter} ";
    margin-right: 0.5em;
}

body.lse-heading-numbering-display #main-content-container div.ls-block[data-refs-self*="\\"heading\\" 6"] .block-content::before {
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
 * Extract heading number from content using old delimiter
 * This function detects if a heading already has numbering and extracts it
 */
const extractOldNumber = (content: string, oldDelimiter: string): { number: string | null, textWithoutNumber: string } => {
    // Escape the delimiter for use in regex
    const escapedDelimiter = oldDelimiter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    
    // Pattern to match: "# 1.2.3 Text" or "## 1.2 Text" etc.
    // Group 1: hash marks (# or ## etc.)
    // Group 2: the number (e.g., "1.2.3")
    // Group 3: remaining text
    // The number must start with a digit and can contain delimiter+digit patterns
    const pattern = new RegExp(`^(#+)\\s+(\\d+(?:${escapedDelimiter}\\d+)*${escapedDelimiter}?)\\s+(.+)$`)
    const match = content.match(pattern)
    
    if (match) {
        const hashTags = match[1]
        let number = match[2]
        const text = match[3]
        
        // Remove trailing delimiter if present
        if (number.endsWith(oldDelimiter)) {
            number = number.slice(0, -oldDelimiter.length)
        }
        
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
 * Check if content already has a heading number (any delimiter pattern)
 * This helps prevent double-numbering
 */
const hasExistingNumber = (content: string): boolean => {
    // Match patterns like "# 1.2.3" or "## 1-2" or "### 1.1.1.1"
    // This is a more general check that doesn't require knowing the specific delimiter
    const generalPattern = /^#+\s+\d+[\d\.\-_\s→]+\s+/
    return generalPattern.test(content)
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
        
        // Get hierarchical headers
        const versionMd = booleanLogseqVersionMd()
        const hierarchicalHeaders = versionMd 
            ? getHierarchicalTocBlocks(pageBlocks as any)
            : getHierarchicalTocBlocksForDb(pageBlocks as any)
        
        // Calculate numbering and update blocks using hierarchy
        await updateHierarchicalBlocks(hierarchicalHeaders, [], newDelimiter, oldDelimiter)
    } catch (error) {
        console.error('Error applying heading numbers:', error)
    }
}


/**
 * Recursively update hierarchical blocks with numbering
 * @param headers Hierarchical headers to process
 * @param parentNumbers Array of parent numbers (e.g., [1, 2] for "1.2")
 * @param newDelimiter New delimiter to use
 * @param oldDelimiter Old delimiter to detect
 */
const updateHierarchicalBlocks = async (
    headers: HierarchicalTocBlock[],
    parentNumbers: number[],
    newDelimiter: string,
    oldDelimiter: string
): Promise<void> => {
    for (let i = 0; i < headers.length; i++) {
        const header = headers[i]
        const currentNumbers = [...parentNumbers, i + 1]
        const expectedNumber = currentNumbers.join(newDelimiter)
        
        // Extract old number if present
        const { number: oldNumber, textWithoutNumber } = extractOldNumber(header.content, oldDelimiter)
        
        // Check if update is needed
        // Only update if:
        // 1. No existing number, OR
        // 2. Existing number doesn't match expected number
        const needsUpdate = !oldNumber || oldNumber !== expectedNumber
        
        if (needsUpdate) {
            // Extract the actual heading text (without hash tags)
            const textOnly = textWithoutNumber.replace(/^#+\s+/, '')
            
            // Skip if text is empty (avoid creating invalid headings)
            if (!textOnly.trim()) {
                continue
            }
            
            // Generate new content
            const level = header.level
            const hashTags = '#'.repeat(level)
            const newContent = `${hashTags} ${expectedNumber}${newDelimiter} ${textOnly}`
            
            // Only update if content actually changed
            if (newContent !== header.content) {
                try {
                    await logseq.Editor.updateBlock(header.uuid, newContent)
                    // Update the header content in memory to prevent re-processing
                    header.content = newContent
                } catch (error) {
                    console.error(`Failed to update block ${header.uuid}:`, error)
                }
            }
        }
        
        // Recursively process children
        if (header.children && header.children.length > 0) {
            await updateHierarchicalBlocks(header.children, currentNumbers, newDelimiter, oldDelimiter)
        }
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
    
    // Cleanup mode - remove all heading numbers
    if (oldSet[settingKeys.toc.headingNumberCleanup] !== newSet[settingKeys.toc.headingNumberCleanup] &&
        newSet[settingKeys.toc.headingNumberCleanup] === true) {
        await executeCleanup()
    }
    
    // File-update mode changes
    if (oldSet[settingKeys.toc.headingNumberFileEnable] !== newSet[settingKeys.toc.headingNumberFileEnable] ||
        oldSet[settingKeys.toc.headingNumberDelimiterFile] !== newSet[settingKeys.toc.headingNumberDelimiterFile] ||
        oldSet[settingKeys.toc.headingNumberDelimiterFileOld] !== newSet[settingKeys.toc.headingNumberDelimiterFileOld]) {
        // Re-apply numbering to current page if enabled
        const currentPage = await logseq.Editor.getCurrentPage()
        if (currentPage && newSet[settingKeys.toc.headingNumberFileEnable] === true) {
            const pageName = (currentPage.originalName || currentPage.name || '') as string
            if (pageName) {
                await applyHeadingNumbersToPage(pageName)
            }
        }
    }
}

/**
 * Execute cleanup - remove all heading numbers from all files
 */
const executeCleanup = async (): Promise<void> => {
    try {
        // Show user message
        const confirmed = await logseq.UI.showMsg(
            '⚠️ Starting cleanup: Removing all heading numbers from files. This may take a moment...',
            'warning',
            { timeout: 5000 }
        )
        
        console.log('Starting heading number cleanup...')
        
        // Get delimiter settings to detect existing numbers
        const oldDelimiter = (logseq.settings?.[settingKeys.toc.headingNumberDelimiterFileOld] as string) || '.'
        
        // Get all pages in the graph
        const allPages = await logseq.Editor.getAllPages()
        if (!allPages || allPages.length === 0) {
            await logseq.UI.showMsg('No pages found to clean up', 'info')
            await resetCleanupFlag()
            return
        }
        
        let totalCleaned = 0
        let pagesProcessed = 0
        
        // Process each page
        for (const page of allPages) {
            try {
                const pageName = page.originalName || page.name
                if (!pageName) continue
                
                const cleaned = await cleanupPageHeadingNumbers(pageName, oldDelimiter)
                totalCleaned += cleaned
                pagesProcessed++
                
                // Show progress every 10 pages
                if (pagesProcessed % 10 === 0) {
                    console.log(`Cleanup progress: ${pagesProcessed}/${allPages.length} pages`)
                }
            } catch (error) {
                console.error(`Error cleaning page ${page.name}:`, error)
            }
        }
        
        // Show completion message
        await logseq.UI.showMsg(
            `✓ Cleanup complete! Removed ${totalCleaned} heading numbers from ${pagesProcessed} pages.`,
            'success',
            { timeout: 5000 }
        )
        
        console.log(`Cleanup complete: ${totalCleaned} numbers removed from ${pagesProcessed} pages`)
        
    } catch (error) {
        console.error('Error during cleanup:', error)
        await logseq.UI.showMsg(`Error during cleanup: ${error}`, 'error')
    } finally {
        // Always reset the cleanup flag
        await resetCleanupFlag()
    }
}

/**
 * Reset the cleanup flag to false
 */
const resetCleanupFlag = async (): Promise<void> => {
    await logseq.updateSettings({
        [settingKeys.toc.headingNumberCleanup]: false
    })
}

/**
 * Clean up heading numbers from a single page
 * Returns the number of blocks cleaned
 */
const cleanupPageHeadingNumbers = async (pageName: string, oldDelimiter: string): Promise<number> => {
    try {
        // Get all blocks from the page
        const pageBlocks = await logseq.Editor.getPageBlocksTree(pageName)
        if (!pageBlocks) return 0
        
        // Get hierarchical headers
        const versionMd = booleanLogseqVersionMd()
        const hierarchicalHeaders = versionMd 
            ? getHierarchicalTocBlocks(pageBlocks as any)
            : getHierarchicalTocBlocksForDb(pageBlocks as any)
        
        // Remove numbering from all headers
        let cleanedCount = 0
        const removeFromHeaders = async (headers: HierarchicalTocBlock[]) => {
            for (const header of headers) {
                // Extract old number if present
                const { number: oldNumber, textWithoutNumber } = extractOldNumber(header.content, oldDelimiter)
                
                if (oldNumber) {
                    // Has a number, remove it
                    const textOnly = textWithoutNumber.replace(/^#+\s+/, '')
                    if (textOnly.trim()) {
                        const level = header.level
                        const hashTags = '#'.repeat(level)
                        const newContent = `${hashTags} ${textOnly}`
                        
                        if (newContent !== header.content) {
                            try {
                                await logseq.Editor.updateBlock(header.uuid, newContent)
                                cleanedCount++
                            } catch (error) {
                                console.error(`Failed to clean block ${header.uuid}:`, error)
                            }
                        }
                    }
                }
                
                // Recursively process children
                if (header.children && header.children.length > 0) {
                    await removeFromHeaders(header.children)
                }
            }
        }
        
        await removeFromHeaders(hierarchicalHeaders)
        return cleanedCount
    } catch (error) {
        console.error(`Error cleaning page ${pageName}:`, error)
        return 0
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
