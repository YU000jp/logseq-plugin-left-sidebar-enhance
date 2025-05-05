import { BlockEntity } from "@logseq/libs/dist/LSPlugin.user"
import { booleanLogseqVersionMd, onBlockChanged, onBlockChangedOnce } from ".."
import { isHeadersCacheEqual, setCachedHeaders } from "../cache/tocCache"
import { clearTOC } from "./DOM"
import { generatePageButton } from "./toggleHeader"
import { getTocBlocks, getTocBlocksForDb } from "./findHeaders"
import { createHeaderElement } from "./headerItem"
import { getHeaderLevel, isHeader } from "./regex"
import { additionalButtons } from "./toggleHeader"
import { clearZoomMarks, updateZoomMark } from "./zoom"


export const keyToolbarHeaderSpace = "lse-toc-header-space"
export const keyToggleTableId = "thfpc--toggleHeader"
export const keyToggleH = "tabbedHeadersToggleH"

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

  // ズームマークのリセット
  clearZoomMarks()

  // キャッシュと比較
  if (isHeadersCacheEqual(tocBlocks)) {
    updateZoomMark(zoom, targetElement)
    return // DOM更新をスキップ
  }

  // キャッシュを更新
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
