import { LSPluginBaseInfo } from "@logseq/libs/dist/LSPlugin.user"
import { t } from "logseq-l10n"
import { removeContainer } from "../util/lib"
import { CONTAINER_ID, INNER_ID } from "./constants"
import { getVisualTimerCss } from "./styles"
import { mountVisualTimer, unmountVisualTimer } from "./ui"

const hasVisualTimerSettingsChanged = (
  oldSet: LSPluginBaseInfo["settings"],
  newSet: LSPluginBaseInfo["settings"]
): boolean => {
  const keys = [
    "visualTimerEnableDayWindow",
    "visualTimerEnableWeekdays",
    "visualTimerEnableTargetDate",
    "visualTimerDayWindowStartHour",
    "visualTimerDayWindowEndHour",
    "visualTimerWeekdayStart",
    "visualTimerWeekdayEnd",
    "visualTimerTargetDate",
  ] as const

  return keys.some((key) => JSON.stringify(oldSet?.[key]) !== JSON.stringify(newSet?.[key]))
}

const refreshIfMounted = (): void => {
  const inner = parent.document.getElementById(INNER_ID) as HTMLDivElement | null
  if (inner === null) return
  if (inner.dataset.flag !== "true") return
  mountVisualTimer(inner)
}

export const loadVisualTimer = () => {
  logseq.onSettingsChanged(async (newSet: LSPluginBaseInfo["settings"], oldSet: LSPluginBaseInfo["settings"]) => {
    if (oldSet.booleanVisualTimer !== newSet.booleanVisualTimer) {
      if (newSet.booleanVisualTimer === true) main()
      else {
        unmountVisualTimer()
        removeContainer(CONTAINER_ID)
      }
      return
    }

    if (newSet.booleanVisualTimer === true && hasVisualTimerSettingsChanged(oldSet, newSet)) {
      refreshIfMounted()
    }
  })

  if (logseq.settings?.booleanVisualTimer === true) main()

  logseq.provideStyle(getVisualTimerCss(INNER_ID))
}

const main = () => {
  if (parent.document.getElementById(CONTAINER_ID)) removeContainer(CONTAINER_ID)

  setTimeout(async () => {
    const navEle: HTMLDivElement | null =
      (parent.document.querySelector(
        "#left-sidebar>div.left-sidebar-inner div.nav-contents-container"
      ) as HTMLDivElement) || null

    if (navEle === null) return

    const divAsItemEle: HTMLDivElement = document.createElement("div")
    divAsItemEle.className = "nav-content-item mt-3 is-expand flex-shrink-0"
    divAsItemEle.id = CONTAINER_ID

    const detailsEle: HTMLDetailsElement = document.createElement("details")
    detailsEle.className = "nav-content-item-inner"
    detailsEle.open = true

    const summaryEle: HTMLElement = document.createElement("summary")
    summaryEle.className = "header items-center"
    summaryEle.style.cursor = "row-resize"
    summaryEle.style.backgroundColor = "var(--ls-tertiary-background-color)"
    summaryEle.innerText = t("Visual Timer")
    summaryEle.title = "Left Sidebar Enhance " + t("plugin")
    // settings button (opens plugin settings)
    const settingsBtn: HTMLButtonElement = document.createElement("button")
    settingsBtn.type = "button"
    settingsBtn.className = "lse-visualTimer-settings-btn"
    settingsBtn.title = t("Settings") || "Settings"
    settingsBtn.innerText = "⚙"
    // prevent toggling the details when clicking the button
    settingsBtn.addEventListener("click", (ev) => {
      ev.stopPropagation()
      ev.preventDefault()
      try {
        // open plugin settings
        // @ts-ignore
        if (typeof logseq?.showSettingsUI === "function") logseq.showSettingsUI()
      } catch (e) {
        // ignore
      }
    })
    summaryEle.appendChild(settingsBtn)

    const containerEle: HTMLDivElement = document.createElement("div")
    containerEle.className = "bg"
    containerEle.id = INNER_ID

    detailsEle.appendChild(summaryEle)
    detailsEle.appendChild(containerEle)
    divAsItemEle.appendChild(detailsEle)
    navEle.appendChild(divAsItemEle)

    setTimeout(() => {
      const inner = parent.document.getElementById(INNER_ID) as HTMLDivElement | null
      if (inner === null) return

      if (inner.dataset.flag !== "true") mountVisualTimer(inner)
      inner.dataset.flag = "true"
    }, 1)
  }, 500)
}
