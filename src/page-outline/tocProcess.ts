import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user"

import { booleanLogseqVersionMd, onBlockChanged, onBlockChangedOnce } from ".."

import { isHeadersCacheEqual, setCachedHeaders } from "../cache/tocCache"
import { scrollToWithOffset } from "../util/domUtils"
import { generatePageButton } from "./DOM"
import { expandAndScrollToBlock } from "./collapsed-block"
import { getTocBlocks, getTocBlocksForDb } from "./findHeaders"
import { loadEmbedContents } from "./loadEmbedContents"
import { generateHeaderElement, getHeaderLevel, isHeader, processText } from "./regex"
import { clearTOC } from "./toc"
import { additionalButtons } from "./toggleHeader"
import { clearZoomMarks, updateZoomMark, whenZoom } from "./zoom"


export const keyToolbarHeaderSpace = "lse-toc-header-space"
export const keyToggleTableId = "thfpc--toggleHeader"
export const keyToggleH = "tabbedHeadersToggleH"
export const keyToggleH1 = keyToggleH + "1"
export const keyToggleH2 = keyToggleH + "2"
export const keyToggleH3 = keyToggleH + "3"
export const keyToggleH4 = keyToggleH + "4"
export const keyToggleH5 = keyToggleH + "5"
export const keyToggleH6 = keyToggleH + "6"

export interface TocBlock {
  content: string
  uuid: string
  properties?: { [key: string]: string[] | string }
  [":logseq.property/heading"]?: number
}


export interface Child {
  content: string
  uuid: string
  properties?: { [key: string]: string[] | string }
  children?: Child[]
}



const headersList = async (
  targetElement: HTMLElement,
  tocBlocks: TocBlock[],
  thisPageName: string,
  versionMd: boolean,
  zoom?: { zoomIn: boolean; zoomInUuid: BlockEntity["uuid"] }
): Promise<void> => {
  clearZoomMarks()

  // キャッシュと比較
  if (isHeadersCacheEqual(tocBlocks)) {
    updateZoomMark(zoom, targetElement)
    return // DOM更新をスキップ
  }

  setCachedHeaders(tocBlocks)

  // DOMをクリア
  targetElement.innerHTML = ""

  // additional buttons
  targetElement.append(additionalButtons(thisPageName))

  // ページコンテンツのヘッダーにカーソルを合わせた時に、CSSでヘッダーリストのUUIDが一致する、該当する項目をハイライトする
  let css = ""

  // Create list
  for (const tocBlock of tocBlocks) {
    if (isHeader(tocBlock.content, tocBlock, versionMd)) {
      // ヘッダー要素を生成
      const element = createHeaderElement(tocBlock.content, tocBlock, versionMd, thisPageName, zoom)
      targetElement.append(element)
    }
  }

  // CSSを追加する処理
  if (css !== "") {
    // <style>要素を作成し、#lse-toc-contentに追加する
    const styleElement = document.createElement("style")
    styleElement.innerHTML = css
    targetElement.appendChild(styleElement)
  }
}


const selectBlock = async (shiftKey: boolean, ctrlKey: boolean, pageName: string, blockUuid: string) => {
  await logseq.Editor.setBlockCollapsed(blockUuid, false)
  if (shiftKey) {
    logseq.Editor.openInRightSidebar(blockUuid)
  } else
    if (ctrlKey || logseq.settings!.booleanAsZoomPage === true) {
      logseq.App.pushState("page", { name: blockUuid }) // Uuidをページ名としてpushStateするとズームページが開く
      if (logseq.settings!.booleanAsZoomPage === false)
        logseq.UI.showMsg("Block Zoomed!", "info", { timeout: 1000 })
    } else {

      await logseq.Editor.selectBlock(blockUuid)
      const elem = parent.document.getElementById('block-content-' + blockUuid) as HTMLDivElement | null
      if (elem) {
        logseq.Editor.exitEditingMode()
        scrollToWithOffset(elem)
        return
      }

      if (logseq.settings!.booleanAsZoomPage === true) {
        await expandAndScrollToBlock(blockUuid, true)
        return
      }
      await whenZoom(pageName, blockUuid)
    }
}



