import '@logseq/libs' //https://plugins-doc.logseq.com/
import { createApp } from 'vue'
import App from './components/vue/App.vue'
import { AppInfo, BlockEntity, PageEntity } from '@logseq/libs/dist/LSPlugin'
import { setup as l10nSetup } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import { loadShowByMouseOver } from './mouseover'
import { loadFavAndRecent } from './favAndRecent'
import { settingsTemplate } from './settings'
import ja from "./translations/ja.json"
import { removeContainer } from './util/lib'

// Global state
let vueApp: any = null
let appInstance: any = null
let currentPageOriginalName: PageEntity["originalName"] = ""
let logseqVersion: string = ""
let logseqVersionMd: boolean = false

// Export functions for compatibility with existing code
export const booleanLogseqVersionMd = () => logseqVersionMd
export const updateCurrentPage = async (pageName: string, pageUuid: PageEntity["uuid"]) => {
  currentPageOriginalName = pageName
  if (appInstance) {
    appInstance.updateCurrentPage(pageName, pageUuid)
  }
}
export const getCurrentPageOriginalName = () => currentPageOriginalName

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

  logseqVersionMd = await checkLogseqVersion()

  // Initialize Vue application
  const appElement = document.getElementById('app')
  if (appElement) {
    vueApp = createApp(App)
    appInstance = vueApp.mount(appElement)
    
    // Set initial values
    if (appInstance) {
      appInstance.setLogseqVersionMd(logseqVersionMd)
      appInstance.updateSettings(logseq.settings || {})
    }
  }

  //マウスオーバー機能
  loadShowByMouseOver()

  //お気に入りと履歴の重複を非表示
  loadFavAndRecent()

  //プラグイン終了時
  logseq.beforeunload(async () => {
    removeContainer("lse-toc-container")
    removeContainer("lse-dataSelector-container")
    if (vueApp) {
      vueApp.unmount()
    }
  })

  logseq.App.onCurrentGraphChanged(async () => {
    //グラフが変更されたときに実行されるコールバック
    currentPageOriginalName = ""
    logseqVersionMd = await checkLogseqVersion()
    if (appInstance) {
      appInstance.setLogseqVersionMd(logseqVersionMd)
    }
  })
}

// Block change handling for TOC updates  
let processingBlockChanged: boolean = false
export let onBlockChangedOnce: boolean = false

export const onBlockChanged = () => {
  if (onBlockChangedOnce === true)
    return
  onBlockChangedOnce = true
  
  logseq.DB.onChanged(async ({ blocks }) => {
    if (processingBlockChanged === true
      || currentPageOriginalName === ""
      || logseq.settings!.booleanTableOfContents === false)
      return
    
    const findBlock = blocks.find((block) => block.properties?.heading) as { uuid: BlockEntity["uuid"] } | null
    if (!findBlock) return
    
    const uuid = findBlock ? findBlock!.uuid : null
    updateToc()

    setTimeout(() => {
      if (uuid)
        logseq.DB.onBlockChanged(uuid, () => updateToc())
    }, 200)
  })
}

const updateToc = () => {
  if (processingBlockChanged === true)
    return
  processingBlockChanged = true
  
  setTimeout(() => {
    // Trigger TOC update through Vue instance
    if (appInstance && currentPageOriginalName) {
      appInstance.updateCurrentPage(currentPageOriginalName, "")
    }
    processingBlockChanged = false
  }, 300)
}

let processingOnPageChanged: boolean = false

//ページ読み込み時に実行コールバック
export const onPageChangedCallback = async (pageName: string, flag?: { zoomIn: boolean, zoomInUuid: BlockEntity["uuid"] }) => {
  if (processingOnPageChanged === true)
    return
  processingOnPageChanged = true

  setTimeout(() =>
    processingOnPageChanged = false, 300)

  setTimeout(async () => {
    if (logseq.settings!.booleanLeftTOC === true) {
      await updateCurrentPage(pageName, "")
    }
  }, 50)
}

// バージョンチェック
const checkLogseqVersion = async (): Promise<boolean> => {
  const logseqInfo = await logseq.App.getInfo("version") as AppInfo | any
  const version = logseqInfo.match(/(\d+)\.(\d+)\.(\d+)/)
  
  if (version) {
    logseqVersion = version[0]
    if (logseqVersion.match(/0\.([0-9]|10)\.\d+/)) {
      logseqVersionMd = true
      return true
    } else
      logseqVersionMd = false
  } else
    logseqVersion = "0.0.0"
  return false
}

logseq.ready(main).catch(console.error)