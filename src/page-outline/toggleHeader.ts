import { t } from "logseq-l10n"
import { createElementWithAttributes } from "./DOM"
import { displayToc, keyToggleTableId, keyToggleH } from "./headerList"


let processingButton = false

export const hideHeaderFromList = (headerName: string) => {
  if (processingButton) return
  processingButton = true
  setTimeout(() => processingButton = false, 300)

  //リストから該当のヘッダーを削除
  toggleHeaderVisibility(headerName)
  //keyToggleの色を赤にする
  const button = parent.document.getElementById(`tabbedHeadersToggle${headerName.toUpperCase()}`) as HTMLButtonElement | null
  if (button)
    button.style.color = button.style.color === "red" ?
      "unset"
      : "red"
}

export const toggleHeaderVisibility = (headerName: string) => {
  for (const element of (parent.document.querySelectorAll(`#lse-toc-content ${headerName}`) as NodeListOf<HTMLElement>))
    element.style.display = element.style.display === "none" ?
      "block"
      : "none"
}


export const additionalButtons = (thisPageName: string) => {
  const elementButtons = createElementWithAttributes("div", {
    id: "lse-toc-buttons",
    class: "flex items-center",
  })

  const elementUpdate = createElementWithAttributes("span", { class: "cursor", title: t("Update Table of Contents") }, "🔄")
  elementUpdate.addEventListener("click", () => {
    elementUpdate.style.visibility = "hidden"
    setTimeout(() => (elementUpdate.style.visibility = "visible"), 2000)
    displayToc(thisPageName)
  })
  elementButtons.append(elementUpdate)

  const elementTop = createElementWithAttributes("span", { class: "cursor", title: t("Scroll to top") }, "↑")
  elementTop.addEventListener("click", () => {
    const titleElement = parent.document.querySelector("h1.page-title") as HTMLElement | null
    if (titleElement) titleElement.scrollIntoView({ behavior: "smooth" })
    else {
      const breadcrumbElement = parent.document.querySelector("div.breadcrumb.block-parents") as HTMLElement | null
      if (breadcrumbElement) breadcrumbElement.scrollIntoView({ behavior: "smooth" })
    }
  })
  elementButtons.append(elementTop)

  const elementBottom = createElementWithAttributes("span", { class: "cursor", title: t("Scroll to bottom") }, "↓")
  elementBottom.addEventListener("click", () => {
    const mainContent = parent.document.querySelector("#main-content-container div[tabindex='0'].add-button-link-wrap") as HTMLElement | null
    if (mainContent) mainContent.scrollIntoView({ behavior: "smooth" })
  })
  elementButtons.append(elementBottom)

  const elementForHideHeader = document.createElement("span")
  const elementHeaderTable = createElementWithAttributes("table", {
    id: keyToggleTableId,
    style: "margin-left: auto; margin-right: auto;",
  })
  const tableRow = document.createElement("tr")

  for (let level = 1; level <= 6; level++) {
    const th = document.createElement("th")
    const button = createElementWithAttributes(
      "button",
      { id: keyToggleH + level, title: t("Toggle for hide") },
      `h${level}`
    )
    button.addEventListener("click", () => hideHeaderFromList("h" + level.toString()))
    th.appendChild(button)
    tableRow.appendChild(th)
  }

  elementHeaderTable.appendChild(tableRow)
  elementForHideHeader.append(elementHeaderTable)
  elementButtons.append(elementForHideHeader)

  return elementButtons
}

