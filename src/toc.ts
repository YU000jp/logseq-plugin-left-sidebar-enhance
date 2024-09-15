import { BlockEntity, LSPluginBaseInfo, PageEntity } from "@logseq/libs/dist/LSPlugin.user"
import { t } from "logseq-l10n"
import { removeContainer } from "./lib"
import { currentPageOriginalName, onPageChangedCallback, updateCurrentPage } from "."
import tocCSS from "./toc.css?inline"
import { whenOpenJournals } from "./tocJournals"
import { headerCommand } from "./headerCommand"
import { displayToc } from "./tocProcess"

export const loadTOC = () => {

    //プラグイン設定変更時
    logseq.onSettingsChanged(async (newSet: LSPluginBaseInfo['settings'], oldSet: LSPluginBaseInfo['settings']) => {
        if (oldSet.booleanLeftTOC !== newSet.booleanLeftTOC) {
            if (newSet.booleanLeftTOC === true)
                main()//表示する
            else
                removeContainer("lse-toc-container")//消す
        }
        if ((oldSet.tocRemoveWordList !== newSet.tocRemoveWordList)
            || (oldSet.booleanAsZoomPage !== newSet.booleanAsZoomPage))
            displayToc(currentPageOriginalName) //更新

    })

    if (logseq.settings!.booleanLeftTOC === true)
        main()

    logseq.provideStyle(tocCSS)

    //プラグイン起動時
    setTimeout(() => {
        routeCheck()
    }, 200)

    //ページ読み込み時に実行コールバック
    logseq.App.onRouteChanged(async () => {
        await routeCheck()
    })
    // logseq.App.onPageHeadActionsSlotted(async () => {//動作保証のため、2つとも必要
    //     await routeCheck()
    // })

    //ヘッダー挿入コマンド
    headerCommand()
}


const main = () => {
    if (parent.document.getElementById("lse-toc-container"))
        removeContainer("lse-toc-container")//すでに存在する場合は削除する

    setTimeout(async () => {
        //左サイドバーのnav-contents-containerにスペースを追加する
        const navEle: HTMLDivElement | null = parent.document.querySelector("div#main-container div#left-sidebar>div.left-sidebar-inner div.nav-contents-container") as HTMLDivElement | null
        if (navEle === null) return //nullの場合はキャンセル

        const divAsItemEle: HTMLDivElement = document.createElement("div")
        divAsItemEle.className = "nav-content-item mt-3 is-expand flex-shrink-0"
        divAsItemEle.id = "lse-toc-container"
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

let processingRoot = false
const routeCheck = async () => {
    if (processingRoot) return
    processingRoot = true
    setTimeout(() =>
        processingRoot = false, 100)
    const currentPage = await logseq.Editor.getCurrentPage() as PageEntity | BlockEntity | null //現在のページ名を取得
    if (currentPage) {
        if (currentPage.originalName) {
            updateCurrentPage((currentPage as PageEntity).originalName, (currentPage as PageEntity).uuid)
            onPageChangedCallback((currentPage as PageEntity).originalName)
        }
        else
            if (currentPage.page) {
                const pageEntity = await logseq.Editor.getPage((currentPage as BlockEntity).page.id) as { originalName: PageEntity["originalName"], uuid: PageEntity["uuid"] } | null
                if (pageEntity) {
                    updateCurrentPage(pageEntity.originalName, pageEntity.uuid)
                    onPageChangedCallback(pageEntity.originalName, { zoomIn: true, zoomInUuid: currentPage.uuid })
                }
            }
    } else {
        const journalsEle = parent.document.getElementById("journals") as HTMLDivElement | null
        if (journalsEle)
            whenOpenJournals(journalsEle)
        else {
            //"lse-toc-content"に代わりのメッセージを入れる(クリアも兼ねている)
            const element = parent.document.getElementById("lse-toc-content") as HTMLDivElement | null
            if (element)
                element.innerHTML = t("No headers found")
        }
    }
}
