import { BlockEntity } from "@logseq/libs/dist/LSPlugin"
import { scrollToWithOffset } from "../util/domUtils"
import { getParentFromUuid } from "../util/query/advancedQuery"


const scrollToAndSelectBlock = async (blockUuid: string) => {
  const element = parent.document.getElementById('block-content-' + blockUuid) as HTMLDivElement | null
  if (element) {
    scrollToWithOffset(element) // 共通関数を利用
    setTimeout(() => logseq.Editor.selectBlock(blockUuid), 50)
    return true
  }
  return false
}


export const expandAndScrollToBlock = async (blockUuid: BlockEntity["uuid"], isInitialCall = false): Promise<void> => {
  if (!isInitialCall)
    await logseq.Editor.setBlockCollapsed(blockUuid, false)
  const parentUuid = await getParentFromUuid(blockUuid) as BlockEntity["uuid"] | null
  if (parentUuid
    && !(await scrollToAndSelectBlock(blockUuid)))
    await expandAndScrollToBlock(parentUuid, false)
}
