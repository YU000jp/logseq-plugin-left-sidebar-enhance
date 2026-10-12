import { settingKeys } from "../settings/keys"
import { buildTimerList } from "./controller"
import { TimerData } from "./timers"

export const STATUSBAR_ID = "lse-visualTimer-statusbar"
const STATUSBAR_TEXT_ID = "lse-visualTimer-statusbar-text"

const UPDATE_INTERVAL_MS = 30_000

let updateIntervalId: number | null = null
let popupIntervalId: number | null = null
let mountRetryId: number | null = null
let mountRetryCount = 0
const MOUNT_RETRY_MAX = 10

const findToolbar = (): HTMLElement | null => {
             const doc = parent.document
             return (
                          (doc.querySelector("#head>.r") as HTMLElement | null) ||
                          (doc.querySelector(".cp__header-right-menu") as HTMLElement | null) ||
                          null
             )
}

const buildStatusbarText = (timers: TimerData[]): string =>
             timers.map((timer) => timer.centerText).join(" · ")

const buildPopupText = (timers: TimerData[]): string =>
             timers
                          .map((timer) => `${timer.title.split("\n")[0].replace(/:+$/, "")}: ${timer.centerText}`)
                          .join(" / ")

export const showStatusbarPopup = () => {
             const timers = buildTimerList(new Date(), new Date())
             if (timers.length === 0) return
             logseq.UI.showMsg(buildPopupText(timers), "info", { timeout: 6000 })
}

const renderStatusbar = () => {
             const anchor = parent.document.getElementById(STATUSBAR_ID) as HTMLAnchorElement | null
             if (anchor === null) return

             const timers = buildTimerList(new Date(), new Date())
             const text = timers.length === 0 ? "" : `⏳ ${buildStatusbarText(timers)}`

             const span = parent.document.getElementById(STATUSBAR_TEXT_ID)
             if (span) span.textContent = text

             anchor.style.display = text === "" ? "none" : "inline-flex"
             anchor.title = timers
                          .map((timer) => `${timer.title.split("\n").join(" ")}: ${timer.centerText}`)
                          .join("\n")
}

// ホスト側がツールバーDOMを再構築した場合に備え、存在しなければ再挿入する
const ensureStatusbarMounted = () => {
             if (parent.document.getElementById(STATUSBAR_ID)) {
                          renderStatusbar()
                          return
             }
             mountStatusbarTimer()
}

export const mountStatusbarTimer = () => {
             if (updateIntervalId !== null) {
                          window.clearInterval(updateIntervalId)
                          updateIntervalId = null
             }
             const existing = parent.document.getElementById(STATUSBAR_ID)
             if (existing) existing.remove()

             const toolbar = findToolbar()
             if (toolbar === null) {
                          // 起動直後などでツールバーが未描画の場合は数回リトライする
                          if (mountRetryId !== null) window.clearTimeout(mountRetryId)
                          if (mountRetryCount >= MOUNT_RETRY_MAX) return
                          mountRetryCount += 1
                          mountRetryId = window.setTimeout(mountStatusbarTimer, 1500)
                          return
             }
             mountRetryCount = 0

             const anchor = parent.document.createElement("a")
             anchor.className = "button"
             anchor.id = STATUSBAR_ID
             anchor.style.cssText =
                          "cursor:pointer;display:inline-flex;align-items:center;padding:0 6px;font-size:12px;font-variant-numeric:tabular-nums;white-space:nowrap;"

             const span = parent.document.createElement("span")
             span.id = STATUSBAR_TEXT_ID
             anchor.appendChild(span)

             anchor.addEventListener("click", (ev) => {
                          ev.preventDefault()
                          ev.stopPropagation()
                          showStatusbarPopup()
             })

             if (toolbar.firstChild) toolbar.insertBefore(anchor, toolbar.firstChild)
             else toolbar.appendChild(anchor)

             renderStatusbar()
             updateIntervalId = window.setInterval(ensureStatusbarMounted, UPDATE_INTERVAL_MS)
}

export const unmountStatusbarTimer = () => {
             if (mountRetryId !== null) {
                          window.clearTimeout(mountRetryId)
                          mountRetryId = null
             }
             mountRetryCount = 0
             if (updateIntervalId !== null) {
                          window.clearInterval(updateIntervalId)
                          updateIntervalId = null
             }
             const ele = parent.document.getElementById(STATUSBAR_ID)
             if (ele) ele.remove()
}

export const refreshStatusbarTimer = () => {
             if (updateIntervalId === null) return
             renderStatusbar()
}

const getPopupMinutes = (settings: Record<string, unknown>): number => {
             const raw = settings[settingKeys.visualTimer.popupMinutes]
             const minutes =
                          typeof raw === "number" && Number.isFinite(raw)
                                       ? raw
                                       : typeof raw === "string" && raw.trim() !== "" && Number.isFinite(Number(raw))
                                                    ? Number(raw)
                                                    : 60
             return Math.max(1, Math.trunc(minutes))
}

export const startStatusbarPopup = () => {
             stopStatusbarPopup()
             const minutes = getPopupMinutes((logseq.settings ?? {}) as Record<string, unknown>)
             popupIntervalId = window.setInterval(showStatusbarPopup, minutes * 60_000)
}

export const stopStatusbarPopup = () => {
             if (popupIntervalId !== null) {
                          window.clearInterval(popupIntervalId)
                          popupIntervalId = null
             }
}
