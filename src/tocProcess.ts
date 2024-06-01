import removeMd from "remove-markdown"
import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user"
import { removeProperties, removeMarkdownLink, removeMarkdownAliasLink, replaceOverCharacters, removeMarkdownImage, removeListWords } from "./markdown"
import { onBlockChangedOnce, onBlockChanged } from "."
import { t } from "logseq-l10n"


export interface TocBlock {
  content: string
  uuid: string
  properties?: { [key: string]: string[] }
}

export interface Child {
  content: string
  uuid: string
  properties?: { [key: string]: string[] }
  children?: Child[]
}

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

export const headersList = async (targetElement: HTMLElement, tocBlocks: TocBlock[], thisPageName: string): Promise<void> => {

  const elementButtons = document.createElement("div")
  // Update button
  const elementUpdate = document.createElement("span")
  elementUpdate.classList.add("cursor")
  elementUpdate.innerHTML = "🔄"
  elementButtons.title = t("Update Table of Contents")
  elementUpdate.style.padding = "1em"
  elementButtons.append(elementUpdate)
  elementUpdate.addEventListener('click', () => {
    elementUpdate.style.visibility = "hidden"
    setTimeout(() =>
      elementUpdate.style.visibility = "visible", 2000)
    displayToc(thisPageName)
  })
  // Scroll to top
  const elementTop = document.createElement("span")
  elementTop.classList.add("cursor")
  elementTop.innerHTML = "↑"
  elementButtons.title = t("Scroll to top")
  elementTop.style.padding = "1em"
  elementButtons.append(elementTop)
  elementTop.addEventListener('click', () =>
    parent.document.querySelector("body[data-page=\"page\"]>div#root>div>main div#main-content-container h1.page-title")!.scrollIntoView({ behavior: 'smooth' })) // Scroll to top of the page when clicked on

  // Scroll to bottom
  const elementBottom = document.createElement("span")
  elementBottom.classList.add("cursor")
  elementBottom.innerHTML = "↓"
  elementButtons.title = t("Scroll to bottom")
  elementBottom.style.padding = "1em"
  elementButtons.append(elementBottom)
  elementBottom.addEventListener('click', () =>
    parent.document.querySelector("body[data-page=\"page\"]>div#root>div>main div#main-content-container div.relative+div")!.scrollIntoView({ behavior: 'smooth' })) // Scroll to bottom of the page when clicked on
  targetElement.append(elementButtons)

  // Create list
  for (let i = 0; i < tocBlocks.length; i++) {
    let contentLine: string = tocBlocks[i].content
    if (contentLine.includes("((")
      && contentLine.includes("))")) {
      // Get content if it's q block reference
      const blockId = /\(([^(())]+)\)/.exec(contentLine)
      if (!blockId) continue
      const block = await logseq.Editor.getBlock(blockId[1], {
        includeChildren: true,
      })
      if (!block) continue
      contentLine = contentLine.replace(
        `((${blockId[1]}))`,
        block.content.substring(0, block.content.indexOf("id::"))
      )
    }

    //プロパティを取り除く
    contentLine = await removeProperties(tocBlocks, i, contentLine)

    if (contentLine.includes("id:: "))
      contentLine = contentLine.substring(0, contentLine.indexOf("id:: "))

    //文字列のどこかで「[[」と「]]」で囲まれているもいのがある場合は、[[と]]を削除する
    contentLine = removeMarkdownLink(contentLine)
    //文字列のどこかで[]()形式のリンクがある場合は、[と]を削除する
    contentLine = removeMarkdownAliasLink(contentLine)
    //文字数が200文字を超える場合は、200文字以降を「...」に置き換える
    contentLine = replaceOverCharacters(contentLine)
    //マークダウンの画像記法を全体削除する
    contentLine = removeMarkdownImage(contentLine)
    //リストにマッチする文字列を正規表現で取り除く
    contentLine = removeListWords(contentLine, logseq.settings!.tocRemoveWordList as string)

    // Header
    if (contentLine.startsWith("# ")
      || contentLine.startsWith("## ")
      || contentLine.startsWith("### ")
      || contentLine.startsWith("#### ")
      || contentLine.startsWith("##### ")
      || contentLine.startsWith("###### ")
      || contentLine.startsWith("####### ")) {
      const element: HTMLDivElement =
        (contentLine.startsWith("# ")) ?
          document.createElement("h1") :
          (contentLine.startsWith("## ")) ?
            document.createElement("h2") :
            (contentLine.startsWith("### ")) ?
              document.createElement("h3") :
              (contentLine.startsWith("#### ")) ?
                document.createElement("h4") :
                (contentLine.startsWith("##### ")) ?
                  document.createElement("h5") :
                  document.createElement("h6")
      element.classList.add("cursor")
      //elementのタグ名を取得する
      element.title = element.tagName.toLowerCase()
      element.innerHTML = removeMd(
        `${(contentLine.includes("collapsed:: true")
          && contentLine.substring(2, contentLine.length - 16))
        || contentLine.substring(2)}`
      )
      setTimeout(() => {
        element.addEventListener('click', ({ shiftKey }) =>
          selectBlock(shiftKey, thisPageName, tocBlocks[i].uuid))
      }, 800)
      targetElement.append(element)
    }
  }
}

const selectBlock = async (shiftKey: boolean, pageName: string, blockUuid: string) => {
  if (shiftKey)
    logseq.Editor.openInRightSidebar(blockUuid)
  else {
    //https://github.com/freder/logseq-plugin-jump-to-block/blob/master/src/components/App.tsx#L39
    const elem = parent.document.getElementById('block-content-' + blockUuid) as HTMLDivElement | null
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() =>
        logseq.Editor.selectBlock(blockUuid), 50)
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
export const displayToc = async (pageName: string) => {
  const element = parent.document.getElementById("lse-toc-content") as HTMLDivElement | null
  if (element) {
    element.innerHTML = "" //elementが存在する場合は中身を削除する
    //ページの全ブロックからheaderがあるかどうかを確認する
    let headers = getTocBlocks(await logseq.Editor.getPageBlocksTree(pageName) as Child[])
    if (headers.length > 0) {
      //headersのcontentに、#や##などのヘッダー記法が含まれているデータのみ処理をする
      headers = headers.filter(header =>
        header.content.startsWith("# ")
        || header.content.startsWith("## ")
        || header.content.startsWith("### ")
        || header.content.startsWith("#### ")
        || header.content.startsWith("##### ")
        || header.content.startsWith("###### "))
    }
    //フィルター後
    if (headers.length > 0) {
      await headersList(element, headers as TocBlock[], pageName)
      //toc更新用のイベントを登録する
      if (onBlockChangedOnce === false)
        onBlockChanged()
    } else {
      element.innerHTML = t("No headers found")
    }
  }
}


