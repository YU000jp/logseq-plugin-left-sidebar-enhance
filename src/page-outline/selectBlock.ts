import { scrollToWithOffset } from "../util/domUtils"
import { expandAndScrollToBlock } from "./collapsed-block"
import { whenZoom } from "./zoom"

export const selectBlock = async (shiftKey: boolean, ctrlKey: boolean, pageName: string, blockUuid: string) => {
  await logseq.Editor.setBlockCollapsed(blockUuid, false)
  if (shiftKey) {
    logseq.Editor.openInRightSidebar(blockUuid)
  }
  else if (ctrlKey || logseq.settings!.booleanAsZoomPage === true) {
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
