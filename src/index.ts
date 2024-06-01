import '@logseq/libs' //https://plugins-doc.logseq.com/
import { setup as l10nSetup } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import { loadDateSelector } from './dateSelector'
import { loadShowByMouseOver } from './mouseover'
import { settingsTemplate } from './settings'
import ja from "./translations/ja.json"
import { loadTOC } from './toc'
import { BlockEntity, PageEntity } from '@logseq/libs/dist/LSPlugin'
import { displayToc } from './tocProcess'
let currentPageName: string = ""

/* main */
const main = async () => {
  await l10nSetup({ builtinTranslations: { ja } })
  /* user settings */
  logseq.useSettingsSchema(settingsTemplate())
  if (!logseq.settings)
    setTimeout(() =>
      logseq.showSettingsUI(), 300)

  //TOC
  loadTOC()
  //日付セレクター
  loadDateSelector()
  //マウスオーバー
  loadShowByMouseOver()

}/* end_main */

let processingBlockChanged: boolean = false//処理中 TOC更新中にブロック更新が発生した場合に処理を中断する
export let onBlockChangedOnce: boolean = false//一度のみ
export const onBlockChanged = () => {
  if (onBlockChangedOnce === true)
    return
  onBlockChangedOnce = true //index.tsの値を書き換える
  logseq.DB.onChanged(async ({ blocks }) => {
    if (processingBlockChanged === true
      || currentPageName === ""
      || logseq.settings!.booleanTableOfContents === false)
      return
    //headingがあるブロックが更新されたら
    const findBlock = blocks.find((block) => block.properties?.heading) as { uuid: BlockEntity["uuid"] } | null //uuidを得るためsomeではなくfindをつかう
    if (!findBlock) return
    const uuid = findBlock ? findBlock!.uuid : null
    updateToc()

    setTimeout(() => {
      //ブロック更新のコールバックを登録する
      if (uuid)
        logseq.DB.onBlockChanged(uuid, async () => updateToc())
    }, 200)

  })
}


const updateToc = () => {
  if (processingBlockChanged === true)
    return
  processingBlockChanged = true //index.tsの値を書き換える
  setTimeout(async () => {
    await displayToc(currentPageName) //toc更新
    processingBlockChanged = false
  }, 300)
}

let processingOnPageChanged: boolean = false //処理中
//ページ読み込み時に実行コールバック
export const onPageChangedCallback = async () => {

  if (processingOnPageChanged === true)
    return
  processingOnPageChanged = true // return 禁止
  
  setTimeout(() =>
    processingOnPageChanged = false, 300) //処理中断対策

  setTimeout(async () => {
    if (logseq.settings!.booleanLeftTOC === true) {
      const current = await logseq.Editor.getCurrentPage() as { originalName: PageEntity["originalName"] } | null
      if (current) {
        currentPageName = current.originalName
        displayToc(currentPageName)
      }
    }
  }, 50)

}

logseq.ready(main).catch(console.error)

