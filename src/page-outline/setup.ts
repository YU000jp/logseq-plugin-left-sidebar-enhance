import { LSPluginBaseInfo } from "@logseq/libs/dist/LSPlugin.user"
import { t } from "logseq-l10n"
import { booleanLogseqVersionMd, getCurrentPageOriginalName } from ".."
import { headerCommand } from "../headerCommand"
import { createElementWithAttributes } from "../util/domUtils"
import { removeContainer } from "../util/lib"
import { refreshPageHeaders } from "./pageHeaders"
import { routeCheck } from "./routeCheck"
import tocCSS from "./toc.css?inline"
import { settingKeys } from '../settings/keys'


// プラグイン起動後、5秒間はロックをかける
let processing = true
export const setupTOCHandlers = (versionMd: boolean) => {

    setTimeout(() => {
        // 設定変更は中央ディスパッチャで処理するため、ここでは登録しない。
        // Graph 変更は従来どおり登録する。
        logseq.App.onCurrentGraphChanged(async () => {
            routeCheck(versionMd)//グラフ変更時に実行
        })
    }, 5000)

    if (logseq.settings?.[settingKeys.toc.master] === true)
        renderTOCContainer()

    logseq.provideStyle(tocCSS + (versionMd === false ? `
    #main-content-container div.ls-page-blocks { 
        overflow: visible;
    }
    #left-container {
        display: unset;
        position: static;
    }
        `: ""))

    //プラグイン起動時
    setTimeout(() => {
        routeCheck(versionMd)
    }, 200)

    //ページ読み込み時に実行コールバック
    logseq.App.onRouteChanged(async () => {
        await routeCheck(versionMd)
    })

    //ヘッダー挿入コマンド
    headerCommand()

}

/**
 * 設定変更時のハンドラ（中央ディスパッチャから呼び出される）
 */
export const handleTocSettingsChanged = async (newSet: LSPluginBaseInfo['settings'], oldSet: LSPluginBaseInfo['settings']): Promise<void> => {
    if (processing) return
    if (oldSet[settingKeys.toc.master] !== newSet[settingKeys.toc.master]) {
        if (newSet[settingKeys.toc.master] === true)
            renderTOCContainer()//表示する
        else
            removeContainer("lse-toc-container")//消す
    }
    if ((oldSet[settingKeys.toc.tocRemoveWordList] !== newSet[settingKeys.toc.tocRemoveWordList])
        || (oldSet[settingKeys.toc.booleanAsZoomPage] !== newSet[settingKeys.toc.booleanAsZoomPage]))
        await refreshPageHeaders(getCurrentPageOriginalName()) //更新

}



const renderTOCContainer = () => {
    const versionMd = booleanLogseqVersionMd()
    if (parent.document.getElementById("lse-toc-container"))
        removeContainer("lse-toc-container")//すでに存在する場合は削除する

    setTimeout(async () => {
        //左サイドバーのnav-contents-containerにスペースを追加する
        const navEle = parent.document.querySelector(versionMd === true ? "#left-sidebar>div.left-sidebar-inner div.nav-contents-container" : "#left-sidebar>div.left-sidebar-inner div.sidebar-contents-container") as HTMLDivElement || null
        if (navEle === null) return //nullの場合はキャンセル

        const divAsItemEle = createElementWithAttributes("div", {
            class: "nav-content-item mt-3 is-expand flex-shrink-0",
            id: "lse-toc-container",
        })
        const detailsEle = createElementWithAttributes("details", {
            class: "nav-content-item-inner",
            open: "true",
        })
        const summaryEle = createElementWithAttributes("summary", {
            class: "header items-center",
            title: "Left Sidebar Enhance " + t("plugin"),
        })
        summaryEle.innerText = t("Page Outline")
        const containerEle = createElementWithAttributes("div", {
            class: "bd",
            id: "lse-toc-inner",
        })

        detailsEle.appendChild(summaryEle)
        detailsEle.appendChild(containerEle)
        divAsItemEle.appendChild(detailsEle)
        navEle.appendChild(divAsItemEle)

        //コンテナーをセットする
        setTimeout(() => {
            const containerEle: HTMLDivElement | null = parent.document.getElementById("lse-toc-inner") as HTMLDivElement | null
            if (containerEle === null) return //nullの場合はキャンセル
            if (containerEle.dataset.flag !== "true") {//すでに存在する場合はキャンセル
                const divEle = createElementWithAttributes("div", {
                    id: "lse-toc-content",
                })
                containerEle.appendChild(divEle)
            }
            containerEle.dataset.flag = "true" //フラグを立てる
        }, 1)
    }, 500)
}
