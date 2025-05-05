import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user"
import { t } from "logseq-l10n"
import removeMd from "remove-markdown"
import { booleanLogseqVersionMd, getCurrentPageOriginalName, onBlockChanged, onBlockChangedOnce } from "."
import { scrollToWithOffset, pageOpen } from "./lib"
import { removeListWords, removeMarkdownAliasLink, removeMarkdownImage, removeMarkdownLink, removeProperties, replaceOverCharacters } from "./markdown"
import { getContentFromUuid, getParentFromUuid } from "./query/advancedQuery"
import { clearTOC } from "./toc"


export const keyToolbarHeaderSpace = "lse-toc-header-space"
const keyToggleTableId = "thfpc--toggleHeader"
const keyToggleH = "tabbedHeadersToggleH"
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



// md系統のバージョン用
// ヘッダーを取得する関数
export const getTocBlocks = (childrenArr: Child[]): TocBlock[] => {
  let tocBlocks: TocBlock[] = [] // Empty array to push filtered strings to

  // Recursive function to map all headers in a linear array
  const findAllHeaders = (childrenArr: Child[]) => {
    if (!childrenArr) return
    for (let a = 0; a < childrenArr.length; a++) {
      if (isHeader(childrenArr[a].content, childrenArr[a] as TocBlock, true)) {
        tocBlocks.push({
          content: childrenArr[a].content,
          uuid: childrenArr[a].uuid,
          properties: childrenArr[a].properties,
        })
      }
      if (childrenArr[a].children)
        findAllHeaders(childrenArr[a].children as Child[])
      else
        return
    }
  }

  findAllHeaders(childrenArr)
  return tocBlocks
}


// dbバージョン用
// ヘッダーを取得する関数
export const getTocBlocksForDb = (childrenArr: Child[]): TocBlock[] => {
  let tocBlocks: TocBlock[] = [] // Empty array to push filtered strings to

  // Recursive function to map all headers in a linear array
  const findAllHeaders = (childrenArr: Child[]) => {
    if (!childrenArr) return
    for (let a = 0; a < childrenArr.length; a++) {
      if (
        childrenArr[a][":logseq.property/heading"] === 1
        || childrenArr[a][":logseq.property/heading"] === 2
        || childrenArr[a][":logseq.property/heading"] === 3
        || childrenArr[a][":logseq.property/heading"] === 4
        || childrenArr[a][":logseq.property/heading"] === 5
        || childrenArr[a][":logseq.property/heading"] === 6
      ) {
        tocBlocks.push({
          content: childrenArr[a].content,
          uuid: childrenArr[a].uuid,
          properties: childrenArr[a].properties,
          [":logseq.property/heading"]: childrenArr[a][":logseq.property/heading"]
        })
      }
      if (childrenArr[a].children)
        findAllHeaders(childrenArr[a].children as Child[])
      else
        return
    }
  }

  findAllHeaders(childrenArr)
  return tocBlocks
}



// キャッシュ用変数
let cachedHeaders: TocBlock[] | null = null

/**
 * Clears all zoom marks from the table of contents.
 */
const clearZoomMarks = () => {
  const zoomedElements = parent.document.querySelectorAll("#lse-toc-content [data-uuid]")
  zoomedElements.forEach((el) => {
    const markElement = el.querySelector(".zoom-mark") as HTMLElement | null
    if (markElement) markElement.style.display = "none" // マークを非表示
  })
}

