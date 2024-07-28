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

  // additional buttons
  targetElement.append(additionalButtons(thisPageName))

  // Create list
  for (let i = 0; i < tocBlocks.length; i++) {

    let content: string = tocBlocks[i].content

    if (content.includes("((")
      && content.includes("))")) {
      // Get content if it's q block reference
      const blockIdArray = /\(([^(())]+)\)/.exec(content)
      if (blockIdArray)
        for (const blockId of blockIdArray) {
          const block = await logseq.Editor.getBlock(blockId, { includeChildren: false, })
          if (block)
            content = content.replace(`((${blockId}))`, block.content.substring(0, block.content.indexOf("id::")))
        }
    }

    //プロパティを取り除く
    content = await removeProperties(tocBlocks, i, content)

    if (content.includes("id:: "))
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
    content = removeListWords(content, logseq.settings!.tocRemoveWordList as string)

    // Header
    if (content.startsWith("# ")
      || content.startsWith("## ")
      || content.startsWith("### ")
      || content.startsWith("#### ")
      || content.startsWith("##### ")
      || content.startsWith("###### ")
      || content.startsWith("####### ")) {
      const element: HTMLDivElement =
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
      element.classList.add("cursor")
      //elementのタグ名を取得する
      element.title = element.tagName.toLowerCase()
      element.innerHTML = removeMd(
        `${(content.includes("collapsed:: true") //collapsed:: trueが含まれている場合は、それを削除する
          && content.substring(2, content.length - 16))
        || content.substring(2)}`
      )
      setTimeout(() => {
        element.addEventListener('click', ({ shiftKey, ctrlKey }) =>
          selectBlock(shiftKey, ctrlKey, thisPageName, tocBlocks[i].uuid))
      }, 800)
      targetElement.append(element)
    }
  }
}


const selectBlock = async (shiftKey: boolean, ctrlKey: boolean, pageName: string, blockUuid: string) => {
  if (ctrlKey || logseq.settings!.booleanZoomPage === true) {
    logseq.App.pushState("page", { name: blockUuid }) //Uuidをページ名としてpushStateするとズームページが開く
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


export const displayToc = async (pageName: string) => {
  const element = parent.document.getElementById("lse-toc-content") as HTMLDivElement | null
  if (element) {
    element.innerHTML = "" //elementが存在する場合は中身を削除する

    //ページの全ブロックからheaderがあるかどうかを確認する
    let headers = getTocBlocks(await logseq.Editor.getPageBlocksTree(pageName) as Child[])

    if (headers.length > 0)
      //headersのcontentに、#や##などのヘッダー記法が含まれているデータのみ処理をする
      headers = headers.filter((block) => {
        const headerLevel = getHeaderLevel(block.content)
        return headerLevel > 0 && headerLevel <= 6
      })

    //フィルター後
    if (headers.length > 0) {
      await headersList(element, headers as TocBlock[], pageName)
      //toc更新用のイベントを登録する
      if (onBlockChangedOnce === false)
        onBlockChanged()
    } else
      element.innerHTML = t("No headers found")
  }
}


const additionalButtons = (thisPageName: string) => {
  const elementButtons = document.createElement("div")
  elementButtons.id = "lse-toc-buttons"

  // Update button
  const elementUpdate = document.createElement("span")
  elementUpdate.classList.add("cursor")
  elementUpdate.innerHTML = "🔄"
  elementUpdate.title = t("Update Table of Contents")
  elementUpdate.style.padding = "1em"
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
  elementTop.style.padding = "1em"
  elementTop.addEventListener('click', () => parent.document.querySelector("body[data-page=\"page\"]>div#root>div>main div#main-content-container h1.page-title")!.scrollIntoView({ behavior: 'smooth' })) // Scroll to top of the page when clicked on
  elementButtons.append(elementTop)

  // Scroll to bottom
  const elementBottom = document.createElement("span")
  elementBottom.classList.add("cursor")
  elementBottom.innerHTML = "↓"
  elementBottom.title = t("Scroll to bottom")
  elementBottom.style.padding = "1em"
  elementBottom.addEventListener('click', () => parent.document.querySelector("body[data-page=\"page\"]>div#root>div>main div#main-content-container div.relative+div")!.scrollIntoView({ behavior: 'smooth' })) // Scroll to bottom of the page when clicked on
  elementButtons.append(elementBottom)

  return elementButtons
}


const getHeaderLevel = (header: string): number => {
  const match = header.match(/^(#+)\s/)
  if (match)
    return match[1].length
  else
    return 0
}