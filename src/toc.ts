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

    // logseq.provideStyle(`
    // div#left-sidebar div#lse-toc-container{

    // }
    // `)

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
        const detailsEle: HTMLDetailsElement = document.createElement("details")
        detailsEle.className = "nav-content-item-inner"
        detailsEle.open = true
        const summaryEle: HTMLElement = document.createElement("summary")
        summaryEle.className = "header items-center"
        summaryEle.innerText = "Table of Contents"// タイトルを入れる
        const containerEle: HTMLDivElement = document.createElement("div")
        containerEle.className = "bd"
        containerEle.id = "lse-toc-container"
        // div2にdiv4を追加
        
        detailsEle.appendChild(summaryEle)
        detailsEle.appendChild(containerEle)
        divAsItemEle.appendChild(detailsEle)
        navEle.appendChild(divAsItemEle)

        //コンテナーをセットする
        setTimeout(() => {
            const containerEle: HTMLDivElement | null = parent.document.getElementById("lse-toc-container") as HTMLDivElement | null
            if (containerEle === null) return //nullの場合はキャンセル
            if (containerEle.dataset.flag !== "true")//すでに存在する場合はキャンセル
                content(containerEle)
            containerEle.dataset.flag = "true" //フラグを立てる
        }, 1)

    }, 500)
}



const content = (containerElement: HTMLDivElement) => {
    // テストメッセージを入れる
    const pElement: HTMLParagraphElement = document.createElement("p")
    pElement.textContent = "ここにコンテンツが入ります。"
    containerElement.appendChild(pElement)
}