export const headersList = async (
  targetElement: HTMLElement,
  tocBlocks: TocBlock[],
  thisPageName: string,
  versionMd: boolean,
  flag?: { zoomIn: boolean; zoomInUuid: BlockEntity["uuid"] }
): Promise<void> => {
  // ページ移動時にズームマークをリセット
  clearZoomMarks()

  // キャッシュと比較
  if (cachedHeaders && JSON.stringify(cachedHeaders) === JSON.stringify(tocBlocks)) {
    // キャッシュが一致している場合、ズームUUIDのハイライトのみ更新
    if (flag) {
      // 既存のズームマークをリセット
      const zoomedElements = targetElement.querySelectorAll("[data-uuid]")
      zoomedElements.forEach((el) => {
        const markElement = el.querySelector(".zoom-mark") as HTMLElement | null
        if (markElement) markElement.style.display = "none" // マークを非表示
      })

      // ズームUUIDが指定されている場合のみハイライト
      if (flag.zoomIn === true && flag.zoomInUuid) {
        const zoomedElement = targetElement.querySelector(`[data-uuid="${flag.zoomInUuid}"]`) as HTMLElement | null
        if (zoomedElement) {
          const markElement = zoomedElement.querySelector(".zoom-mark") as HTMLElement | null
          if (markElement) markElement.style.display = "inline" // マークを表示
        }
      }
    }
    return // DOM更新をスキップ
  }

  // キャッシュを更新
  cachedHeaders = tocBlocks

  // DOMをクリア
  targetElement.innerHTML = ""

  // additional buttons
  targetElement.append(additionalButtons(thisPageName))

  // ページコンテンツのヘッダーにカーソルを合わせた時に、CSSでヘッダーリストのUUIDが一致する、該当する項目をハイライトする
  let css = ""

  // Create list
  for (let i = 0; i < tocBlocks.length; i++) {
    let content: string = tocBlocks[i].content

    // Header
    if (isHeader(content, tocBlocks[i], versionMd)) {
      let element: HTMLElement
      if (versionMd === true) {
        // mdバージョン
        element = generateHeaderElement(content)
      } else {
        // dbバージョン dbグラフ
        const headerLevel = tocBlocks[i][":logseq.property/heading"] as number | 0
        if (headerLevel > 0 && headerLevel <= 6) {
          element = document.createElement(`h${headerLevel}`)
        } else {
          // dbバージョン mdグラフ
          element = generateHeaderElement(content)
        }
      }
      element.classList.add("left-toc-" + element.tagName.toLowerCase(), "cursor")
      element.setAttribute("data-uuid", tocBlocks[i].uuid) // UUIDをデータ属性として設定

      const headerText = await processHeaderContent(content, tocBlocks, i, versionMd)

      // マーク用エレメントを追加
      const markElement = document.createElement("span")
      markElement.className = "zoom-mark"
      markElement.textContent = "🔍"
      markElement.style.display = "none" // 初期状態は非表示
      element.appendChild(markElement)

      element.innerHTML += headerText
      element.title = headerText // ツールチップに表示する
      element.addEventListener("click", ({ shiftKey, ctrlKey }) =>
        selectBlock(shiftKey, ctrlKey, thisPageName, tocBlocks[i].uuid)
      )

      headerItemLink(tocBlocks, i, element)

      // Zoomed
      if (flag && flag.zoomIn === true && flag.zoomInUuid === tocBlocks[i].uuid) {
        markElement.style.display = "inline" // マークを表示
      }

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
      const zoomPageElement = parent.document.querySelector("#main-content-container div.page div.breadcrumb") as HTMLElement | null
      if (zoomPageElement) {
        await logseq.Editor.scrollToBlockInPage(pageName, blockUuid, { replaceState: true })
      } else {
        await expandAndScrollToBlock(blockUuid, true)
      }
    }
}

const scrollToAndSelectBlock = async (blockUuid: string) => {
  const element = parent.document.getElementById('block-content-' + blockUuid) as HTMLDivElement | null
  if (element) {
    scrollToWithOffset(element) // 共通関数を利用
    setTimeout(() => logseq.Editor.selectBlock(blockUuid), 50)
    return true
  }
  return false
}

const expandAndScrollToBlock = async (blockUuid: BlockEntity["uuid"], isInitialCall = false): Promise<void> => {
  if (!isInitialCall)
    await logseq.Editor.setBlockCollapsed(blockUuid, false)
  const parentUuid = await getParentFromUuid(blockUuid) as BlockEntity["uuid"] | null
  if (parentUuid
    && !(await scrollToAndSelectBlock(blockUuid)))
    await expandAndScrollToBlock(parentUuid, false)
}

export const displayToc = async (pageName: string, flag?: { zoomIn: boolean, zoomInUuid: BlockEntity["uuid"] }) => {
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
      await headersList(element, headers as TocBlock[], pageName, versionMd, flag ? flag : undefined)
      //toc更新用のイベントを登録する
      if (onBlockChangedOnce === false)
        onBlockChanged()
    } else
      clearTOC()
  }
}


