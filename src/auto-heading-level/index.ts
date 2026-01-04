/**
 * Auto-adjust Markdown heading levels based on outline depth
 * 
 * This module provides automatic normalization of Markdown heading levels (#-######)
 * based on the actual outline depth in the document structure.
 */

import { booleanLogseqVersionMd } from '..'
import { getHierarchicalTocBlocks, getHierarchicalTocBlocksForDb, HierarchicalTocBlock } from '../page-outline/findHeaders'
import { settingKeys } from '../settings/keys'

/**
 * Preset configurations for heading level ranges
 */
export type HeadingLevelPreset = 'h2-h6' | 'h1-h3' | 'h2-h4'

export interface HeadingLevelRange {
  min: number  // Minimum heading level (1-6)
  max: number  // Maximum heading level (1-6)
}

/**
 * Get heading level range from preset
 */
const getPresetRange = (preset: HeadingLevelPreset): HeadingLevelRange => {
  switch (preset) {
    case 'h1-h3':
      return { min: 1, max: 3 }
    case 'h2-h4':
      return { min: 2, max: 4 }
    case 'h2-h6':
    default:
      return { min: 2, max: 6 }
  }
}

/**
 * Calculate heading level based on depth
 * Formula: level = clamp(minLevel + depth - 1, minLevel, maxLevel)
 */
const calculateHeadingLevel = (depth: number, range: HeadingLevelRange): number => {
  const level = range.min + depth - 1
  return Math.max(range.min, Math.min(level, range.max))
}

/**
 * Extract heading hashes and content from a block
 */
