import { isHeader, getHeaderLevel } from "./regex"
import { Child, TocBlock } from "./pageHeaders"


/**
 * Extended TocBlock with hierarchical information
 */
export interface HierarchicalTocBlock extends TocBlock {
  level: number  // Heading level (1-6)
  children?: HierarchicalTocBlock[]  // Child headings
  parent?: HierarchicalTocBlock  // Parent heading (for traversal)
}


// md系統のバージョン用
// ヘッダーを取得する関数
export const getTocBlocks = (childrenArr: Child[]): TocBlock[] => {
  return findHeaders(childrenArr, (child) => isHeader(child.content, child as TocBlock, true))
}


// dbバージョン用
// ヘッダーを取得する関数
export const getTocBlocksForDb = (childrenArr: Child[]): TocBlock[] => {
  return findHeaders(childrenArr, (child) => child[":logseq.property/heading"] === 1 ||
    child[":logseq.property/heading"] === 2 ||
    child[":logseq.property/heading"] === 3 ||
    child[":logseq.property/heading"] === 4 ||
    child[":logseq.property/heading"] === 5 ||
    child[":logseq.property/heading"] === 6
  )
}


/**
 * Get headers with hierarchical structure preserved
 * md系統のバージョン用
 */
export const getHierarchicalTocBlocks = (childrenArr: Child[]): HierarchicalTocBlock[] => {
  return buildHierarchicalHeaders(
    childrenArr,
    (child) => isHeader(child.content, child as TocBlock, true),
    (child) => getHeaderLevel(child.content)
  )
}


/**
 * Get headers with hierarchical structure preserved
 * dbバージョン用
 */
export const getHierarchicalTocBlocksForDb = (childrenArr: Child[]): HierarchicalTocBlock[] => {
  return buildHierarchicalHeaders(
    childrenArr,
    (child) => (child[":logseq.property/heading"] || 0) >= 1 && (child[":logseq.property/heading"] || 0) <= 6,
    (child) => child[":logseq.property/heading"] as number || 0
  )
}


/**
 * Generalized function to extract headers from a list of children.
 * Returns flat list (backward compatibility)
 */
const findHeaders = (childrenArr: Child[], isHeaderFn: (child: Child) => boolean): TocBlock[] => {
  let tocBlocks: TocBlock[] = []

  const findAllHeaders = (childrenArr: Child[]) => {
    if (!childrenArr) return
    for (let child of childrenArr) {
      if (isHeaderFn(child)) {
        tocBlocks.push({
          content: child.content,
          uuid: child.uuid,
          properties: child.properties,
          [":logseq.property/heading"]: child[":logseq.property/heading"],
        })
      }
      if (child.children) findAllHeaders(child.children)
    }
  }

  findAllHeaders(childrenArr)
  return tocBlocks
}


/**
 * Build hierarchical header structure based on heading levels
 * This creates a proper tree where headings are nested based on their level
 */
const buildHierarchicalHeaders = (
  childrenArr: Child[],
  isHeaderFn: (child: Child) => boolean,
  getLevelFn: (child: Child) => number
): HierarchicalTocBlock[] => {
  const rootHeaders: HierarchicalTocBlock[] = []
  const stack: HierarchicalTocBlock[] = []  // Stack to track current hierarchy path

  const processHeaders = (childrenArr: Child[]) => {
    if (!childrenArr) return

    for (let child of childrenArr) {
      if (isHeaderFn(child)) {
        const level = getLevelFn(child)
        
        const headerBlock: HierarchicalTocBlock = {
          content: child.content,
          uuid: child.uuid,
          properties: child.properties,
          [":logseq.property/heading"]: child[":logseq.property/heading"],
          level,
          children: []
        }

        // Find the appropriate parent based on level
        // Pop from stack until we find a parent with lower level
        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
          stack.pop()
        }

        if (stack.length === 0) {
          // This is a root-level header
          rootHeaders.push(headerBlock)
        } else {
          // This is a child of the last header in stack
          const parent = stack[stack.length - 1]
          headerBlock.parent = parent
          if (!parent.children) {
            parent.children = []
          }
          parent.children.push(headerBlock)
        }

        // Add this header to the stack
        stack.push(headerBlock)
      }

      // Process children blocks recursively
      if (child.children) {
        processHeaders(child.children)
      }
    }
  }

  processHeaders(childrenArr)
  return rootHeaders
}


/**
 * Flatten hierarchical headers to a simple list (for backward compatibility)
 */
export const flattenHierarchicalHeaders = (hierarchicalHeaders: HierarchicalTocBlock[]): TocBlock[] => {
  const flat: TocBlock[] = []
  
  const flatten = (headers: HierarchicalTocBlock[]) => {
    for (const header of headers) {
      flat.push({
        content: header.content,
        uuid: header.uuid,
        properties: header.properties,
        [":logseq.property/heading"]: header[":logseq.property/heading"],
      })
      if (header.children && header.children.length > 0) {
        flatten(header.children)
      }
    }
  }
  
  flatten(hierarchicalHeaders)
  return flat
}
