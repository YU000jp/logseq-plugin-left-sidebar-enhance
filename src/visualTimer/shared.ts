import { t as _t } from "logseq-l10n"

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export const pad2 = (n: number) => String(n).padStart(2, "0")

export const formatRemaining = (ms: number): string => {
             const totalMinutes = Math.max(0, Math.floor(ms / 60000))
             const hours = Math.floor(totalMinutes / 60)
             const minutes = totalMinutes % 60
             return `${hours}:${pad2(minutes)}`
}

export const formatLargestUnit = (ms: number, t?: (k: string) => string): string => {
             const totalMinutes = Math.max(0, Math.floor(ms / 60000))
             const totalHours = Math.floor(totalMinutes / 60)
             const minutes = totalMinutes % 60
             const days = Math.floor(totalHours / 24)
             const hours = totalHours % 24

             const fn = t ?? _t
             if (days > 0) return `${days}${fn("d")}`
             if (hours > 0) return `${hours}${fn("h")}`
             return `${minutes}${fn("m")}`
}

export default {}

export type CreateContainerOptions = {
             parentDocument?: Document
}

export const createVisualTimerContainer = (
             navEle: HTMLElement,
             containerId: string,
             innerId: string,
             titleText: string,
             onSettingsClick?: () => void,
             opts?: CreateContainerOptions
): HTMLDivElement | null => {
             const doc = opts?.parentDocument ?? parent.document

             if (!navEle) return null

             const divAsItemEle: HTMLDivElement = doc.createElement("div")
             divAsItemEle.className = "nav-content-item mt-3 is-expand flex-shrink-0"
             divAsItemEle.id = containerId

             const detailsEle: HTMLDetailsElement = doc.createElement("details")
             detailsEle.className = "nav-content-item-inner"
             detailsEle.open = true

             const summaryEle: HTMLElement = doc.createElement("summary")
             summaryEle.className = "header items-center"
             summaryEle.style.cursor = "row-resize"
             summaryEle.style.backgroundColor = "var(--ls-tertiary-background-color)"
             summaryEle.innerText = titleText
             summaryEle.title = "Left Sidebar Enhance " + titleText

             const settingsBtn: HTMLButtonElement = doc.createElement("button")
             settingsBtn.type = "button"
             settingsBtn.className = "lse-visualTimer-settings-btn"
             settingsBtn.title = titleText
             settingsBtn.innerText = "⚙"
             settingsBtn.addEventListener("click", (ev) => {
                          ev.stopPropagation()
                          ev.preventDefault()
                          try {
                                       if (onSettingsClick) onSettingsClick()
                                       else if (typeof (logseq as any)?.showSettingsUI === "function") (logseq as any).showSettingsUI()
                          } catch (e) {
                                       // ignore
                          }
             })
             summaryEle.appendChild(settingsBtn)

             const containerEle: HTMLDivElement = doc.createElement("div")
             containerEle.className = "bg"
             containerEle.id = innerId

             detailsEle.appendChild(summaryEle)
             detailsEle.appendChild(containerEle)
             divAsItemEle.appendChild(detailsEle)
             navEle.appendChild(divAsItemEle)

             return containerEle
}
