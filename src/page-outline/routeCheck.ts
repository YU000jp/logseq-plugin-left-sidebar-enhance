import { BlockEntity, PageEntity } from "@logseq/libs/dist/LSPlugin"
import { onPageChangedCallback, updateCurrentPage } from ".."
import { CurrentCheckPageOrZoom, getCurrentPageForMd, getCurrentZoomForMd, zoomBlockWhenDb } from "../utils/query/advancedQuery"
import { clearTOC } from "./DOM"
import { whenOpenJournals } from "./journalsList"

// デバッグモードのスイッチ
const debugMode = false

// ルートチェック

let processingRoot = false
export const routeCheck = async (versionMd: boolean) => {
    if (processingRoot) return
    processingRoot = true
    setTimeout(() => (processingRoot = false), 100)

    if (debugMode) console.log("routeCheck started", { versionMd })

    if (versionMd) {
        // Logseq mdバージョン用
        if (logseq.settings!.enableJournalsList as boolean === true
            && handleMdVersionJournals(versionMd)) {
            if (debugMode) console.log("Handled MD version journals")
            return
        }
        if (await handleMdVersionPage()) {
            if (debugMode) console.log("Handled MD version page")
            return
        }
        if (await handleMdVersionZoom()) {
            if (debugMode) console.log("Handled MD version zoom")
            return
        }
    } else {
        // Logseq dbバージョン用
        const pageOrZoom = await CurrentCheckPageOrZoom() as { check: "page" | "zoom"; page?: { title: string; uuid: PageEntity["uuid"] } }
        if (debugMode) console.log("CurrentCheckPageOrZoom result", pageOrZoom)

        if (pageOrZoom.check === "page" && await handleDbVersionPage(pageOrZoom, versionMd)) {
            if (debugMode) console.log("Handled DB version page")
            return
        }
        if (pageOrZoom.check === "zoom" && await handleDbVersionZoom()) {
            if (debugMode) console.log("Handled DB version zoom")
            return
        }
    }

    clearTOC() // ページもズームも見つからない場合は何もしない
    if (debugMode) console.log("No page or zoom found, TOC cleared")
}

// ---- mdバージョン用

// ページ
const handleMdVersionPage = async () => {
    if (debugMode) console.log("handleMdVersionPage called")

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
    if (debugMode) console.log("handleMdVersionJournals called")
    return validateJournalsElement(versionMd)
}

// ズーム
const handleMdVersionZoom = async () => {
    if (debugMode) console.log("handleMdVersionZoom called")

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
    if (debugMode) console.log("handleDbVersionPage called", pageOrZoom)

    if (logseq.settings!.enableJournalsList as boolean === true
        && pageOrZoom.page?.uuid.startsWith("00000001-")) {
        // 日誌の場合
        setTimeout(() => validateJournalsElement(versionMd), 150)
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
    if (debugMode) console.log("handleDbVersionZoom called")

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
        if (debugMode) console.log("handleDbVersionZoom: Not zoom")

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




// ジャーナルかどうか
const validateJournalsElement = (versionMd: boolean): boolean => {
    if (debugMode) console.log("validateJournalsElement")
    const journalsEle = parent.document.getElementById("journals") as HTMLDivElement | null
    if (journalsEle) {
        if (debugMode) console.log("call: Journals list")
        whenOpenJournals(journalsEle, versionMd) // 日誌のタイトルを取得して表示する
        return true
    } else
        return false
}