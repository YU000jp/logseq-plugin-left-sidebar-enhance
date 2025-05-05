import { getCurrentPageOriginalName } from ".."
import { pageOpen } from "../util/lib"
import { keyToolbarHeaderSpace } from "./tocProcess"


/**
 * Utility function to create an HTML element with attributes and optional text content.
 */
export const createElementWithAttributes = (tag: string, attributes: { [key: string]: string} , textContent?: string): HTMLElement => {
  const element = document.createElement(tag)
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value))
  if (textContent) element.textContent = textContent
  return element
}

export const generatePageButton = (element: HTMLElement) => {
  const currentPageOriginalName = getCurrentPageOriginalName()
  if (currentPageOriginalName === "") return

  let headerSpace = parent.document.getElementById(keyToolbarHeaderSpace) as HTMLElement | null
  if (!headerSpace) {
    headerSpace = createElementWithAttributes("div", {
      id: keyToolbarHeaderSpace,
      class: "flex items-center",
    })
    element.insertAdjacentElement("beforebegin", headerSpace)
  }

  if (headerSpace) {
    // headerSpace.innerHTML = "" // リフレッシュ
    const openButton = createElementWithAttributes(
      "button",
      {
        title: currentPageOriginalName,
        class: "button",
        style: "white-space: nowrap",
      },
      currentPageOriginalName
    )
    openButton.addEventListener("click", ({ shiftKey }) => pageOpen(currentPageOriginalName, shiftKey, false))
    headerSpace.appendChild(openButton)
  }
}
