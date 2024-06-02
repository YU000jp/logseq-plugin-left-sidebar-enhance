import { t } from "logseq-l10n"
import { BlockEntity } from "@logseq/libs/dist/LSPlugin"

export const headerCommand = () => {
    //コマンドパレットに「header #」を追加
    logseq.App.registerCommandPalette({
        key: "header1",
        label: t("Insert header ") + "#",
        keybinding: {
            binding: "alt+1",
            mode: "editing",
        }
    }, async () =>
        await insertHeader("#")
    )
    //コマンドパレットに「header ##」を追加
    logseq.App.registerCommandPalette({
        key: "header2",
        label: t("Insert header ") + "##",
        keybinding: {
            binding: "alt+2",
            mode: "editing",
        }
    }, async () =>
        await insertHeader("##")
    )
    //コマンドパレットに「header ###」を追加
    logseq.App.registerCommandPalette({
        key: "header3",
        label: t("Insert header ") + "###",
        keybinding: {
            binding: "alt+3",
            mode: "editing",
        }
    }, async () =>
        await insertHeader("###")
    )
    //コマンドパレットに「header ####」を追加
    logseq.App.registerCommandPalette({
        key: "header4",
        label: t("Insert header ") + "####",
        keybinding: {
            binding: "alt+4",
            mode: "editing",
        }
    }, async () =>
        await insertHeader("####")
    )
    //コマンドパレットに「header #####」を追加
    logseq.App.registerCommandPalette({
        key: "header5",
        label: t("Insert header ") + "#####",
        keybinding: {
            binding: "alt+5",
            mode: "editing",
        }
    }, async () =>
        await insertHeader("#####")
    )
    //コマンドパレットに「header ######」を追加
    logseq.App.registerCommandPalette({
        key: "header6",
        label: t("Insert header ") + "######",
        keybinding: {
            binding: "alt+6",
            mode: "editing",
        }
    }, async () =>
        await insertHeader("######")
    )
}

const insertHeader = async (headerString: string) => {
    const currentBlock = await logseq.Editor.getCurrentBlock() as {
        content: BlockEntity["content"],
        uuid: BlockEntity["uuid"],
        properties: BlockEntity["properties"]
    } | null
    if (currentBlock) {
        // # ,## ,### ,#### ,##### ,###### のいずれかが先頭にあったら削除する
        currentBlock.content = currentBlock.content.replace(/^#+ /, "")
        currentBlock.content = headerString + " " + currentBlock.content
        await logseq.Editor.updateBlock(currentBlock.uuid, currentBlock.content, currentBlock.properties)
        logseq.UI.showMsg(t("Insert header ") + headerString)
    } else
        logseq.UI.showMsg(t("No block selected"))
}