export const displayToc = async (pageName: string, zoom?: { zoomIn: boolean, zoomInUuid: BlockEntity["uuid"] }) => {
  const element = parent.document.getElementById("lse-toc-content") as HTMLDivElement | null
  if (element) {
    // element.innerHTML = "" //elementが存在する場合は中身を削除する

    if (logseq.settings!.booleanAsZoomPage === true) //ページ名を表示
      generatePageButton(element)

    const versionMd = booleanLogseqVersionMd()
    const blocks = await logseq.Editor.getPageBlocksTree(pageName) as Child[]
    //ページの全ブロックからheaderがあるかどうかを確認する
    let headers: TocBlock[]
    let versionDbMdGraphFlag = false
    if (versionMd === true)
      headers = getTocBlocks(blocks)
    else {
      const dbGraph = getTocBlocksForDb(blocks)
      if (dbGraph.length > 0)
        headers = dbGraph
      else {
        headers = getTocBlocks(blocks)
        versionDbMdGraphFlag = true
      }
    }

    if ((versionMd === true
      || versionDbMdGraphFlag === true)
      && headers.length > 0)
      //headersのcontentに、#や##などのヘッダー記法が含まれているデータのみ処理をする
      headers = headers.filter((block) => {
        const headerLevel = getHeaderLevel(block.content)
        return headerLevel > 0 && headerLevel <= 6
      })

    //フィルター後
    if (headers.length > 0) {
      await headersList(element, headers as TocBlock[], pageName, versionMd, zoom ? zoom : undefined)
      //toc更新用のイベントを登録する
      if (onBlockChangedOnce === false)
        onBlockChanged()
    } else
      clearTOC()
  }
}



const headerItemLink = (tocBlocks: TocBlock[], i: number, element: HTMLElement) => {
  const selector = `#main-content-container div.page div.blocks-container div.ls-block[level][blockid="${tocBlocks[i].uuid}"]`

  const addHoverListeners = () => {
    const pageHeader = parent.document.querySelector(selector) as HTMLElement | null
    if (logseq.settings!.highlightBlockOnHover === true && pageHeader) {
      element.addEventListener("mouseover", () => {
        pageHeader.style.outline = "6px solid var(--ls-block-highlight-color)"
        pageHeader.style.outlineOffset = "6px"
      })
      element.addEventListener("mouseout", () => {
        pageHeader.style.outline = "unset"
        pageHeader.style.outlineOffset = "unset"
      })
    }

    if (logseq.settings!.highlightHeaderOnHover === true) {
      const headerItemElement = parent.document.querySelector(selector) as HTMLDivElement | null
      if (headerItemElement) {
        headerItemElement.addEventListener("mouseover", () => {
          element.style.textDecoration = "underline"
        })
        headerItemElement.addEventListener("mouseout", () => {
          element.style.textDecoration = "unset"
        })
      }
    }
  }

  // 初期登録
  addHoverListeners()

  // DOM変化を監視して再登録
  const observer = new MutationObserver(() => {
    addHoverListeners()
  })

  const targetNode = parent.document.querySelector("#main-content-container") as HTMLElement | null
  if (targetNode) {
    observer.observe(targetNode, { childList: true, subtree: true })
  }
}


/**
 * Creates and configures a header element based on the given content and properties.
 */
const createHeaderElement = (
  content: string,
  tocBlock: TocBlock,
  versionMd: boolean,
  thisPageName: string,
  zoom?: { zoomIn: boolean; zoomInUuid: BlockEntity["uuid"] }
): HTMLElement => {
  let element: HTMLElement
  if (versionMd) {
    element = generateHeaderElement(content)
  } else {
    const headerLevel = tocBlock[":logseq.property/heading"] as number | 0
    element = headerLevel > 0 && headerLevel <= 6
      ? document.createElement(`h${headerLevel}`)
      : generateHeaderElement(content)
  }

  element.classList.add("left-toc-" + element.tagName.toLowerCase(), "cursor")
  element.setAttribute("data-uuid", tocBlock.uuid)

  // Embed content asynchronously
  loadEmbedContents(content, tocBlock.uuid)

  const headerText = processText(content.includes("\n") ? content.split("\n")[0] : content)

  // Add zoom mark
  const markElement = document.createElement("span")
  markElement.className = "zoom-mark"
  markElement.textContent = "🔍"
  markElement.style.display = zoom && zoom.zoomIn && zoom.zoomInUuid === tocBlock.uuid ? "inline" : "none"
  element.appendChild(markElement)

  element.innerHTML += headerText
  element.title = headerText
  element.addEventListener("click", ({ shiftKey, ctrlKey }) =>
    selectBlock(shiftKey, ctrlKey, thisPageName, tocBlock.uuid)
  )

  headerItemLink([tocBlock], 0, element)

  return element
}
