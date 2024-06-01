import '@logseq/libs' //https://plugins-doc.logseq.com/
import { setup as l10nSetup } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import { loadDateSelector } from './dateSelector'
import { loadShowByMouseOver } from './mouseover'
import { settingsTemplate } from './settings'
import ja from "./translations/ja.json"
import { loadTOC } from './toc'

/* main */
const main = async () => {
  await l10nSetup({ builtinTranslations: { ja } })
  /* user settings */
  logseq.useSettingsSchema(settingsTemplate())
  if (!logseq.settings)
    setTimeout(() =>
      logseq.showSettingsUI(), 300)

  //マウスオーバー
  loadShowByMouseOver()

  //日付セレクター
  loadDateSelector()

  //TOC
  loadTOC()

}/* end_main */

logseq.ready(main).catch(console.error)