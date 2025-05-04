import { AppUserConfigs, LSPluginBaseInfo } from "@logseq/libs/dist/LSPlugin.user"
import { format } from "date-fns/format"
import { t } from "logseq-l10n"
import { removeContainer, pageOpen } from "./lib"
import { booleanLogseqVersionMd } from "."

export const loadDateSelector = () => {
    const versionMd = booleanLogseqVersionMd()
    if (versionMd === false) {
        logseq.updateSettings({ booleanDateSelector: false })
        // 日付セレクター機能はLogseq dbバージョンでは対応していません。というメッセージを通知
        logseq.UI.showMsg(t("The date selector function is not supported in the Logseq db version. Changed to off."), "warning", { timeout: 3000 })
    } else {
        //プラグイン設定変更時
        logseq.onSettingsChanged(async (newSet: LSPluginBaseInfo['settings'], oldSet: LSPluginBaseInfo['settings']) => {
            if (oldSet.booleanDateSelector !== newSet.booleanDateSelector) {
                if (newSet.booleanDateSelector === true)
                    main()//表示する
                else
                    removeContainer("lse-dataSelector-container")//消す
            }

        })

        if (logseq.settings!.booleanDateSelector === true)
            main()

        logseq.provideStyle(`
    #left-sidebar #lse-dataSelector-inner>label p {
            margin-left: 1em;
            white-space: nowrap;
            overflow: visible;
            &>input {
                cursor: text;
                border-radius: 4px;
                border: 1px solid var(--ls-secondary-text-color);
                /* background-color: var(--ls-secondary-background-color);
                color: var(--ls-primary-text-color); */
                color: var(--ls-secondary-background-color);
                margin-left: .4em;
                font-size: .9em;
            }
            &>button:hover {
                text-decoration: underline;
            }
    }
    `)
    }
}

const main = () => {
    if (parent.document.getElementById("lse-dataSelector-container"))
        removeContainer("lse-dataSelector-container")//すでに存在する場合は削除する

    setTimeout(async () => {
        //左サイドバーのnav-contents-containerにスペースを追加する
        const navEle: HTMLDivElement | null = parent.document.querySelector("#left-sidebar>div.left-sidebar-inner div.nav-contents-container") as HTMLDivElement || null

        if (navEle === null) return //nullの場合はキャンセル

        const divAsItemEle: HTMLDivElement = document.createElement("div")
        divAsItemEle.className = "nav-content-item mt-3 is-expand flex-shrink-0"
        divAsItemEle.id = "lse-dataSelector-container"
        const detailsEle: HTMLDetailsElement = document.createElement("details")
        detailsEle.className = "nav-content-item-inner"
        detailsEle.open = true
        const summaryEle: HTMLElement = document.createElement("summary")
        summaryEle.className = "header items-center"
        summaryEle.style.cursor = "row-resize"
        summaryEle.style.backgroundColor = "var(--ls-tertiary-background-color)"
        summaryEle.innerText = t("Date Selector")// タイトルを入れる
        summaryEle.title = "Left Sidebar Enhance " + t("plugin")//プラグイン名を入れる
        const containerEle: HTMLDivElement = document.createElement("div")
        containerEle.className = "bg"
        containerEle.id = "lse-dataSelector-inner"
        detailsEle.appendChild(summaryEle)
        detailsEle.appendChild(containerEle)
        divAsItemEle.appendChild(detailsEle)
        navEle.appendChild(divAsItemEle)

        const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs

        //スペースに日付セレクターを追加する
        setTimeout(() => {
            const containerEle: HTMLDivElement | null = parent.document.getElementById("lse-dataSelector-inner") as HTMLDivElement | null

            if (containerEle === null) return //nullの場合はキャンセル

            if (containerEle.dataset.flag !== "true")//すでに存在する場合はキャンセル
                createSelector(preferredDateFormat, containerEle)//label>input#lse-dataSelector

            containerEle.dataset.flag = "true" //フラグを立てる
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
    selectorInput.id = "lse-dataSelector-date"
    selectorInput.value = new Date().toISOString().slice(0, 10)
    //OKボタン
    const okButton: HTMLButtonElement = document.createElement("button")
    okButton.textContent = "OK"
    pElement.append(selectorInput, okButton)
    //日付をもとにページを開くイベント
    okButton.addEventListener("click", async ({ shiftKey }) => {
        const date = parent.document.getElementById("lse-dataSelector-date") as HTMLInputElement | null
        if (!date) return
        await pageOpen(format(new Date(date.value), preferredDateFormat), shiftKey, false)
    })
    //type: month
    p2Element.title = t("Month (yyyy/MM)")
    const selectorInputMonth: HTMLInputElement = document.createElement("input")
    selectorInputMonth.type = "month"
    selectorInputMonth.id = "lse-dataSelector-month"
    selectorInputMonth.value = new Date().toISOString().slice(0, 7)
    //OKボタン
    const okButton2: HTMLButtonElement = document.createElement("button")
    okButton2.textContent = "OK"
    p2Element.append(selectorInputMonth, okButton2)
    //日付をもとにページを開くイベント(年/月)
    okButton2.addEventListener("click", async ({ shiftKey }) => {
        const date = parent.document.getElementById("lse-dataSelector-month") as HTMLInputElement | null
        if (!date) return
        await pageOpen(format(new Date(date.value), "yyyy/MM"), shiftKey, false)
    })
    selectorLabel.append(pElement)
    selectorLabel.append(p2Element)
    dateSelectorHereElement.appendChild(selectorLabel)
}

