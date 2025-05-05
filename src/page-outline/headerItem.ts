import { BlockEntity } from "@logseq/libs/dist/LSPlugin"
import { TocBlock } from "./headerList"
import { loadEmbedContents } from "./loadEmbedContents"
import { generateHeaderElement, processText } from "./regex"
import { selectBlock } from "./selectBlock"
import { createElementWithAttributes } from "../util/domUtils"



/**
 * Creates and configures a header element based on the given content and properties.
 */
export const createHeaderElement = (
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
  const markElement = createElementWithAttributes("span", {
    class: "zoom-mark",
    style: `display: ${zoom && zoom.zoomIn && zoom.zoomInUuid === tocBlock.uuid ? "inline" : "none"}`,
  }, "🔍")
  element.title = headerText

  element.appendChild(markElement)
  element.innerHTML += headerText
  element.addEventListener("click", ({ shiftKey, ctrlKey }) => selectBlock(shiftKey, ctrlKey, thisPageName, tocBlock.uuid))

  headerItemLink([tocBlock], 0, element)

  return element

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
