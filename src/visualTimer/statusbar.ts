import { settingKeys } from "../settings/keys"
import { buildTimerList } from "./controller"
import { TimerData } from "./timers"

export const STATUSBAR_ID = "lse-visualTimer-statusbar"
const STATUSBAR_TEXT_ID = "lse-visualTimer-statusbar-text"

const UPDATE_INTERVAL_MS = 30_000
const POPUP_MINUTES_MAX = 10_080 // 1週間。32bitタイマー上限(約35,791分)を十分下回る

let updateIntervalId: number | null = null
let popupIntervalId: number | null = null

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
                          .map(
                                       (timer) =>
                                                    `${timer.title.split("\n").join(" ").replace(/:+$/, "")}: ${timer.centerText}`
                          )
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

const insertStatusbarAnchor = (toolbar: HTMLElement) => {
             const doc = parent.document

             const anchor = doc.createElement("a")
             anchor.className = "button"
             anchor.id = STATUSBAR_ID
             anchor.style.cssText =
                          "cursor:pointer;display:inline-flex;align-items:center;padding:0 6px;font-size:12px;font-variant-numeric:tabular-nums;white-space:nowrap;"

             const span = doc.createElement("span")
             span.id = STATUSBAR_TEXT_ID
             anchor.appendChild(span)

             anchor.addEventListener("click", (ev) => {
                          ev.preventDefault()
                          ev.stopPropagation()
                          showStatusbarPopup()
             })

             if (toolbar.firstChild) toolbar.insertBefore(anchor, toolbar.firstChild)
             else toolbar.appendChild(anchor)
}

// 30秒ごとに呼ばれる常駐監視。要素がなければツールバーを探して再挿入し、あれば描画更新する。
// ツールバーが長時間(ホストの画面遷移などで)存在しなくても監視は止めない。
const ensureStatusbarMounted = () => {
             if (!parent.document.getElementById(STATUSBAR_ID)) {
                          const toolbar = findToolbar()
                          if (toolbar !== null) insertStatusbarAnchor(toolbar)
             }
             renderStatusbar()
}

export const mountStatusbarTimer = () => {
             if (updateIntervalId === null)
                          updateIntervalId = window.setInterval(ensureStatusbarMounted, UPDATE_INTERVAL_MS)
             ensureStatusbarMounted()
}

export const unmountStatusbarTimer = () => {
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
             return Math.min(POPUP_MINUTES_MAX, Math.max(1, Math.trunc(minutes)))
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
