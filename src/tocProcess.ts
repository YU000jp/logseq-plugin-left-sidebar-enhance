import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user"
import { t } from "logseq-l10n"
import removeMd from "remove-markdown"
import { booleanLogseqVersionMd, getCurrentPageOriginalName, onBlockChanged, onBlockChangedOnce } from "."
import { pageOpen } from "./lib"
import { removeListWords, removeMarkdownAliasLink, removeMarkdownImage, removeMarkdownLink, removeProperties, replaceOverCharacters } from "./markdown"
import { getContentFromUuid } from "./query/advancedQuery"
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
      if (
        childrenArr[a].content.startsWith("# ")
        || childrenArr[a].content.startsWith("## ")
        || childrenArr[a].content.startsWith("### ")
        || childrenArr[a].content.startsWith("#### ")
        || childrenArr[a].content.startsWith("##### ")
        || childrenArr[a].content.startsWith("###### ")
        || childrenArr[a].content.startsWith("####### ")
      ) {
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



export const headersList = async (targetElement: HTMLElement, tocBlocks: TocBlock[], thisPageName: string, versionMd: boolean, flag?: { zoomIn: boolean, zoomInUuid: BlockEntity["uuid"] }): Promise<void> => {

  // additional buttons
  targetElement.append(additionalButtons(thisPageName))

  // Create list
  for (let i = 0; i < tocBlocks.length; i++) {

    let content: string = tocBlocks[i].content

    // Header
    if ((versionMd === true
      && (content.startsWith("# ")
        || content.startsWith("## ")
        || content.startsWith("### ")
        || content.startsWith("#### ")
        || content.startsWith("##### ")
        || content.startsWith("###### ")
        || content.startsWith("####### ")))
      || (versionMd === false
        && (tocBlocks[i][":logseq.property/heading"] === 1
          || tocBlocks[i][":logseq.property/heading"] === 2
          || tocBlocks[i][":logseq.property/heading"] === 3
          || tocBlocks[i][":logseq.property/heading"] === 4
          || tocBlocks[i][":logseq.property/heading"] === 5
          || tocBlocks[i][":logseq.property/heading"] === 6)
        || (content.startsWith("# ")
          || content.startsWith("## ")
          || content.startsWith("### ")
          || content.startsWith("#### ")
          || content.startsWith("##### ")
          || content.startsWith("###### ")
          || content.startsWith("####### "))
      )) {
      let element: HTMLElement
      if (versionMd === true) // mdバージョン
        element = generateHeaderElement(content)
      else {
        // dbバージョン dbグラフ
        const headerLevel = tocBlocks[i][":logseq.property/heading"] as number | 0
        if (headerLevel > 0 && headerLevel <= 6)
          element = document.createElement(`h${headerLevel}`)
        else // dbバージョン mdグラフ
          element = generateHeaderElement(content)
      }
      element.classList.add("left-toc-" + element.tagName.toLowerCase(), "cursor")

      if (content.includes("((")
        && content.includes("))")) {
        // Get content if it's block reference
        const blockIdArray = /\(([^(())]+)\)/.exec(content)
        if (blockIdArray)
          for (const blockId of blockIdArray) {
            const blockContent = await getContentFromUuid(blockId) as BlockEntity["content"] | null
            if (blockContent)
              content = content.replace(`((${blockId}))`, blockContent.substring(0, blockContent.indexOf("id::")))
          }
      }

      //プロパティを取り除く
      content = await removeProperties(tocBlocks, i, content)

      if (versionMd === true && content.includes("id:: "))
        content = content.substring(0, content.indexOf("id:: "))

      //文字列のどこかで「[[」と「]]」で囲まれているもいのがある場合は、[[と]]を削除する
      content = removeMarkdownLink(content)

      //文字列のどこかで[]()形式のリンクがある場合は、[と]を削除する
      content = removeMarkdownAliasLink(content)

      //文字数が200文字を超える場合は、200文字以降を「...」に置き換える
      content = replaceOverCharacters(content)

      //マークダウンの画像記法を全体削除する
      content = removeMarkdownImage(content)

      //リストにマッチする文字列を正規表現で取り除く
      if (logseq.settings!.tocRemoveWordList as string !== "")
        content = removeListWords(content, logseq.settings!.tocRemoveWordList as string)


      const headerText = versionMd === true ?
        removeMd(
          `${(content.includes("collapsed:: true") //collapsed:: trueが含まれている場合は、それを削除する
            && content.substring(2, content.length - 16))
          || content.substring(2)}`
        )
        : removeMd(content) // dbバージョン用
      element.innerHTML = headerText
      element.title = headerText // ツールチップに表示する
      element.addEventListener('click', ({ shiftKey, ctrlKey }) =>
        selectBlock(shiftKey, ctrlKey, thisPageName, tocBlocks[i].uuid))

      //Zoomed
      if (flag &&
        flag.zoomIn === true)
        if (flag.zoomInUuid === tocBlocks[i].uuid) {
          element.style.backgroundColor = "var(--ls-block-highlight-color)"
          element.innerHTML += "🔍"
        }

      targetElement.append(element)
    }
  }
}


const selectBlock = async (shiftKey: boolean, ctrlKey: boolean, pageName: string, blockUuid: string) => {
  if (ctrlKey || logseq.settings!.booleanAsZoomPage === true) {
    logseq.App.pushState("page", { name: blockUuid }) //Uuidをページ名としてpushStateするとズームページが開く
    if (logseq.settings!.booleanAsZoomPage === false)
      logseq.UI.showMsg("Block Zoomed!", "info", { timeout: 1000 })
  } else
    if (shiftKey)
      logseq.Editor.openInRightSidebar(blockUuid)
    else {
      //https://github.com/freder/logseq-plugin-jump-to-block/blob/master/src/components/App.tsx#L39
      const elem = parent.document.getElementById('block-content-' + blockUuid) as HTMLDivElement | null
      if (elem) {
        logseq.Editor.exitEditingMode()
        elem.scrollIntoView({ behavior: 'smooth' })
        setTimeout(() =>
          logseq.Editor.selectBlock(blockUuid), 150)
      } else
        //親ブロックがcollapsedの場合
        await parentBlockToggleCollapsed(blockUuid)
    }
}


const parentBlockToggleCollapsed = async (blockUuidOrId): Promise<void> => {
  const block = await logseq.Editor.getBlock(blockUuidOrId) as { uuid: BlockEntity["uuid"], parent: BlockEntity["parent"] } | null
  if (!block) return
  const parentBlock = await logseq.Editor.getBlock(block.parent.id) as { uuid: BlockEntity["uuid"], parent: BlockEntity["parent"] } | null
  if (!parentBlock) return
  await logseq.Editor.setBlockCollapsed(parentBlock.uuid, false)
  const element = parent.document.getElementById('block-content-' + block.uuid) as HTMLDivElement | null
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
    setTimeout(() =>
      logseq.Editor.selectBlock(block.uuid), 50)
  } else
    await expandParentBlock(parentBlock)
}