/**
 * Utility function to create an HTML element with attributes and optional text content.
 */
const createElementWithAttributes = (tag: string, attributes: { [key: string]: string }, textContent?: string): HTMLElement => {
  const element = document.createElement(tag)
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value))
  if (textContent) element.textContent = textContent
  return element
}

const generatePageButton = (element: HTMLElement) => {
  const currentPageOriginalName = getCurrentPageOriginalName()
  if (currentPageOriginalName === "") return

  let headerSpace = parent.document.getElementById(keyToolbarHeaderSpace) as HTMLElement | null
  if (!headerSpace) {
    headerSpace = createElementWithAttributes("div", {
      id: keyToolbarHeaderSpace,
      class: "flex items-center",
    })
    element.insertAdjacentElement("beforebegin", headerSpace)
  }

  if (headerSpace) {
    // headerSpace.innerHTML = "" // リフレッシュ

    const openButton = createElementWithAttributes(
      "button",
      {
        title: currentPageOriginalName,
        class: "button",
        style: "white-space: nowrap",
      },
      currentPageOriginalName
    )
    openButton.addEventListener("click", ({ shiftKey }) => pageOpen(currentPageOriginalName, shiftKey, false))
    headerSpace.appendChild(openButton)
  }
}


let processingButton = false
export const hideHeaderFromList = (headerName: string) => {
  if (processingButton) return
  processingButton = true
  setTimeout(() => processingButton = false, 300)

  //リストから該当のヘッダーを削除
  toggleHeaderVisibility(headerName)
  //keyToggleの色を赤にする
  const button = parent.document.getElementById(`tabbedHeadersToggle${headerName.toUpperCase()}`) as HTMLButtonElement | null
  if (button)
    button.style.color = button.style.color === "red" ?
      "unset"
      : "red"
}


const toggleHeaderVisibility = (headerName: string) => {
  for (const element of (parent.document.querySelectorAll(`#lse-toc-content ${headerName}`) as NodeListOf<HTMLElement>))
    element.style.display = element.style.display === "none" ?
      "block"
      : "none"
}

const additionalButtons = (thisPageName: string) => {
  const elementButtons = createElementWithAttributes("div", {
    id: "lse-toc-buttons",
    class: "flex items-center",
  })

  const elementUpdate = createElementWithAttributes("span", { class: "cursor", title: t("Update Table of Contents") }, "🔄")
  elementUpdate.addEventListener("click", () => {
    elementUpdate.style.visibility = "hidden"
    setTimeout(() => (elementUpdate.style.visibility = "visible"), 2000)
    displayToc(thisPageName)
  })
  elementButtons.append(elementUpdate)

  const elementTop = createElementWithAttributes("span", { class: "cursor", title: t("Scroll to top") }, "↑")
  elementTop.addEventListener("click", () => {
    const titleElement = parent.document.querySelector("h1.page-title") as HTMLElement | null
    if (titleElement) titleElement.scrollIntoView({ behavior: "smooth" })
    else {
      const breadcrumbElement = parent.document.querySelector("div.breadcrumb.block-parents") as HTMLElement | null
      if (breadcrumbElement) breadcrumbElement.scrollIntoView({ behavior: "smooth" })
    }
  })
  elementButtons.append(elementTop)

  const elementBottom = createElementWithAttributes("span", { class: "cursor", title: t("Scroll to bottom") }, "↓")
  elementBottom.addEventListener("click", () => {
    const mainContent = parent.document.querySelector("#main-content-container div[tabindex='0'].add-button-link-wrap") as HTMLElement | null
    if (mainContent) mainContent.scrollIntoView({ behavior: "smooth" })
  })
  elementButtons.append(elementBottom)

  const elementForHideHeader = document.createElement("span")
  const elementHeaderTable = createElementWithAttributes("table", {
    id: keyToggleTableId,
    style: "margin-left: auto; margin-right: auto;",
  })
  const tableRow = document.createElement("tr")

  for (let level = 1; level <= 6; level++) {
    const th = document.createElement("th")
    const button = createElementWithAttributes(
      "button",
      { id: keyToggleH + level, title: t("Toggle for hide") },
      `h${level}`
    )
    button.addEventListener("click", () => hideHeaderFromList("h" + level.toString()))
    th.appendChild(button)
    tableRow.appendChild(th)
  }

  elementHeaderTable.appendChild(tableRow)
  elementForHideHeader.append(elementHeaderTable)
  elementButtons.append(elementForHideHeader)

  return elementButtons
}


