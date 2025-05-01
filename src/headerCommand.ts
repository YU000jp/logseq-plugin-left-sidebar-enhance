import { BlockEntity } from "@logseq/libs/dist/LSPlugin"
import { t } from "logseq-l10n"
import { booleanLogseqVersionMd } from "."

type HeaderLevel = 1 | 2 | 3 | 4 | 5 | 6

const registerHeaderCommand = (level: HeaderLevel) => {
    const headerMarks = '#'.repeat(level)
    logseq.App.registerCommandPalette({
        key: `header${level}`,
        label: t("Insert header ") + headerMarks,
        keybinding: {
            binding: `alt+${level}`,
            mode: "editing",
        }
    }, async () => await insertHeader(headerMarks))
}

export const headerCommand = () => {
    const versionMd = booleanLogseqVersionMd()
    if (versionMd === true) {
        // ヘッダーレベル1-6を登録
        ([1, 2, 3, 4, 5, 6] as HeaderLevel[]).forEach(level => {
            registerHeaderCommand(level)
        })
    }
}

const insertHeader = async (headerString: string) => {
    const currentBlock = await logseq.Editor.getCurrentBlock() as { content: BlockEntity["content"], uuid: BlockEntity["uuid"], properties: BlockEntity["properties"] } | null
    if (currentBlock) {
        // # ,## ,### ,#### ,##### ,###### のいずれかが先頭にあったら削除する
        currentBlock.content = currentBlock.content.replace(/^#+ /, "")
        currentBlock.content = headerString + " " + currentBlock.content
        await logseq.Editor.updateBlock(currentBlock.uuid, currentBlock.content, currentBlock.properties)
        logseq.UI.showMsg(t("Insert header ") + headerString)
    } else
        logseq.UI.showMsg(t("No block selected"))
}
