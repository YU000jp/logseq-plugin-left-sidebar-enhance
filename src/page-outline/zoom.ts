import { BlockEntity } from "@logseq/libs/dist/LSPlugin"
import { expandAndScrollToBlock } from "./collapsed-block"

/**
 * Clears all zoom marks from the table of contents.
 */
export const clearZoomMarks = () => {
  const zoomedElements = parent.document.querySelectorAll("#lse-toc-content [data-uuid]")
  zoomedElements.forEach((el) => {
    const markElement = el.querySelector(".zoom-mark") as HTMLElement | null
    if (markElement) markElement.style.display = "none" // マークを非表示
  })
}

export const updateZoomMark = (zoom: { zoomIn: boolean; zoomInUuid: BlockEntity["uuid"] } | undefined, targetElement: HTMLElement) => {
  if (zoom) {
    const zoomedElements = targetElement.querySelectorAll("[data-uuid]")
    zoomedElements.forEach((el) => {
      const markElement = el.querySelector(".zoom-mark") as HTMLElement | null
      if (markElement) markElement.style.display = "none" // マークを非表示
    })

    if (zoom.zoomIn && zoom.zoomInUuid) {
      const zoomedElement = targetElement.querySelector(`[data-uuid="${zoom.zoomInUuid}"]`) as HTMLElement | null
      if (zoomedElement) {
        const markElement = zoomedElement.querySelector(".zoom-mark") as HTMLElement | null
        if (markElement) markElement.style.display = "inline"
      }
    }
  }
}

export const whenZoom = async (pageName: string, blockUuid: string) => {
  const zoomPageElement = parent.document.querySelector("#main-content-container div.page div.breadcrumb") as HTMLElement | null
  if (zoomPageElement) {
    await logseq.Editor.scrollToBlockInPage(pageName, blockUuid, { replaceState: true })
  } else {
    await expandAndScrollToBlock(blockUuid, true)
  }
}

