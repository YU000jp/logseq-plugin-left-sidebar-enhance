import { AppUserConfigs, LSPluginBaseInfo, PageEntity } from "@logseq/libs/dist/LSPlugin.user"
import { format } from "date-fns/format"
import { t } from "logseq-l10n"

export const loadDateSelector = () => {

    //プラグイン設定変更時
    logseq.onSettingsChanged(async (newSet: LSPluginBaseInfo['settings'], oldSet: LSPluginBaseInfo['settings']) => {
        if (oldSet.booleanDateSelector !== newSet.booleanDateSelector) {
            if (newSet.booleanDateSelector === true) main()//表示する
            else removeContainer()//消す
        }

    })

    if (logseq.settings!.booleanDateSelector === true) main()
    logseq.provideStyle(`
    div#left-sidebar div#th-dateSelector-container>label p{
            white-space: nowrap;
            overflow: visible;
            &>input {
                width:95%;
                border-radius: 4px;
                border: 1px solid var(--ls-secondary-text-color);
                /* background-color: var(--ls-secondary-background-color);
                color: var(--ls-primary-text-color); */
                color: var(--ls-secondary-background-color);
                margin-right: .4em;
                font-size: .95em;
            }
            &>button:hover {
                text-decoration: underline;
            }
    }
    `)

    logseq.beforeunload(async () => {
        const ele = parent.document.getElementById("th-dateSelector-container") as HTMLDivElement | null
        if (ele) ele.remove()
    })
}

const main = () => {
    if (parent.document.getElementById("th-dateSelector-container")) removeContainer()//すでに存在する場合は削除する

    setTimeout(async () => {
        //左サイドバーのnav-contents-containerにスペースを追加する
        const navElement: HTMLDivElement | null = parent.document.querySelector("div#main-container div#left-sidebar>div.left-sidebar-inner div.nav-contents-container") as HTMLDivElement | null
        if (navElement === null) return //nullの場合はキャンセル

        const div1: HTMLDivElement = document.createElement("div")
        div1.className = "nav-content-item mt-3 is-expand flex-shrink-0"
        const div2: HTMLDivElement = document.createElement("div")
        div2.className = "nav-content-item-inner"
        const div3: HTMLDivElement = document.createElement("div")
        div3.className = "header items-center"
        div3.id = "th-dateSelector-container"
        div2.appendChild(div3)
        div1.appendChild(div2)
        navElement.appendChild(div1)

        const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs

        //スペースに日付セレクターを追加する
        setTimeout(() => {
            const dateSelectorHereElement: HTMLDivElement | null = parent.document.getElementById("th-dateSelector-container") as HTMLDivElement | null
            if (dateSelectorHereElement === null) return //nullの場合はキャンセル

            //すでに存在する場合はキャンセル
            if (dateSelectorHereElement.dataset.flag !== "true") createSelector(preferredDateFormat, dateSelectorHereElement)//label>input#th-dateSelector

            dateSelectorHereElement.dataset.flag = "true" //フラグを立てる
        }, 1)

    }, 500)
}

const createSelector = (preferredDateFormat: string, dateSelectorHereElement: HTMLDivElement) => {
    const selectorLabel: HTMLLabelElement = document.createElement("label")
    const pElement: HTMLParagraphElement = document.createElement("p")
    const p2Element: HTMLParagraphElement = document.createElement("p")
    //type: date
    pElement.title = t("Date (Single journal)")
    const selectorInput: HTMLInputElement = document.createElement("input")
    selectorInput.type = "date"
    selectorInput.id = "th-dateSelector-date"
    selectorInput.value = new Date().toISOString().slice(0, 10)
    //OKボタン
    const okButton: HTMLButtonElement = document.createElement("button")
    okButton.textContent = "OK"
    pElement.append(selectorInput, okButton)
    //日付をもとにページを開くイベント
    okButton.addEventListener("click", async ({ shiftKey }) => {
        const date = parent.document.getElementById("th-dateSelector-date") as HTMLInputElement | null
        if (!date) return
        await pageOpen(format(new Date(date.value), preferredDateFormat), shiftKey)
    })
    //type: month
    p2Element.title = t("Month (yyyy/MM)")
    const selectorInputMonth: HTMLInputElement = document.createElement("input")
    selectorInputMonth.type = "month"
    selectorInputMonth.id = "th-dateSelector-month"
    selectorInputMonth.value = new Date().toISOString().slice(0, 7)
    //OKボタン
    const okButton2: HTMLButtonElement = document.createElement("button")
    okButton2.textContent = "OK"
    p2Element.append(selectorInputMonth, okButton2)
    //日付をもとにページを開くイベント(年/月)
    okButton2.addEventListener("click", async ({ shiftKey }) => {
        const date = parent.document.getElementById("th-dateSelector-month") as HTMLInputElement | null
        if (!date) return
        await pageOpen(format(new Date(date.value), "yyyy/MM"), shiftKey)
    })
    selectorLabel.append(pElement)
    selectorLabel.append(p2Element)
    dateSelectorHereElement.appendChild(selectorLabel)
}


const pageOpen = async (pageName: string, shiftKey: boolean) => {
    const page = await logseq.Editor.getPage(pageName) as PageEntity | null
    if (page) {
        if (shiftKey) logseq.Editor.openInRightSidebar(page.uuid)
        else logseq.Editor.scrollToBlockInPage(pageName, page.uuid, { replaceState: true })
        logseq.UI.showMsg(t("The page is opened.\n") + pageName)
    }
}

const removeContainer = () => {
    const dateSelectorHereElement: HTMLDivElement | null = parent.document.getElementById("th-dateSelector-container") as HTMLDivElement | null
    if (dateSelectorHereElement) dateSelectorHereElement.remove()
};

