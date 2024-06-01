import { AppUserConfigs, LSPluginBaseInfo, PageEntity } from "@logseq/libs/dist/LSPlugin.user"
import { format } from "date-fns/format"
import { t } from "logseq-l10n"
import { removeContainer } from "./lib"

export const loadTOC = () => {

    //プラグイン設定変更時
    logseq.onSettingsChanged(async (newSet: LSPluginBaseInfo['settings'], oldSet: LSPluginBaseInfo['settings']) => {
        if (oldSet.booleanLeftTOC !== newSet.booleanLeftTOC) {
            if (newSet.booleanLeftTOC === true)
                main()//表示する
            else
                removeContainer("lse-toc-container")//消す
        }

    })

    if (logseq.settings!.booleanLeftTOC === true)
        main()

    logseq.provideStyle(`
    div#left-sidebar div#lse-toc-inner {
        font-size: .92em;
        margin-left: 0.6em;
        &>div+p {
            display: none;
        }
    }
    `)

    logseq.beforeunload(async () => {
        const ele = parent.document.getElementById("lse-toc-container") as HTMLDivElement | null
        if (ele) ele.remove()
    })
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
        summaryEle.style.backgroundColor = "var(--ls-tertiary-background-color)"
        summaryEle.innerText = "Table of Contents"// タイトルを入れる
        summaryEle.title = "Left Sidebar Enhance plugin"//プラグイン名を入れる
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
            if (containerEle.dataset.flag !== "true")//すでに存在する場合はキャンセル
                content(containerEle)
            containerEle.dataset.flag = "true" //フラグを立てる
        }, 1)

    }, 500)
}



const content = (containerElement: HTMLDivElement) => {
    const divEle = document.createElement("div")
    divEle.id = "lse-toc-content"
    // テストメッセージを入れる
    const pElement: HTMLParagraphElement = document.createElement("p")
    pElement.textContent = t("This is a test message.")
    containerElement.appendChild(pElement)
}