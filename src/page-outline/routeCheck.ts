import { BlockEntity, PageEntity } from "@logseq/libs/dist/LSPlugin"
import { onPageChangedCallback, updateCurrentPage } from ".."
import { CurrentCheckPageOrZoom, getCurrentPageForMd, getCurrentZoomForMd, zoomBlockWhenDb } from "../util/query/advancedQuery"
import { clearTOC } from "./DOM"
import { whenOpenJournals } from "./journalsList"



// ルートチェック

let processingRoot = false
export const routeCheck = async (versionMd: boolean) => {
    if (processingRoot) return
    processingRoot = true
    setTimeout(() => (processingRoot = false), 100)

    if (versionMd) {
        // Logseq mdバージョン用
        if (await handleMdVersionPage()) return
        if (handleMdVersionJournals(versionMd)) return
        if (await handleMdVersionZoom()) return
    } else {
        // Logseq dbバージョン用
        const pageOrZoom = await CurrentCheckPageOrZoom() as { check: "page" | "zoom"; page?: { title: string; uuid: PageEntity["uuid"] } }
        if (pageOrZoom.check === "page" && await handleDbVersionPage(pageOrZoom, versionMd)) return
        if (pageOrZoom.check === "zoom" && await handleDbVersionZoom()) return
    }

    clearTOC() // ページもズームも見つからない場合は何もしない
}






// ---- mdバージョン用


// ページ
const handleMdVersionPage = async () => {
    const currentPage = await getCurrentPageForMd() as { originalName: PageEntity["originalName"]; uuid: PageEntity["uuid"] } | null
    if (currentPage) {
        updateCurrentPage(currentPage.originalName, currentPage.uuid) // currentPageを更新
        onPageChangedCallback(currentPage.originalName) // ページが変更されたときのコールバック
        return true
    }
    return false
}

// 日誌
const handleMdVersionJournals = (versionMd: boolean) => {
    const journalsEle = parent.document.getElementById("journals") as HTMLDivElement | null
    if (journalsEle) {
        whenOpenJournals(journalsEle, versionMd) // 日誌のタイトルを取得して表示する
        return true
    }
    return false
}

// ズーム
const handleMdVersionZoom = async () => {
    const currentZoom = await getCurrentZoomForMd() as { uuid: BlockEntity["uuid"]; page: { originalName: PageEntity["originalName"]; uuid: PageEntity["uuid"] } } | null
    if (currentZoom) {
        updateCurrentPage(currentZoom.page.originalName, currentZoom.page.uuid) // currentPageを更新
        onPageChangedCallback(currentZoom.page.originalName, { zoomIn: true, zoomInUuid: currentZoom.uuid }) // ズーム時のコールバック
        return true
    }
    return false
}






// ---- dbバージョン用


// ページ
const handleDbVersionPage = async (pageOrZoom: { check: "page" | "zoom"; page?: { title: string; uuid: PageEntity["uuid"] } }, versionMd: boolean) => {
    if (pageOrZoom.page?.uuid.startsWith("00000001-")) {
        // 日誌の場合
        setTimeout(() => {
            const journalsEle = parent.document.getElementById("journals") as HTMLDivElement | null
            if (journalsEle) whenOpenJournals(journalsEle, versionMd) // 日誌のタイトルを取得して表示する
        }, 150)
        return true
    } else if (pageOrZoom.page) {
        // ページの場合
        updateCurrentPage(pageOrZoom.page.title, pageOrZoom.page.uuid) // currentPageを更新
        onPageChangedCallback(pageOrZoom.page.title) // ページが変更されたときのコールバック
        return true
    }
    return false
}


// ズーム
const handleDbVersionZoom = async () => {
    const zoomBlockElement = parent.document.querySelector("#main-content-container div.page>div>div.mb-4+div.ls-page-blocks>div>div.page-blocks-inner>div>div[id]") as HTMLDivElement | null
    if (zoomBlockElement) {
        const uuid = zoomBlockElement.id
        const blockParentPage = await zoomBlockWhenDb(uuid) as { uuid: PageEntity["uuid"]; title: string } | null
        if (blockParentPage) {
            updateCurrentPage(blockParentPage.title, blockParentPage.uuid) // currentPageを更新
            onPageChangedCallback(blockParentPage.title, { zoomIn: true, zoomInUuid: uuid }) // ズーム時のコールバック
            return true
        }
    } else {
        // mdグラフの場合
        const pageTitleElement = parent.document.querySelector("#main-content-container div.page h1.page-title>span") as HTMLSpanElement | null
        if (pageTitleElement) {
            const pageTitle = pageTitleElement.dataset.ref || pageTitleElement.innerText
            if (pageTitle) {
                const pageUuid = await logseq.Editor.getPage(pageTitle) as PageEntity["uuid"] | null // ページのUUIDを取得
                if (pageUuid) {
                    updateCurrentPage(pageTitle, pageUuid) // currentPageを更新
                    onPageChangedCallback(pageTitle) // ページが変更されたときのコールバック
                    return true
                }
            }
        }
    }
    return false
}
