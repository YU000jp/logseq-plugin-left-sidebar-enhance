/**
 * Heading numbering module
 * Provides hierarchical heading numbering with display-only and file-update modes
 */

import { booleanLogseqVersionMd } from '..'
import { getHierarchicalTocBlocks, getHierarchicalTocBlocksForDb, HierarchicalTocBlock } from '../page-outline/findHeaders'
import { settingKeys } from '../settings/keys'

let isFileBasedGraph = false

// Top-level regular expressions and helpers
const HEADING_HASHES_GENERIC = /^#+\s+/
const HEADING_HASHES_PATTERN = /^#{1,6}\s+/
const HEADING_HASHES_ONLY_PATTERN = /^#{1,6}/
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
    // display-only numbering and level marks removed
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

// display-only numbering and related CSS removed

/**
 * Check if page should have heading numbering features applied
 */
export const isPageActive = (pageName: string): boolean => {
    const storageMode = logseq.settings?.[settingKeys.toc.pageStateStorageMode] as string || 'storeTrueOnly'
    const pageStates = logseq.settings?.[settingKeys.toc.pageStates] as Record<string, boolean> || {}

    console.log('Checking if page is active:', pageName, 'Storage mode:', storageMode, 'Page states:', pageStates)

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
export const togglePageState = async (pageName: string): Promise<{ newState: boolean; hadEntry: boolean }> => {

    const pageStates = logseq.settings?.[settingKeys.toc.pageStates] as Record<string, boolean> || {}

    const currentState = isPageActive(pageName)
    const newState = !currentState

    const storageMode = logseq.settings?.[settingKeys.toc.pageStateStorageMode] as string || 'storeTrueOnly'
    if (storageMode === 'storeTrueOnly') {
        if (newState) {
            pageStates[pageName] = true
        } else {
            delete pageStates[pageName]
            await executeCleanup()
        }
    } else {
        // storeFalseOnly
        if (newState) {
            delete pageStates[pageName]
        } else {
            pageStates[pageName] = false
            await executeCleanup()
        }
    }
    logseq.updateSettings({
        [settingKeys.toc.pageStates]: null
    })
    // Debugging logs
    setTimeout(() => {
        logseq.updateSettings({
            [settingKeys.toc.pageStates]: pageStates
        })
    }, 100)
    const hadEntry = Object.prototype.hasOwnProperty.call(pageStates, pageName)
    return { newState, hadEntry }
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

// display-only DOM numbering removed


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

            // Work only on the first line of the block (preserve properties in later lines)
            const fullContent = node.content || ''
            const lines = fullContent.split(/\r?\n/)
            const firstLine = lines.length > 0 ? lines[0] : ''

            // Extract old number from the first line if present (delimiter-specific)
            let { number: oldNumber, textWithoutNumber } = extractOldNumber(firstLine, oldDelimiter)

            // If delimiter-specific extract failed, always try to extract number-like prefixes from first line
            if (!oldNumber) {
                const mm = firstLine.match(MULTI_NUMBER_PATTERN)
                if (mm) {
                    const hashTags = mm[1]
                    const restText = mm[2]
                    // Attempt to extract the numeric part between hashes and restText
                    const numPartMatch = firstLine.match(new RegExp(`^${escapeForRegex(hashTags)}\\s+([0-9\\.\\-\\_\\s→]+)\\s+`))
                    const numPart = numPartMatch ? numPartMatch[1].trim() : null
                    if (numPart) {
                        oldNumber = numPart
                        textWithoutNumber = `${hashTags} ${restText}`
                    }
                }
                // Fallback: try a simple extraction on first line
                if (!oldNumber) {
                    const gen = extractGeneralNumber(firstLine)
                    if (gen) {
                        oldNumber = gen
                        textWithoutNumber = firstLine.replace(new RegExp(`^(#{1,6})\\s+${escapeForRegex(gen)}\\s+`), '$1 ')
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
                    const newFirstLine = `${hashTags} ${expectedNumber}${newDelimiter} ${textOnly}`
                    // Reconstruct full content: replace only first line, keep remaining lines (properties etc.)
                    const newFullContent = [newFirstLine, ...lines.slice(1)].join('\n')
                    if (newFullContent !== fullContent) {
                        try {
                            await logseq.Editor.updateBlock(node.uuid, newFullContent)
                            node.content = newFullContent
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
export const handleHeadingNumberingSettingsChanged = async (newSet: any, oldSet: any): Promise<boolean> => {
    // display-only numbering and heading level marks removed

    // Cleanup mode - remove all heading numbers
    if (oldSet[settingKeys.toc.headingNumberCleanup] !== newSet[settingKeys.toc.headingNumberCleanup] &&
        newSet[settingKeys.toc.headingNumberCleanup] === true) {
        await executeCleanup()
    }

    // File-update mode changes
    if (oldSet[settingKeys.toc.headingNumberFileEnable] !== newSet[settingKeys.toc.headingNumberFileEnable] ||
        oldSet[settingKeys.toc.headingNumberDelimiterFile] !== newSet[settingKeys.toc.headingNumberDelimiterFile] ||
        oldSet[settingKeys.toc.headingNumberDelimiterFileOld] !== newSet[settingKeys.toc.headingNumberDelimiterFileOld]) {
        // Re-apply  numbering to current page if enabled
        const currentPage = await logseq.Editor.getCurrentPage()
        if (currentPage && newSet[settingKeys.toc.headingNumberFileEnable] === true) {
            const pageName = (currentPage.originalName || currentPage.name || '') as string
            if (pageName) {
                await applyHeadingNumbersToPage(pageName)
            }
        }
    }
    if (oldSet[settingKeys.toc.headingNumberFileEnable] !== newSet[settingKeys.toc.headingNumberFileEnable])
        return true
    return false
}

/**
 * Execute cleanup - remove all heading numbers from the current page
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
    logseq.updateSettings({
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
                // Work on the first line only and preserve remaining lines
                const fullContent = header.content || ''
                const lines = fullContent.split(/\r?\n/)
                const firstLine = lines.length > 0 ? lines[0] : ''

                // Try to extract old number using delimiter from first line
                const { number: oldNumber, textWithoutNumber } = extractOldNumber(firstLine, oldDelimiter)

                // Also handle cases with multiple/duplicate numbers or corrupted numbering on first line
                const multiMatch = firstLine.match(MULTI_NUMBER_PATTERN)

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
                    const newFirstLine = `${newHashTags} ${cleanedText}`
                    const newContent = [newFirstLine, ...lines.slice(1)].join('\n')

                    if (newContent !== fullContent) {
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
