import { BlockEntity, LSPluginBaseInfo, PageEntity } from "@logseq/libs/dist/LSPlugin.user"
import { t } from "logseq-l10n"
import { booleanLogseqVersionMd, getCurrentPageOriginalName, onPageChangedCallback, updateCurrentPage } from "."
import { headerCommand } from "./headerCommand"
import { removeContainer } from "./lib"
import { getCurrentPageForMd, CurrentCheckPageOrZoom, getCurrentZoomForMd, zoomBlockWhenDb, getPageUuid } from "./query/advancedQuery"
import tocCSS from "./toc.css?inline"
import { whenOpenJournals } from "./tocJournals"
import { displayToc } from "./tocProcess"


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

const routeCheck = async (versionMd: boolean) => {
    if (processingRoot) return
    processingRoot = true
    setTimeout(() =>
        processingRoot = false, 100)

    if (versionMd) {
        // Logseq mdバージョン用

        // ページの場合

        const currentPage = await getCurrentPageForMd() as { originalName: PageEntity["originalName"], uuid: PageEntity["uuid"] } | null
        if (currentPage) {
            updateCurrentPage(currentPage.originalName, currentPage.uuid) // currentPageを更新
            onPageChangedCallback(currentPage.originalName) // ページが変更されたときのコールバック
            return

        } else {

            // 日誌を開いている場合
            const journalsEle = parent.document.getElementById("journals") as HTMLDivElement | null
            if (journalsEle) {
                whenOpenJournals(journalsEle, versionMd) // 日誌のタイトルを取得して表示する
                return
            }

            // ズームの場合
            const currentZoom = await getCurrentZoomForMd() as { uuid: BlockEntity["uuid"], page: { originalName: PageEntity["originalName"], uuid: PageEntity["uuid"] } } | null
            if (currentZoom) {
                updateCurrentPage(currentZoom.page.originalName, currentZoom.page.uuid)
                onPageChangedCallback(currentZoom.page.originalName, { zoomIn: true, zoomInUuid: currentZoom.uuid })
                return
            }

        }

    } else {
        // Logseq dbバージョン用


        const pageOrZoom = await CurrentCheckPageOrZoom() as { check: "page" | "zoom", page?: { title: string, uuid: PageEntity["uuid"] } }
        // md グラフの場合もzoom扱いにする

        if (pageOrZoom.check === "page" && pageOrZoom.page) { // titleが存在する場合はページと認識する

            if (pageOrZoom.page.uuid.startsWith("00000001-")) {
                // 日誌の場合は、今日のページ名が返される

                // 日誌を開いている場合
                setTimeout(() => {
                    const journalsEle = parent.document.getElementById("journals") as HTMLDivElement | null
                    if (journalsEle)
                        whenOpenJournals(journalsEle, versionMd)
                }, 150)

            } else {
                // ページの場合
                updateCurrentPage(pageOrZoom.page.title, pageOrZoom.page.uuid) // currentPageを更新
                onPageChangedCallback(pageOrZoom.page.title) // ページが変更されたときのコールバックへ渡す
                return
            }

        } else
            if (pageOrZoom.check === "zoom") {
                // ズームの場合と、mdグラフの場合もここに入る

                // :current-pageが使えないので、DOMから取得する
                const zoomBlockElement = parent.document.querySelector("#main-content-container div.page>div>div.mb-4+div.ls-page-blocks>div>div.page-blocks-inner>div>div[id]") as HTMLDivElement | null
                if (zoomBlockElement) {
                    const uuid = zoomBlockElement.id
                    const blockParentPage = await zoomBlockWhenDb(uuid) as { uuid: PageEntity["uuid"], title: string } | null
                    if (blockParentPage) {
                        updateCurrentPage(blockParentPage.title, blockParentPage.uuid)
                        onPageChangedCallback(blockParentPage.title, { zoomIn: true, zoomInUuid: uuid })
                        return
                    }
                } else {

                    // mdグラフの場合
                    const pageTitleElement = parent.document.querySelector("#main-content-container div.page h1.page-title>span") as HTMLSpanElement | null
                    if (pageTitleElement) {
                        const pageTitle = pageTitleElement.dataset.ref || pageTitleElement.innerText
                        if (pageTitle) {
                            const pageUuid = await logseq.Editor.getPage(pageTitle) as PageEntity["uuid"] | null // ページのUUIDを取得 ※なぜかクエリーでUUIDが取得できない
                            if (pageUuid) {
                                updateCurrentPage(pageTitle, pageUuid) // currentPageを更新
                                onPageChangedCallback(pageTitle) // ページが変更されたときのコールバックへ渡す
                                return
                            }
                        }
                    }
                }
            }

        // console.log("Not found page or zoom") // ページもズームも見つからない場合は何もしない   


    }
    clearTOC()
}


//"lse-toc-content"に代わりのメッセージを入れる(クリアも兼ねている)
export const clearTOC = () => {
    const element = parent.document.getElementById("lse-toc-content") as HTMLDivElement | null
    if (element)
        element.innerHTML = t("No headers found")
}


