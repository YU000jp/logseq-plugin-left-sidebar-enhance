import { LSPluginBaseInfo } from "@logseq/libs/dist/LSPlugin.user"
import { t } from "logseq-l10n"
import { booleanLogseqVersionMd, getCurrentPageOriginalName } from ".."
import { headerCommand } from "../headerCommand"
import { createElementWithAttributes } from "../util/domUtils"
import { removeContainer } from "../util/lib"
import { refreshPageHeaders } from "./pageHeaders"
import { routeCheck } from "./routeCheck"
import tocCSS from "./toc.css?inline"


// プラグイン起動後、5秒間はロックをかける
let processing = true
export const setupTOCHandlers = (versionMd: boolean) => {

    setTimeout(() => {
        //プラグイン設定変更時
        logseq.onSettingsChanged(async (newSet: LSPluginBaseInfo['settings'], oldSet: LSPluginBaseInfo['settings']) => {
            if (processing) return
            if (oldSet.booleanLeftTOC !== newSet.booleanLeftTOC) {
                if (newSet.booleanLeftTOC === true)
                    renderTOCContainer()//表示する
                else
                    removeContainer("lse-toc-container")//消す
            }
            if ((oldSet.tocRemoveWordList !== newSet.tocRemoveWordList)
                || (oldSet.booleanAsZoomPage !== newSet.booleanAsZoomPage))
                await refreshPageHeaders(getCurrentPageOriginalName()) //更新

        })
        logseq.App.onCurrentGraphChanged(async () => {
            routeCheck(versionMd)//グラフ変更時に実行
        })
    }, 5000)

    if (logseq.settings!.booleanLeftTOC === true)
        renderTOCContainer()

    logseq.provideStyle(tocCSS)

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
        summaryEle.innerText = t("Table of Contents")
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
