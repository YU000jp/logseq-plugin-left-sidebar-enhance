import '@logseq/libs' //https://plugins-doc.logseq.com/
import { BlockEntity, PageEntity } from '@logseq/libs/dist/LSPlugin'
import { setup as l10nSetup } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import { loadDateSelector } from './dateSelector'
import { loadFavAndRecent } from './favAndRecent'
import { removeContainer } from './lib'
import { loadShowByMouseOver } from './mouseover'
import { settingsTemplate } from './settings'
import { loadTOC } from './toc'
import { displayToc } from './tocProcess'
import ja from "./translations/ja.json"
export let currentPageOriginalName: PageEntity["originalName"] = ""
export let currentPageUuid: PageEntity["uuid"] = ""

export const updateCurrentPage = async (pageName: string, pageUuid: PageEntity["uuid"]) => {
  currentPageOriginalName = pageName
  currentPageUuid = pageUuid
}



/* main */
const main = async () => {


  //l10n
  await l10nSetup({ builtinTranslations: { ja } })

  /* user settings */
  logseq.useSettingsSchema(settingsTemplate())

  // First time settings
  if (!logseq.settings)
    setTimeout(() =>
      logseq.showSettingsUI(), 300)


  //TOC
  loadTOC()

  //日付セレクター
  loadDateSelector()

  //マウスオーバー
  loadShowByMouseOver()

  //お気に入りと履歴の重複を非表示
  loadFavAndRecent()


  //プラグイン終了時
  logseq.beforeunload(async () => {
    removeContainer("lse-toc-container")
    removeContainer("lse-dataSelector-container")
  })

}/* end_main */



let processingBlockChanged: boolean = false//処理中 TOC更新中にブロック更新が発生した場合に処理を中断する

export let onBlockChangedOnce: boolean = false//一度のみ
export const onBlockChanged = () => {

  if (onBlockChangedOnce === true)
    return
  onBlockChangedOnce = true //index.tsの値を書き換える
  logseq.DB.onChanged(async ({ blocks }) => {

    if (processingBlockChanged === true
      || currentPageOriginalName === ""
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
    await displayToc(currentPageOriginalName) //toc更新
    processingBlockChanged = false
  }, 300)
}


let processingOnPageChanged: boolean = false //処理中

//ページ読み込み時に実行コールバック
export const onPageChangedCallback = async (pageName: string) => {

  if (processingOnPageChanged === true)
    return
  processingOnPageChanged = true // return 禁止

  setTimeout(() =>
    processingOnPageChanged = false, 300) //処理中断対策

  setTimeout(async () => {
    if (logseq.settings!.booleanLeftTOC === true)
      displayToc(pageName)
  }, 50)

}

logseq.ready(main).catch(console.error)