const extractHeading = (content: string): { hashes: string; text: string } | null => {
  const match = content.match(/^(#{1,6})\s+(.+)$/m)
  if (!match) return null
  return {
    hashes: match[1],
    text: match[2]
  }
}

/**
 * Normalize heading level for a single block
 */
const normalizeBlockHeading = async (
  block: HierarchicalTocBlock,
  depth: number,
  range: HeadingLevelRange,
  reserveH1: boolean
): Promise<boolean> => {
  const fullContent = block.content || ''
  const lines = fullContent.split(/\r?\n/)
  const firstLine = lines[0] || ''

  const heading = extractHeading(firstLine)
  if (!heading) return false

  // Calculate target level
  let targetLevel = calculateHeadingLevel(depth, range)
  
  // If H1 is reserved for page title, don't use it in content
  if (reserveH1 && targetLevel === 1) {
    targetLevel = 2
  }

  const currentLevel = heading.hashes.length

  // Only update if level changed
  if (currentLevel === targetLevel) return false

  const newHashes = '#'.repeat(targetLevel)
  const newFirstLine = `${newHashes} ${heading.text}`
  const newContent = [newFirstLine, ...lines.slice(1)].join('\n')

  try {
    await logseq.Editor.updateBlock(block.uuid, newContent)
    return true
  } catch (error) {
    console.error(`Failed to normalize block ${block.uuid}:`, error)
    return false
  }
}

/**
 * Recursively normalize headings in hierarchical structure
 */
const normalizeHierarchicalHeadings = async (
  headers: HierarchicalTocBlock[],
  depth: number,
  range: HeadingLevelRange,
  reserveH1: boolean
): Promise<number> => {
  let count = 0

  for (const header of headers) {
    // Normalize current header
    const updated = await normalizeBlockHeading(header, depth, range, reserveH1)
    if (updated) count++

    // Recursively normalize children
    if (header.children && header.children.length > 0) {
      count += await normalizeHierarchicalHeadings(header.children, depth + 1, range, reserveH1)
    }
  }

  return count
}

/**
 * Normalize headings for entire page
 */
export const normalizePageHeadings = async (pageName: string): Promise<number> => {
  // Check if feature is enabled
  if (logseq.settings?.[settingKeys.toc.autoHeadingLevelEnabled] !== true) {
    await logseq.UI.showMsg('⚠️ Auto heading level adjustment is not enabled', 'warning')
    return 0
  }

  // Get settings
  const preset = (logseq.settings?.[settingKeys.toc.autoHeadingLevelPreset] as HeadingLevelPreset) || 'h2-h6'
  const reserveH1 = logseq.settings?.[settingKeys.toc.autoHeadingLevelReserveH1] === true
  const range = getPresetRange(preset)

  try {
    // Get page blocks
    const pageBlocks = await logseq.Editor.getPageBlocksTree(pageName)
    if (!pageBlocks || pageBlocks.length === 0) {
      await logseq.UI.showMsg('No blocks found on page', 'info')
      return 0
    }

    // Get hierarchical headers
    const versionMd = booleanLogseqVersionMd()
    const hierarchicalHeaders = versionMd
      ? getHierarchicalTocBlocks(pageBlocks as any)
      : getHierarchicalTocBlocksForDb(pageBlocks as any)

    if (hierarchicalHeaders.length === 0) {
      await logseq.UI.showMsg('No headings found on page', 'info')
      return 0
    }

    // Normalize all headings
    const count = await normalizeHierarchicalHeadings(hierarchicalHeaders, 1, range, reserveH1)

    if (count > 0) {
      await logseq.UI.showMsg(
        `✓ Normalized ${count} heading(s) on "${pageName}"`,
        'success',
        { timeout: 3000 }
      )
    } else {
      await logseq.UI.showMsg(
        `All headings on "${pageName}" are already normalized`,
        'info',
        { timeout: 3000 }
      )
    }

    return count
  } catch (error) {
    console.error('Error normalizing page headings:', error)
    await logseq.UI.showMsg(`Error normalizing headings: ${error}`, 'error')
    return 0
  }
}

/**
 * Normalize headings for selected blocks
 */
export const normalizeSelectionHeadings = async (): Promise<number> => {
  // Check if feature is enabled
  if (logseq.settings?.[settingKeys.toc.autoHeadingLevelEnabled] !== true) {
    await logseq.UI.showMsg('⚠️ Auto heading level adjustment is not enabled', 'warning')
    return 0
  }

  // Get settings
  const preset = (logseq.settings?.[settingKeys.toc.autoHeadingLevelPreset] as HeadingLevelPreset) || 'h2-h6'
  const reserveH1 = logseq.settings?.[settingKeys.toc.autoHeadingLevelReserveH1] === true
  const range = getPresetRange(preset)

  try {
    // Get current block
    const currentBlock = await logseq.Editor.getCurrentBlock()
    if (!currentBlock) {
      await logseq.UI.showMsg('⚠️ No block selected', 'warning')
      return 0
    }

    // Get full block tree
    const blockTree = await logseq.Editor.getBlock(currentBlock.uuid, { includeChildren: true })
    if (!blockTree) {
      await logseq.UI.showMsg('⚠️ Could not load block tree', 'warning')
      return 0
    }

    // Convert to array for processing
    const blocks = [blockTree] as any[]

    // Get hierarchical headers from selection
    const versionMd = booleanLogseqVersionMd()
    const hierarchicalHeaders = versionMd
      ? getHierarchicalTocBlocks(blocks)
      : getHierarchicalTocBlocksForDb(blocks)

    if (hierarchicalHeaders.length === 0) {
      await logseq.UI.showMsg('No headings found in selection', 'info')
      return 0
    }

    // Normalize selected headings
    const count = await normalizeHierarchicalHeadings(hierarchicalHeaders, 1, range, reserveH1)

    if (count > 0) {
      await logseq.UI.showMsg(
        `✓ Normalized ${count} heading(s) in selection`,
        'success',
        { timeout: 3000 }
      )
    } else {
      await logseq.UI.showMsg(
        `All headings in selection are already normalized`,
        'info',
        { timeout: 3000 }
      )
    }

    return count
  } catch (error) {
    console.error('Error normalizing selection headings:', error)
    await logseq.UI.showMsg(`Error normalizing headings: ${error}`, 'error')
    return 0
  }
}

/**
 * Register commands for heading normalization
 */
export const registerAutoHeadingLevelCommands = () => {
  // Command: Normalize current page
  logseq.App.registerCommandPalette({
    key: 'normalize-page-headings',
    label: 'Normalize headings on current page',
  }, async () => {
    const currentPage = await logseq.Editor.getCurrentPage()
    if (currentPage) {
      const pageName = (currentPage.originalName || currentPage.name) as string
      await normalizePageHeadings(pageName)
    } else {
      await logseq.UI.showMsg('⚠️ No page is currently open', 'warning')
    }
  })

  // Command: Normalize selection
  logseq.App.registerCommandPalette({
    key: 'normalize-selection-headings',
    label: 'Normalize headings in selection',
  }, async () => {
    await normalizeSelectionHeadings()
  })
}

/**
 * Initialize auto heading level feature
 */
export const initAutoHeadingLevel = () => {
  // Register commands
  registerAutoHeadingLevelCommands()
}
