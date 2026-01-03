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

// Top-level regular expressions and helpers
const HEADING_HASHES_GENERIC = /^#+\s+/
const HEADING_HASHES_PATTERN = /^#{1,6}\s+/
const HEADING_HASHES_ONLY_PATTERN = /^#{1,6}/
const GENERAL_NUMBER_PATTERN = /^#{1,6}\s+\d+[\d\.\-_\s→]+\s+/
const MULTI_NUMBER_PATTERN = /^(#{1,6})\s+(?:\d+[\d\.\-_\s→]*)+\s+(.+)$/

const escapeForRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const createExtractOldNumberRegex = (oldDelimiter: string) => {
    const escapedDelimiter = escapeForRegex(oldDelimiter)
    return new RegExp(`^(#{1,6})\\s+(\\d+(?:${escapedDelimiter}\\d+)*${escapedDelimiter}?)\\s+(.+)$`)
}

// Normalize numeric string to use the given delimiter and collapse extras
const normalizeNumberString = (num: string, delimiter: string) => {
    if (!num) return ''
    // Replace any non-digit sequence with the delimiter
    const replaced = num.trim().replace(/[^0-9]+/g, delimiter)
    // Collapse multiple delimiters
    const collapse = replaced.replace(new RegExp(`${escapeForRegex(delimiter)}{2,}`, 'g'), delimiter)
    // Remove leading/trailing delimiters
    return collapse.replace(new RegExp(`^${escapeForRegex(delimiter)}|${escapeForRegex(delimiter)}$`, 'g'), '')
}

// Extract a general number sequence after hashes when delimiter-specific extract fails
const extractGeneralNumber = (content: string): string | null => {
    const m = content.match(/^(?:#{1,6})\s+([0-9][0-9\.\-\_\s→]*)/) 
    return m ? m[1].trim() : null
}

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
    // Pattern to match: "# 1.2.3 Text" or "## 1.2 Text" or "### 3.1 Text" etc.
    // Use helper to create regex with escaped delimiter
    const pattern = createExtractOldNumberRegex(oldDelimiter)
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
    return GENERAL_NUMBER_PATTERN.test(content)
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
    // Use level-indexed counters to reliably number headers across siblings
    const counters = new Array(7).fill(0) // 1..6

    const traverse = async (nodes: HierarchicalTocBlock[]) => {
        for (const node of nodes) {
            const level = node.level || 1

            // Increment counter for this level and reset deeper levels
            counters[level] = (counters[level] || 0) + 1
            for (let l = level + 1; l <= 6; l++) counters[l] = 0

            // Build current numbers from counters (1..level)
            const currentNumbers: number[] = []
            for (let l = 1; l <= level; l++) {
                if (counters[l] && counters[l] > 0) currentNumbers.push(counters[l])
            }

            const expectedNumber = currentNumbers.join(newDelimiter)

            // Extract old number if present (delimiter-specific)
            let { number: oldNumber, textWithoutNumber } = extractOldNumber(node.content, oldDelimiter)

            // If delimiter-specific extract failed but there is some number-like prefix, try to extract generally
            if (!oldNumber && hasExistingNumber(node.content)) {
                const mm = node.content.match(MULTI_NUMBER_PATTERN)
                if (mm) {
                    const hashTags = mm[1]
                    const restText = mm[2]
                    // Attempt to extract the numeric part between hashes and restText
                    const numPartMatch = node.content.match(new RegExp(`^${escapeForRegex(hashTags)}\\s+([0-9\\.\\-\\_\\s→]+)\\s+`))
                    const numPart = numPartMatch ? numPartMatch[1].trim() : null
                    if (numPart) {
                        oldNumber = numPart
                        textWithoutNumber = `${hashTags} ${restText}`
                    }
                }
                // Fallback: try a simple extraction
                if (!oldNumber) {
                    const gen = extractGeneralNumber(node.content)
                    if (gen) {
                        oldNumber = gen
                        textWithoutNumber = node.content.replace(new RegExp(`^(#{1,6})\\s+${escapeForRegex(gen)}\\s+`), '$1 ')
                    }
                }
            }

            // Normalize numbers for comparison (handle different delimiters/spaces)
            const normalizedExpected = normalizeNumberString(expectedNumber, newDelimiter)
            const normalizedOld = oldNumber ? normalizeNumberString(oldNumber, newDelimiter) : null

            let needsUpdate = false
            if (!oldNumber) {
                // No existing number -> needs numbering
                needsUpdate = true
            } else if (normalizedOld !== normalizedExpected) {
                // Existing number present but differs when normalized -> update
                needsUpdate = true
            }

            if (needsUpdate) {
                const textOnly = textWithoutNumber.replace(HEADING_HASHES_GENERIC, '')
                if (textOnly.trim()) {
                    const hashTags = '#'.repeat(level)
                    const newContent = `${hashTags} ${expectedNumber}${newDelimiter} ${textOnly}`
                    if (newContent !== node.content) {
                        try {
                            await logseq.Editor.updateBlock(node.uuid, newContent)
                            node.content = newContent
                        } catch (error) {
                            console.error(`Failed to update block ${node.uuid}:`, error)
                        }
                    }
                }
            }

            if (node.children && node.children.length > 0) {
                await traverse(node.children)
            }
        }
    }

    await traverse(headers)
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
        // Get the currently open page
        const currentPage = await logseq.Editor.getCurrentPage()
        if (!currentPage) {
            await logseq.UI.showMsg('⚠️ Please open a page to clean up heading numbers', 'warning')
            await resetCleanupFlag()
            return
        }
        
        const currentPageName = currentPage.originalName || currentPage.name
        if (typeof currentPageName !== 'string' || !currentPageName) {
            await logseq.UI.showMsg('⚠️ Could not determine current page name', 'warning')
            await resetCleanupFlag()
            return
        }
        
        const pageName = currentPageName
        
        // Show user message
        await logseq.UI.showMsg(
            `⚠️ Starting cleanup: Removing heading numbers from "${pageName}"...`,
            'warning',
            { timeout: 3000 }
        )
        
        console.log(`Starting heading number cleanup for page: ${pageName}`)
        
        // Get delimiter settings to detect existing numbers
        const delimiterSetting = logseq.settings?.[settingKeys.toc.headingNumberDelimiterFileOld]
        const oldDelimiter: string = typeof delimiterSetting === 'string' ? delimiterSetting : '.'
        
        // Clean the current page
        const totalCleaned = await cleanupPageHeadingNumbers(pageName, oldDelimiter)
        
        // Show completion message
        if (totalCleaned > 0) {
            await logseq.UI.showMsg(
                `✓ Cleanup complete! Removed ${totalCleaned} heading number(s) from "${pageName}".`,
                'success',
                { timeout: 5000 }
            )
            console.log(`Cleanup complete: ${totalCleaned} numbers removed from "${pageName}"`)
        } else {
            await logseq.UI.showMsg(
                `No heading numbers found to clean on "${pageName}".`,
                'info',
                { timeout: 3000 }
            )
            console.log(`No heading numbers found on "${pageName}"`)
        }
        
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
                // Try to extract old number using delimiter
                const { number: oldNumber, textWithoutNumber } = extractOldNumber(header.content, oldDelimiter)
                
                // Also handle cases with multiple/duplicate numbers or corrupted numbering
                // This regex matches heading patterns with any number-like prefix
                // Handles cases like:
                // - "# 1.1 1.1 Text" (duplicate numbers)
                // - "## 1.2.3.4.5 Text" (excessive nesting)
                // - "### 1 2 3 Text" (space-separated)
                // - "### 3.3. 3.3. 3.3. M3" (repeated sequences)
                // Pattern explanation:
                // - (#{1,6}) captures heading markers
                // - \s+ matches whitespace
                // - (?:\d+[\d\.\-\_\s→]*)+\s+ matches one or more number sequences with delimiters/spaces
                // - (.+) captures the actual text content
                const multiMatch = header.content.match(MULTI_NUMBER_PATTERN)
                
                let shouldClean = false
                let cleanedText = ''
                let hashTags = ''
                
                if (oldNumber) {
                    // Has a number detected by delimiter pattern
                    shouldClean = true
                    const textOnly = textWithoutNumber.replace(HEADING_HASHES_PATTERN, '')
                    hashTags = textWithoutNumber.match(HEADING_HASHES_ONLY_PATTERN)?.[0] || ''
                    cleanedText = textOnly
                } else if (multiMatch) {
                    // Has multiple/duplicate numbers or corrupted numbering
                    shouldClean = true
                    hashTags = multiMatch[1]
                    cleanedText = multiMatch[2]
                }
                
                if (shouldClean && cleanedText.trim()) {
                    const level = header.level
                    const newHashTags = hashTags || '#'.repeat(level)
                    const newContent = `${newHashTags} ${cleanedText}`
                    
                    if (newContent !== header.content) {
                        try {
                            await logseq.Editor.updateBlock(header.uuid, newContent)
                            cleanedCount++
                        } catch (error) {
                            console.error(`Failed to clean block ${header.uuid}:`, error)
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
