import { t } from "logseq-l10n"
import { clearCachedHeaders } from "./cache"


//"lse-toc-content"に代わりのメッセージを入れる(クリアも兼ねている)
export const clearTOC = () => {
  clearCachedHeaders()
  const element = parent.document.getElementById("lse-toc-content") as HTMLDivElement | null
  if (element)
    element.innerHTML = t("No headers found")
}
