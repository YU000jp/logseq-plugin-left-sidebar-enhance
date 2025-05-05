import { isHeader } from "./regex"
import { Child, TocBlock } from "./headerList"


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
 * Generalized function to extract headers from a list of children.
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
