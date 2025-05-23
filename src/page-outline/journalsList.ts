import { pageOpen } from "../util/lib"
import { clearTOC } from "./DOM"
import { scrollToWithOffset } from "../util/domUtils"
import { clearCachedHeaders } from "./cache"

let processing = false

const rtf = new Intl.RelativeTimeFormat("default", { numeric: "auto" })

export const whenOpenJournals = (journalsEle: HTMLDivElement, versionMd: boolean) => {
    if (processing) return
    processing = true
    setTimeout(() =>
        processing = false, 1000)

    //"lse-toc-content"に代わりのメッセージを入れる(クリアも兼ねている)
    const element = parent.document.getElementById("lse-toc-content") as HTMLDivElement | null
    if (element && journalsEle) {
        clearCachedHeaders()
        element.innerHTML = ""
        getJournalTitles(journalsEle, element, versionMd)
        return
    }

    clearTOC()
}


const getJournalTitles = (journalsEle: HTMLDivElement, tocContentEle: HTMLDivElement, versionMd: boolean) => {
    // 表示処理
    updateJournalList(journalsEle, tocContentEle, versionMd)

    // div#main-content-containerをスクロールしたら、journalTitlesを更新する
    const mainContentContainer = parent.document.getElementById("main-content-container") as HTMLDivElement | null
    if (mainContentContainer) {
        // スクロールイベント用
        const scrollEvent = () => {
            const journalsEle = parent.document.getElementById("journals") as HTMLDivElement | null // イベント用エレメント取得
            if (journalsEle)
                updateJournalList(journalsEle, tocContentEle, versionMd) // 表示処理
            else
                mainContentContainer.removeEventListener("scroll", scrollEvent) // journalsがない場合はイベントを解除
        }
        mainContentContainer.addEventListener("scroll", scrollEvent)
    }
}


const updateJournalList = (journalsEle: HTMLDivElement, tocContentEle: HTMLDivElement, versionMd: boolean) => {
    tocContentEle.innerHTML = ""
    const ulEle = document.createElement("ul")
    //list-style
    ulEle.style.listStyle = "disc"
    ulEle.style.marginLeft = "3em"

    const journalTitles = journalsEle.querySelectorAll(versionMd === true ? "a.journal-title" : "div.ls-page-title span.block-title-wrap,div#journals div.is-journals h1.page-title>span") as NodeListOf<HTMLAnchorElement>

    journalTitles.forEach((journalTitle) => {
        const title = journalTitle.textContent
        if (title) {
            journalTitle.id = title
            const journalTitleEle = document.createElement("li")
            journalTitleEle.className = "journal-title"
            const date = new Date(title)
            //dateが正常でなければreturn
            if (isNaN(date.getTime())) {
                // 正常ではない場合は、タイトルのみ表示
                journalTitleEle.textContent = title
                journalTitleEle.title = "Ctrl-> Open single page"
            } else {
                //Intl.RelativeTimeFormatを使い、現在日時との相対的な日付差をローカライズした文字列に変換する
                const diff = (date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                journalTitleEle.innerHTML = title + "<span style='font-size:small;margin-left:1.5em'>" + rtf.format(Math.round(diff), "day") as string + "</span>"

                //Intl.DateTimeFormatを使い、曜日を表示する
                const dayOfWeekStr = new Intl.DateTimeFormat("default", { weekday: "long" }).format(date)
                journalTitleEle.title = dayOfWeekStr + "\n\n" + "Ctrl-> Open single page"
            }

            journalTitleEle.style.cursor = "pointer"
            journalTitleEle.onclick = async (ev) => {
                logseq.showMainUI() // ダブルクリック対策
                setTimeout(() => {
                    logseq.hideMainUI()
                }, 100)
                ev.preventDefault()

                if (ev.shiftKey)
                    pageOpen(title, ev.shiftKey, false)
                else
                    if (ev.ctrlKey)
                        pageOpen(title, false, false)
                    else {
                        const cancelButtonEle = parent.document.getElementById("cancel-exclude") as HTMLButtonElement | null //Single Journalプラグイン対策
                        if (cancelButtonEle) cancelButtonEle.click()

                        const journalEle = parent.document.getElementById(title) as HTMLAnchorElement | null
                        if (journalEle) {
                            scrollToWithOffset(journalEle) // 共通関数を利用
                            //スクロールしたら、タイトルを表示する
                            journalEle.style.backgroundColor = "var(--ls-selection-background-color)"
                            setTimeout(() => journalEle.style.backgroundColor = "", 1200)
                        }
                    }
            }
            ulEle.appendChild(journalTitleEle)
        }
    })
    tocContentEle.appendChild(ulEle)
}
