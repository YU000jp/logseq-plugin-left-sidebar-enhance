import { BlockEntity } from "@logseq/libs/dist/LSPlugin"
import { getContentFromUuid } from "../util/query/advancedQuery"
import { processText } from "./regex"

export const loadEmbedContents = (content: string, uuid: BlockEntity["uuid"]) => {
  if (content.includes("((") && content.includes("))")) {
    setTimeout(async () => {
      const blockIdArray = /\(([^(())]+)\)/.exec(content)
      if (blockIdArray) {
        for (let blockId of blockIdArray) {
          blockId = blockId.substring(1, blockId.length - 1)
          const blockContent = await getContentFromUuid(blockId) as BlockEntity["content"] | null
          if (blockContent) {
            // Replace the selected code with:
            const updatedContent = blockContent.includes("\n") ?
              processText(blockContent.split("\n")[0])
              : processText(blockContent)
            const targetElement = parent.document.querySelector(`#lse-toc-content [data-uuid="${uuid}"]`) as HTMLElement | null
            if (targetElement) {
              targetElement.innerHTML = targetElement.innerHTML.replace(`((${blockId}))`, updatedContent)
              targetElement.title = updatedContent
            }
          }
        }
      }
    }, 10)
  }
}
