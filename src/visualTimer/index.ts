import { LSPluginBaseInfo } from "@logseq/libs/dist/LSPlugin.user"
import { t } from "logseq-l10n"
import { removeContainer } from "../util/lib"
import { CONTAINER_ID, INNER_ID } from "./constants"
import { getVisualTimerCss } from "./styles"
import { mountVisualTimer, unmountVisualTimer } from "./ui"
import { settingKeys } from "../settings/keys"

const hasVisualTimerSettingsChanged = (
             oldSet: LSPluginBaseInfo["settings"],
             newSet: LSPluginBaseInfo["settings"]
): boolean => {
             const keys = Object.values(settingKeys.visualTimer)
             return keys.some((key) => JSON.stringify(oldSet?.[key]) !== JSON.stringify(newSet?.[key]))
}

const refreshIfMounted = (): void => {
             const inner = parent.document.getElementById(INNER_ID) as HTMLDivElement | null
             if (inner === null) return
             if (inner.dataset.flag !== "true") return
             mountVisualTimer(inner)
}

export const loadVisualTimer = () => {
    // 初期起動時のマウント処理（設定が有効なら表示）
    if (logseq.settings?.[settingKeys.visualTimer.master] === true) main()

    // スタイル提供は常に行う
    logseq.provideStyle(getVisualTimerCss(INNER_ID))
}

/**
 * 設定変更時のハンドラ（中央ディスパッチャから呼び出される）
 * - master トグルの変更で表示/非表示を切り替える
 * - master が有効で、visualTimer 関連の設定が変わったら再描画する
 */
export const handleVisualTimerSettingsChanged = async (
    newSet: LSPluginBaseInfo["settings"],
    oldSet: LSPluginBaseInfo["settings"]
): Promise<void> => {
    if (oldSet[settingKeys.visualTimer.master] !== newSet[settingKeys.visualTimer.master]) {
        if (newSet[settingKeys.visualTimer.master] === true) main()
        else {
            unmountVisualTimer()
            removeContainer(CONTAINER_ID)
        }
        return
    }

    if (newSet[settingKeys.visualTimer.master] === true && hasVisualTimerSettingsChanged(oldSet, newSet)) {
        refreshIfMounted()
    }
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
