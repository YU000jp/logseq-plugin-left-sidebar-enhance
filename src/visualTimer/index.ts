import { LSPluginBaseInfo } from "@logseq/libs/dist/LSPlugin.user"
import { t } from "logseq-l10n"
import { settingKeys } from "../settings/keys"
import { removeContainer } from "../util/lib"
import { getVisualTimerConfig } from "./config"
import { CONTAINER_ID, INNER_ID } from "./constants"
import { getVisualTimerCss } from "./styles"
import { mountVisualTimer, unmountVisualTimer } from "./ui"
import { createVisualTimerContainer } from "./shared"

const hasVisualTimerSettingsChanged = (
             oldSet: LSPluginBaseInfo["settings"],
             newSet: LSPluginBaseInfo["settings"]
): boolean => {
             const oldCfg = getVisualTimerConfig(oldSet)
             const newCfg = getVisualTimerConfig(newSet)
             // Day-window: only compare hours when enabled; toggling enable always triggers
             if (oldCfg.enableDayWindow !== newCfg.enableDayWindow) return true
             if (newCfg.enableDayWindow) {
                          if (oldCfg.dayWindowStartHour !== newCfg.dayWindowStartHour) return true
                          if (oldCfg.dayWindowEndHour !== newCfg.dayWindowEndHour) return true
             }

             // Weekday feature removed

             // Target date: only compare date when enabled; toggling enable always triggers
             if (oldCfg.enableTargetDate !== newCfg.enableTargetDate) return true
             if (newCfg.enableTargetDate) {
                          const oldTime = oldCfg.targetDate ? oldCfg.targetDate.getTime() : null
                          const newTime = newCfg.targetDate ? newCfg.targetDate.getTime() : null
                          if (oldTime !== newTime) return true
             }

             return false
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
): Promise<boolean> => {
             if (oldSet[settingKeys.visualTimer.master] !== newSet[settingKeys.visualTimer.master]) {
                          if (newSet[settingKeys.visualTimer.master] === true) main()
                          else {
                                       unmountVisualTimer()
                                       removeContainer(CONTAINER_ID)
                          }
                          return true
             }

             const changed = hasVisualTimerSettingsChanged(oldSet, newSet)
             if (changed && newSet[settingKeys.visualTimer.master] === true)
                          refreshIfMounted()

             return changed
}

const main = () => {
             if (parent.document.getElementById(CONTAINER_ID)) removeContainer(CONTAINER_ID)

             setTimeout(async () => {
                          const navEle: HTMLDivElement | null =
                                       (parent.document.querySelector(
                                                    "#left-sidebar>div.left-sidebar-inner div.nav-contents-container"
                                       ) as HTMLDivElement) || null

                          if (navEle === null) return

                          const inner = createVisualTimerContainer(
                                       navEle,
                                       CONTAINER_ID,
                                       INNER_ID,
                                       t("Visual Timer"),
                                       () => {
                                                    try {
                                                                 // @ts-ignore
                                                                 if (typeof logseq?.showSettingsUI === "function") logseq.showSettingsUI()
                                                    } catch (e) {
                                                                 // ignore
                                                    }
                                       }
                          )

                          setTimeout(() => {
                                       if (!inner) return
                                       if (inner.dataset.flag !== "true") mountVisualTimer(inner)
                                       inner.dataset.flag = "true"
                          }, 1)
             }, 500)
}