const getHeaderLevel = (header: string): number => {
  const match = header.match(/^(#+)\s/)
  if (match)
    return match[1].length
  else
    return 0
}


const generateHeaderElement = (content: string) =>
  (content.startsWith("# ")) ?
    document.createElement("h1") :
    (content.startsWith("## ")) ?
      document.createElement("h2") :
      (content.startsWith("### ")) ?
        document.createElement("h3") :
        (content.startsWith("#### ")) ?
          document.createElement("h4") :
          (content.startsWith("##### ")) ?
            document.createElement("h5") :
            document.createElement("h6")


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
 * Processes the content of a header block by applying various transformations and returns the processed header text.
 */
const processHeaderContent = async (content: string, tocBlocks: TocBlock[], index: number, versionMd: boolean): Promise<string> => {
  if (content.includes("((") && content.includes("))")) {
    const blockIdArray = /\(([^(())]+)\)/.exec(content)
    if (blockIdArray) {
      for (const blockId of blockIdArray) {
        const blockContent = await getContentFromUuid(blockId) as BlockEntity["content"] | null
        if (blockContent) {
          content = content.replace(`((${blockId}))`, blockContent.substring(0, blockContent.indexOf("id::")))
        }
      }
    }
  }

  content = await removeProperties(tocBlocks, index, content)

  if (versionMd === true && content.includes("id:: ")) {
    content = content.substring(0, content.indexOf("id:: "))
  }

  content = removeMarkdownLink(content)
  content = removeMarkdownAliasLink(content)
  content = replaceOverCharacters(content)
  content = removeMarkdownImage(content)

  if (logseq.settings!.tocRemoveWordList as string !== "") {
    content = removeListWords(content, logseq.settings!.tocRemoveWordList as string)
  }

  const headerText = versionMd === true
    ? removeMd(
      `${(content.includes("collapsed:: true") && content.substring(2, content.length - 16)) || content.substring(2)}`
    )
    : removeMd(content)

  return headerText
}

/**
 * Determines if a given content or block qualifies as a header.
 */
const isHeader = (content: string, tocBlock: TocBlock, versionMd: boolean): boolean => {
  if (versionMd) {
    return content.startsWith("# ") ||
      content.startsWith("## ") ||
      content.startsWith("### ") ||
      content.startsWith("#### ") ||
      content.startsWith("##### ") ||
      content.startsWith("###### ") ||
      content.startsWith("####### ")
  } else {
    return tocBlock[":logseq.property/heading"] === 1 ||
      tocBlock[":logseq.property/heading"] === 2 ||
      tocBlock[":logseq.property/heading"] === 3 ||
      tocBlock[":logseq.property/heading"] === 4 ||
      tocBlock[":logseq.property/heading"] === 5 ||
      tocBlock[":logseq.property/heading"] === 6 ||
      content.startsWith("# ") ||
      content.startsWith("## ") ||
      content.startsWith("### ") ||
      content.startsWith("#### ") ||
      content.startsWith("##### ") ||
      content.startsWith("###### ") ||
      content.startsWith("####### ")
  }
}