const expandParentBlock = async (block: { uuid: BlockEntity["uuid"], parent: BlockEntity["parent"] }): Promise<void> => {
  if (block.parent) {
    const parentBlock = await logseq.Editor.getBlock(block.parent.id) as { uuid: BlockEntity["uuid"], parent: BlockEntity["parent"] } | null
    if (parentBlock) {
      await logseq.Editor.setBlockCollapsed(parentBlock.uuid, false)
      const element = parent.document.getElementById('block-content-' + parentBlock.uuid) as HTMLDivElement | null
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
        setTimeout(() =>
          logseq.Editor.selectBlock(block.uuid), 50)
      } else
        await expandParentBlock(parentBlock)
    }
  }
}


export const displayToc = async (pageName: string, flag?: { zoomIn: boolean, zoomInUuid: BlockEntity["uuid"] }) => {
  const element = parent.document.getElementById("lse-toc-content") as HTMLDivElement | null
  if (element) {
    element.innerHTML = "" //elementが存在する場合は中身を削除する

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


const generatePageButton = (element: HTMLElement) => {
  const currentPageOriginalName = getCurrentPageOriginalName()
  if (currentPageOriginalName === "") return
  let headerSpace = parent.document.getElementById(keyToolbarHeaderSpace) as HTMLElement | null
  if (!headerSpace) {
    // #keyToolbarHeaderSpaceが存在しない場合は、elementの先頭に作成する
    headerSpace = document.createElement("div")
    headerSpace.id = keyToolbarHeaderSpace
    headerSpace.className = "flex items-center"
    element.insertAdjacentElement("beforebegin", headerSpace)
  }
  if (headerSpace) {
    headerSpace.innerHTML = ""//リフレッシュ

    // ページを開くボタン
    const openButton = document.createElement("button")
    openButton.title = currentPageOriginalName
    openButton.textContent = currentPageOriginalName
    openButton.className = "button"
    openButton.style.whiteSpace = "nowrap"
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
  const elementButtons = document.createElement("div")
  elementButtons.id = "lse-toc-buttons"
  elementButtons.className = "flex items-center"

  // Update button
  const elementUpdate = document.createElement("span")
  elementUpdate.classList.add("cursor")
  elementUpdate.innerHTML = "🔄"
  elementUpdate.title = t("Update Table of Contents")
  elementUpdate.addEventListener('click', () => {
    elementUpdate.style.visibility = "hidden"
    setTimeout(() => elementUpdate.style.visibility = "visible", 2000)
    displayToc(thisPageName)
  })
  elementButtons.append(elementUpdate)

  // Scroll to top
  const elementTop = document.createElement("span")
  elementTop.classList.add("cursor")
  elementTop.innerHTML = "↑"
  elementTop.title = t("Scroll to top")
  elementTop.addEventListener('click', () => {
    const titleElement = parent.document.querySelector("h1.page-title") as HTMLElement | null
    if (titleElement)
      titleElement.scrollIntoView({ behavior: 'smooth' })
    else {
      // ズームページの場合
      const breadcrumbElement = parent.document.querySelector("div.breadcrumb.block-parents") as HTMLElement | null
      if (breadcrumbElement)
        breadcrumbElement.scrollIntoView({ behavior: 'smooth' })
    }
  }) // Scroll to top of the page when clicked on

  elementButtons.append(elementTop)

  // Scroll to bottom
  const elementBottom = document.createElement("span")
  elementBottom.classList.add("cursor")
  elementBottom.innerHTML = "↓"
  elementBottom.title = t("Scroll to bottom")
  elementBottom.addEventListener('click', () => {
    const mainContent = parent.document.querySelector("#main-content-container div[tabindex='0'].add-button-link-wrap") as HTMLElement | null
    if (mainContent)
      mainContent.scrollIntoView({ behavior: 'smooth' })
  }) // Scroll to bottom of the page when clicked on

  elementButtons.append(elementBottom)

  // Headerをトグルするボタンを追加する
  const elementForHideHeader = document.createElement("span")
  const elementHeaderTable = document.createElement("table")
  elementHeaderTable.style.marginLeft = "auto"
  elementHeaderTable.style.marginRight = "auto"
  elementHeaderTable.id = keyToggleTableId
  const tableRow = document.createElement("tr")
  for (let level = 1; level <= 6; level++) {
    const th = document.createElement("th")
    const button = document.createElement("button")
    button.id = keyToggleH + level
    button.addEventListener("click", () => hideHeaderFromList("h" + level.toString()))
    button.title = t("Toggle for hide")
    button.textContent = `h${level}`
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

