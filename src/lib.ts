import { PageEntity } from "@logseq/libs/dist/LSPlugin"
import { getPageUuid } from "./query/advancedQuery"

export const removeProvideStyle = (className: string) => {
    const doc = parent.document.head.querySelector(
        `style[data-injected-style^="${className}"]`
    ) as HTMLStyleElement | null
    if (doc) doc.remove()
}
export const pageOpen = async (pageName: string, shiftKey: boolean) => {
    const pageUuid = await getPageUuid(pageName) as PageEntity["uuid"] | null
    if (pageUuid) {
        if (shiftKey)
            logseq.Editor.openInRightSidebar(pageUuid)
        else
            logseq.Editor.scrollToBlockInPage(pageName, pageUuid, { replaceState: true })
        logseq.UI.showMsg(pageName)
    }
}
export const removeContainer = (elementById:string) => {
    const ele: HTMLDivElement | null = parent.document.getElementById(elementById) as HTMLDivElement | null
    if (ele) ele.remove()
}
