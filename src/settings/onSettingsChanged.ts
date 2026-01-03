import { LSPluginBaseInfo } from '@logseq/libs/dist/LSPlugin.user'
import { handleVisualTimerSettingsChanged } from '../visualTimer'
import { handleTocSettingsChanged } from '../page-outline/setup'
import { handleMouseoverSettingsChanged } from '../mouseover'
import { handleFavAndRecentSettingsChanged } from '../favAndRecent'
import { handleHeadingNumberingSettingsChanged } from '../heading-numbering'
import { settingsTemplate } from '../settings'

/**
 * 中央設定ディスパッチャ
 * - プラグイン内の各機能モジュールは個別に `logseq.onSettingsChanged` を登録せず、
 *   ここで1つだけ登録されたイベントから各モジュールのハンドラを呼び出します。
 * - これにより設定変更の監視ポイントが一箇所にまとまり、保守性と動作の追跡が容易になります。
 */
export const initSettingsDispatcher = () => {
             logseq.onSettingsChanged(async (newSet: LSPluginBaseInfo['settings'], oldSet: LSPluginBaseInfo['settings']) => {
                          // 各ハンドラは独立しているので順次呼び出す（モジュール毎に try/catch）
                          let shouldShowSettings = false

                          try {
                                       const r = await handleVisualTimerSettingsChanged(newSet, oldSet)
                                       if (r === true) shouldShowSettings = true
                          } catch (e) {
                                       console.error('visualTimer settings handler failed', e)
                          }

                          if (shouldShowSettings === false)
                                       try {
                                                    const r = await handleTocSettingsChanged(newSet, oldSet)
                                                    if (r === true) shouldShowSettings = true
                                       } catch (e) {
                                                    console.error('TOC settings handler failed', e)
                                       }

                          if (shouldShowSettings === false)
                                       try {
                                                    await handleMouseoverSettingsChanged(newSet, oldSet)
                                       } catch (e) {
                                                    console.error('mouseover settings handler failed', e)
                                       }

                          if (shouldShowSettings === false)
                                       try {
                                                    await handleFavAndRecentSettingsChanged(newSet, oldSet)
                                       } catch (e) {
                                                    console.error('favAndRecent settings handler failed', e)
                                       }
                          if (shouldShowSettings === false)
                                       // Handle heading numbering settings
                                       try {
                                                    const r = await handleHeadingNumberingSettingsChanged(newSet, oldSet)
                                                    if (r === true) shouldShowSettings = true
                                       } catch (e) {
                                                    console.error('heading numbering settings handler failed', e)
                                       }

                          // 各ハンドラが変更を報告した場合にのみ設定UIを再表示する
                          if (shouldShowSettings) {
                                       logseq.useSettingsSchema(settingsTemplate(newSet))
                                       logseq.hideSettingsUI()
                                       setTimeout(() =>
                                                    logseq.showSettingsUI()
                                                    , 10)
                          }
             })
}

export default initSettingsDispatcher
