import '@logseq/libs' //https://plugins-doc.logseq.com/
import { AppInfo, BlockEntity, PageEntity } from '@logseq/libs/dist/LSPlugin'
import { loadFavAndRecent } from './favAndRecent'
import { loadShowByMouseOver } from './mouseover'
import { refreshPageHeaders } from './page-outline/pageHeaders'
import { setupTOCHandlers } from './page-outline/setup'
import { settingsTemplate } from './settings'
import { settingKeys } from './settings/keys'
import { initSettingsDispatcher } from './settings/onSettingsChanged'
import { removeContainer } from './util/lib'
import { loadVisualTimer } from './visualTimer'
import { loadLogseqL10n } from "./translations/l10nSetup" //https://github.com/sethyuan/logseq-l10n
import { initHeadingNumbering, applyHeadingNumbersToPage, cleanupHeadingNumbering } from './heading-numbering'
import { removeToolbarIcon, updateToolbarIcon } from './heading-numbering/toolbarIcon'

let currentPageOriginalName: PageEntity["originalName"] = ""
// let currentPageUuid: PageEntity["uuid"] = ""
let logseqVersion: string = ""//バージョンチェック用
let logseqVersionMd: boolean = false//バージョンチェック用

// export const getLogseqVersion = () => logseqVersion //バージョンチェック用
export const booleanLogseqVersionMd = () => logseqVersionMd //バージョンチェック用

export const updateCurrentPage = async (pageName: string, pageUuid: PageEntity["uuid"]) => {
  currentPageOriginalName = pageName
  // currentPageUuid = pageUuid
}

export const getCurrentPageOriginalName = () => currentPageOriginalName // 現在のページ名を取得
// export const getCurrentPageUuid = () => currentPageUuid // 現在のページUUIDを取得



/* main */
const main = async () => {

  //l10n
  // ユーザー設定言語を取得し、L10Nをセットアップ
  const { preferredLanguage, preferredDateFormat } = await loadLogseqL10n()

  // First time settings
  if (!logseq.settings)
    setTimeout(() =>
      logseq.showSettingsUI(), 300)

  logseqVersionMd = await checkLogseqVersion()

  /* user settings */
  // register settings schema based on current settings so dependent fields can be hidden
  logseq.useSettingsSchema(settingsTemplate(logseqVersionMd, logseq.settings ?? undefined))


  // 中央設定ディスパッチャを初期化（各モジュールの設定ハンドラを一箇所で呼ぶ）
  setTimeout(() =>
    initSettingsDispatcher()
    , 500)

  //TOC
  setTimeout(() =>
    setupTOCHandlers(logseqVersionMd)
    , 300)

  //残り時間可視化ビジュアル
  loadVisualTimer()

  //マウスオーバー
  loadShowByMouseOver()

  //お気に入りと履歴の重複を非表示
  loadFavAndRecent()

  //階層的な見出し番号付け
  await initHeadingNumbering()


  //プラグイン終了時
  logseq.beforeunload(async () => {
    removeContainer("lse-toc-container")
    removeContainer("lse-dataSelector-container")
    removeContainer("lse-visualTimer-container")
    removeToolbarIcon()
    cleanupHeadingNumbering()
  })

  logseq.App.onCurrentGraphChanged(async () => {
    //グラフが変更されたときに実行されるコールバック
    currentPageOriginalName = ""
    // currentPageUuid = ""
    logseqVersionMd = await checkLogseqVersion()

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
      || logseq.settings!.booleanLeftTOC === false)
      return
    //headingがあるブロックが更新されたら
    const findBlock = blocks.find((block) => block.properties?.heading) as { uuid: BlockEntity["uuid"] } | null //uuidを得るためsomeではなくfindをつかう
    if (!findBlock) return
    const uuid = findBlock ? findBlock!.uuid : null
    updateToc()

    setTimeout(() => {
      //ブロック更新のコールバックを登録する
      if (uuid)
        logseq.DB.onBlockChanged(uuid, () => updateToc())
    }, 200)

  })
}


const updateToc = () => {
  if (processingBlockChanged === true)
    return
  processingBlockChanged = true //index.tsの値を書き換える
  setTimeout(() => {
    refreshPageHeaders(currentPageOriginalName) //toc更新
    processingBlockChanged = false
  }, 300)
}



let processingOnPageChanged: boolean = false //処理中

//ページ読み込み時に実行コールバック
export const onPageChangedCallback = async (pageName: string, flag?: { zoomIn: boolean, zoomInUuid: BlockEntity["uuid"] }) => {

  if (processingOnPageChanged === true)
    return
  processingOnPageChanged = true // return 禁止

  setTimeout(() =>
    processingOnPageChanged = false, 300) //処理中断対策

  setTimeout(async () => {
    // console.log("onPageChangedCallback")
    if (logseq.settings?.[settingKeys.toc.master] === true)
      await refreshPageHeaders(pageName, flag ? flag : undefined)

    // Update toolbar icon for heading numbering
    if (logseqVersionMd === true) updateToolbarIcon(pageName)

    // Apply file-update mode if enabled and page is active
    if (logseq.settings?.[settingKeys.toc.headingNumberFileEnable] === true) {
      await applyHeadingNumbersToPage(pageName)
    }
  }, 50)

}


// バージョンチェック
const checkLogseqVersion = async (): Promise<boolean> => {
  const logseqInfo = await logseq.App.getInfo("version") as AppInfo | any
  //  0.11.0もしくは0.11.0-alpha+nightly.20250427のような形式なので、先頭の3つの数値(1桁、2桁、2桁)を正規表現で取得する
  const version = logseqInfo.match(/(\d+)\.(\d+)\.(\d+)/)
  if (version) {
    logseqVersion = version[0] //バージョンを取得
    // console.log("logseq version: ", logseqVersion)

    // もし バージョンが0.10.*系やそれ以下ならば、logseqVersionMdをtrueにする
    if (logseqVersion.match(/0\.([0-9]|10)\.\d+/)) {
      logseqVersionMd = true
      // console.log("logseq version is 0.10.* or lower")
      return true
    } else
      logseqVersionMd = false
  } else
    logseqVersion = "0.0.0"
  return false
}


logseq.ready(main).catch(console.error)