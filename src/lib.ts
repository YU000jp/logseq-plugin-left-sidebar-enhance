import { PageEntity } from "@logseq/libs/dist/LSPlugin"
import { t } from "logseq-l10n"

export const removeProvideStyle = (className: string) => {
    const doc = parent.document.head.querySelector(
        `style[data-injected-style^="${className}"]`
    ) as HTMLStyleElement | null
    if (doc) doc.remove()
}
export const pageOpen = async (pageName: string, shiftKey: boolean) => {
    const page = await logseq.Editor.getPage(pageName) as PageEntity | null
    if (page) {
        if (shiftKey)
            logseq.Editor.openInRightSidebar(page.uuid)

        else
            logseq.Editor.scrollToBlockInPage(pageName, page.uuid, { replaceState: true })
        logseq.UI.showMsg(pageName)
    }
}
export const removeContainer = (elementById:string) => {
    const ele: HTMLDivElement | null = parent.document.getElementById(elementById) as HTMLDivElement | null
    if (ele) ele.remove()
}
