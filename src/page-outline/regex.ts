import { removeListWords, removeMarkdownAliasLink, removeMarkdownImage, removeMarkdownLink, replaceOverCharacters } from "../util/markdown"
import removeMd from "remove-markdown"
import { TocBlock } from "./tocProcess"


export const processText = (content: string): string => {
             let processed = removeMarkdownLink(content)
             processed = removeMarkdownAliasLink(processed)
             processed = replaceOverCharacters(processed)
             processed = removeMarkdownImage(processed)
             if (logseq.settings!.tocRemoveWordList as string !== "") {
                          processed = removeListWords(processed, logseq.settings!.tocRemoveWordList as string)
             }
             return removeMd(processed)
}

export const generateHeaderElement = (content: string) => (content.startsWith("# ")) ?
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
          
/**
 * Determines if a given content or block qualifies as a header.
 */
export const isHeader = (content: string, tocBlock: TocBlock, versionMd: boolean): boolean => {
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

export const getHeaderLevel = (header: string): number => {
  const match = header.match(/^(#+)\s/)
  if (match)
    return match[1].length

  else
    return 0
}

