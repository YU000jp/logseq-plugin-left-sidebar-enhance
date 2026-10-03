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
import { initHeadingNumbering, applyHeadingNumbersToPage, refreshFileBasedGraphFlag } from './heading-numbering'
import { removeToolbarIcon, updateToolbarIcon } from './heading-numbering/toolbarIcon'
import { initAutoHeadingLevel } from './auto-heading-level'

let currentPageOriginalName: PageEntity["originalName"] = ""
// let currentPageUuid: PageEntity["uuid"] = ""
let logseqVersion: string = ""//バージョンチェック用
let logseqVersionMd: boolean = false//現在のグラフがファイルベースか(= !isDbGraph)
let logseqDbEraApp: boolean = false//アプリ世代判定用(新UI = 0.11+/2.x)。DOM/CSS分岐に使用

// export const getLogseqVersion = () => logseqVersion //バージョンチェック用
export const booleanLogseqVersionMd = () => logseqVersionMd //現在のグラフがファイルベースか
export const booleanDbEraApp = () => logseqDbEraApp //アプリが新UI世代(DB版系統)か。DOM/CSS分岐用

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

  // アプリ情報(世代判定用)とグラフ種別を検出
  const appInfo = await fetchAppInfo()
  logseqVersion = appInfo.version
  logseqDbEraApp = appInfo.isDbEra
  logseqVersionMd = !(await checkLogseqDbGraph()) //現在のグラフがファイルベース = !isDbGraph

  /* user settings */
  // register settings schema based on current settings so dependent fields can be hidden
  logseq.useSettingsSchema(settingsTemplate(logseqVersionMd, logseq.settings ?? undefined))


  // 中央設定ディスパッチャを初期化（各モジュールの設定ハンドラを一箇所で呼ぶ）
  setTimeout(() =>
    initSettingsDispatcher()
    , 500)

  //TOC
  setTimeout(() =>
    setupTOCHandlers()
    , 300)

  //残り時間可視化ビジュアル
  loadVisualTimer()

  //マウスオーバー
  loadShowByMouseOver()

  //お気に入りと履歴の重複を非表示
  loadFavAndRecent()

  //階層的な見出し番号付け
  await initHeadingNumbering()

  //見出しレベルの自動調整
  initAutoHeadingLevel()


  //プラグイン終了時
  logseq.beforeunload(async () => {
    removeContainer("lse-toc-container")
    removeContainer("lse-dataSelector-container")
    removeContainer("lse-visualTimer-container")
    removeToolbarIcon()
  })

  logseq.App.onCurrentGraphChanged(async () => {
    //グラフが変更されたときに実行されるコールバック
    currentPageOriginalName = ""
    // currentPageUuid = ""
    // グラフ種別を再検出し、ファイルグラフフラグを更新する
    const newVersionMd = !(await checkLogseqDbGraph())
    if (newVersionMd !== logseqVersionMd) {
      logseqVersionMd = newVersionMd
      // ファイルグラフ向け設定項目の表示/非表示を更新するためスキーマを再適用
      logseq.useSettingsSchema(settingsTemplate(logseqVersionMd, logseq.settings ?? undefined))
      // heading-numbering 側のファイルグラフ判定も更新
      await refreshFileBasedGraphFlag()
    }

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


// アプリ情報取得(バージョン解析・アプリ世代判定用。グラフ種別には使わない)
const fetchAppInfo = async (): Promise<{ version: string; isDbEra: boolean }> => {
  const info = await logseq.App.getInfo() as AppInfo | null
  const version = typeof info?.version === "string" ? info.version : "0.0.0"
  // 0.11.0もしくは0.11.0-alpha+nightly.20250427のような形式なので、先頭の3つの数値(1桁、2桁、2桁)を正規表現で取得する
  const m = version.match(/(\d+)\.(\d+)\.(\d+)/)
  // DB系世代(新UI): 2.x もしくは移行期の0.11.x。OG 1.xは旧UI系統(MD側)として扱う
  const isDbEra = m ? (Number(m[1]) >= 2 || (Number(m[1]) === 0 && Number(m[2]) >= 11)) : false
  return { version: m ? m[0] : version, isDbEra }
}

// グラフ種別判定(公式API。0.10.xホストでは未実装 → false = 旧アプリはDBグラフを開けない)
const checkLogseqDbGraph = async (): Promise<boolean> => {
  try {
    const value = await (logseq.App as any).checkCurrentIsDbGraph()
    return typeof value === "boolean" ? value : false
  } catch {
    return false
  }
}


logseq.ready(main).catch(console.error)
