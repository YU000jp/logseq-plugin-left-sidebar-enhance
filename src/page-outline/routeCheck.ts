import { BlockEntity, PageEntity } from "@logseq/libs/dist/LSPlugin"
import { onPageChangedCallback, updateCurrentPage } from ".."
import { CurrentCheckPageOrZoom, getCurrentPageForMd, getCurrentZoomForMd, zoomBlockWhenDb } from "../util/query/advancedQuery"
import { clearTOC } from "./DOM"
import { whenOpenJournals } from "./journalsList"


let processingRoot = false

export const routeCheck = async (versionMd: boolean) => {

    if (processingRoot) return
    processingRoot = true
    setTimeout(() => processingRoot = false, 100)


    if (versionMd) {
        // Logseq mdバージョン用
        // ページの場合
        const currentPage = await getCurrentPageForMd() as { originalName: PageEntity["originalName"]; uuid: PageEntity["uuid"] } | null
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
            const currentZoom = await getCurrentZoomForMd() as { uuid: BlockEntity["uuid"]; page: { originalName: PageEntity["originalName"]; uuid: PageEntity["uuid"] } } | null
            if (currentZoom) {
                updateCurrentPage(currentZoom.page.originalName, currentZoom.page.uuid)
                onPageChangedCallback(currentZoom.page.originalName, { zoomIn: true, zoomInUuid: currentZoom.uuid })
                return
            }

        }

    } else {
        // Logseq dbバージョン用
        const pageOrZoom = await CurrentCheckPageOrZoom() as { check: "page" | "zoom"; page?: { title: string; uuid: PageEntity["uuid"] } }
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

        }
        else if (pageOrZoom.check === "zoom") {
            // ズームの場合と、mdグラフの場合もここに入る
            // :current-pageが使えないので、DOMから取得する
            const zoomBlockElement = parent.document.querySelector("#main-content-container div.page>div>div.mb-4+div.ls-page-blocks>div>div.page-blocks-inner>div>div[id]") as HTMLDivElement | null
            if (zoomBlockElement) {
                const uuid = zoomBlockElement.id
                const blockParentPage = await zoomBlockWhenDb(uuid) as { uuid: PageEntity["uuid"]; title: string } | null
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
