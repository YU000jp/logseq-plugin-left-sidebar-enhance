import { AppUserConfigs, LSPluginBaseInfo } from "@logseq/libs/dist/LSPlugin.user"
import { format } from "date-fns/format"
import { t } from "logseq-l10n"
import { removeContainer, pageOpen } from "./util/lib"
import { booleanLogseqVersionMd } from "."

export const loadDateSelector = () => {
    const versionMd = booleanLogseqVersionMd()
    if (versionMd === false) {
        if (logseq.settings!.booleanDateSelector === true) {
            logseq.updateSettings({ booleanDateSelector: false })
            // 日付セレクター機能はLogseq dbバージョンでは対応していません。というメッセージを通知
            logseq.UI.showMsg(t("The date selector function is not supported in the Logseq db version. Changed to off."), "warning", { timeout: 3000 })
        }
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

const createElement = <T extends HTMLElement>(
    tagName: string,
    attributes: { [key: string]: string | boolean } = {},
    innerText?: string
): T => {
    const element = document.createElement(tagName) as T
    Object.entries(attributes).forEach(([key, value]) => {
        if (typeof value === "boolean") {
            if (value) element.setAttribute(key, "")
        } else {
            element.setAttribute(key, value)
        }
    })
    if (innerText) element.innerText = innerText
    return element
}

const createInputWithButton = ({
    type,
    id,
    value,
    title,
    formatString,
    onClick,
}: {
    type: string
    id: string
    value: string
    title: string
    formatString: string
    onClick: (formattedDate: string, shiftKey: boolean) => Promise<void>
}) => {
    const pElement = createElement<HTMLParagraphElement>("p", { title: t(title) })

    const inputElement = createElement<HTMLInputElement>("input", {
        type,
        id,
        value,
    })

    const buttonElement = createElement<HTMLButtonElement>("button", {}, "OK")

    buttonElement.addEventListener("click", async ({ shiftKey }) => {
        const date = parent.document.getElementById(id) as HTMLInputElement | null
        if (!date) return
        const formattedDate = format(new Date(date.value), formatString)
        await onClick(formattedDate, shiftKey)
    })

    pElement.append(inputElement, buttonElement)
    return pElement
}

const createSelector = (preferredDateFormat: string, dateSelectorHereElement: HTMLDivElement) => {
    const selectorLabel = createElement<HTMLLabelElement>("label")

    // 日付セレクター (type: date)
    const dateInput = createInputWithButton({
        type: "date",
        id: "lse-dataSelector-date",
        value: new Date().toISOString().slice(0, 10),
        title: "Date (Single journal)",
        formatString: preferredDateFormat,
        onClick: async (formattedDate, shiftKey) => {
            await pageOpen(formattedDate, shiftKey, false)
        },
    })

    // 月セレクター (type: month)
    const monthInput = createInputWithButton({
        type: "month",
        id: "lse-dataSelector-month",
        value: new Date().toISOString().slice(0, 7),
        title: "Month (yyyy/MM)",
        formatString: "yyyy/MM",
        onClick: async (formattedDate, shiftKey) => {
            await pageOpen(formattedDate, shiftKey, false)
        },
    })

    selectorLabel.append(dateInput, monthInput)
    dateSelectorHereElement.appendChild(selectorLabel)
};

