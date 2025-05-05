import { LSPluginBaseInfo } from "@logseq/libs/dist/LSPlugin.user"
import { t } from "logseq-l10n"
import { booleanLogseqVersionMd, getCurrentPageOriginalName } from ".."
import { headerCommand } from "../headerCommand"
import { createElementWithAttributes } from "../util/domUtils"
import { removeContainer } from "../util/lib"
import tocCSS from "./toc.css?inline"
import { displayToc } from "./headerList"
import { routeCheck } from "./routeCheck"


// プラグイン起動後、5秒間はロックをかける
let processing = true
export const loadTOC = (versionMd: boolean) => {

    setTimeout(() => {
        //プラグイン設定変更時
        logseq.onSettingsChanged(async (newSet: LSPluginBaseInfo['settings'], oldSet: LSPluginBaseInfo['settings']) => {
            if (processing) return
            if (oldSet.booleanLeftTOC !== newSet.booleanLeftTOC) {
                if (newSet.booleanLeftTOC === true)
                    main()//表示する
                else
                    removeContainer("lse-toc-container")//消す
            }
            if ((oldSet.tocRemoveWordList !== newSet.tocRemoveWordList)
                || (oldSet.booleanAsZoomPage !== newSet.booleanAsZoomPage))
                await displayToc(getCurrentPageOriginalName()) //更新

        })
        logseq.App.onCurrentGraphChanged(async () => {
            routeCheck(versionMd)//グラフ変更時に実行
        })
    }, 5000)

    if (logseq.settings!.booleanLeftTOC === true)
        main()

    logseq.provideStyle(tocCSS)

    //プラグイン起動時
    setTimeout(() => {
        routeCheck(versionMd)
    }, 200)

    //ページ読み込み時に実行コールバック
    logseq.App.onRouteChanged(async () => {
        await routeCheck(versionMd)
    })
    // logseq.App.onPageHeadActionsSlotted(async () => {//動作保証のため、2つとも必要
    //     await routeCheck()
    // })

    //ヘッダー挿入コマンド
    headerCommand()

}



const main = () => {
    const versionMd = booleanLogseqVersionMd()
    if (parent.document.getElementById("lse-toc-container"))
        removeContainer("lse-toc-container")//すでに存在する場合は削除する

    setTimeout(async () => {
        //左サイドバーのnav-contents-containerにスペースを追加する
        const navEle = parent.document.querySelector(versionMd === true ? "#left-sidebar>div.left-sidebar-inner div.nav-contents-container" : "#left-sidebar>div.left-sidebar-inner div.sidebar-contents-container") as HTMLDivElement || null
        if (navEle === null) return //nullの場合はキャンセル

        const divAsItemEle: HTMLElement = createElementWithAttributes("div", {
            class: "nav-content-item mt-3 is-expand flex-shrink-0",
            id: "lse-toc-container",
        })
        const detailsEle: HTMLDetailsElement = document.createElement("details")
        detailsEle.className = "nav-content-item-inner"
        detailsEle.open = true
        const summaryEle: HTMLElement = document.createElement("summary")
        summaryEle.className = "header items-center"
        summaryEle.style.cursor = "row-resize"
        summaryEle.style.backgroundColor = "var(--ls-tertiary-background-color)"
        summaryEle.innerText = t("Table of Contents")// タイトルを入れる
        summaryEle.title = "Left Sidebar Enhance " + t("plugin")//プラグイン名を入れる
        const containerEle: HTMLDivElement = document.createElement("div")
        containerEle.className = "bd"
        containerEle.id = "lse-toc-inner"
        detailsEle.appendChild(summaryEle)
        detailsEle.appendChild(containerEle)
        divAsItemEle.appendChild(detailsEle)
        navEle.appendChild(divAsItemEle)

        //コンテナーをセットする
        setTimeout(() => {
            const containerEle: HTMLDivElement | null = parent.document.getElementById("lse-toc-inner") as HTMLDivElement | null
            if (containerEle === null) return //nullの場合はキャンセル
            if (containerEle.dataset.flag !== "true") {//すでに存在する場合はキャンセル
                const divEle = document.createElement("div")
                divEle.id = "lse-toc-content"
                containerEle.appendChild(divEle)
            }
            containerEle.dataset.flag = "true" //フラグを立てる
        }, 1)
    }, 500)
}
