import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'
import { t } from 'logseq-l10n'

/* user setting */
// https://logseq.github.io/plugins/types/SettingSchemaDesc.html
export const settingsTemplate = (): SettingSchemaDesc[] => [
    {//Left TOC
        key: "booleanLeftTOC",
        title: t("Enable: Table Of Contents in left sidebar"),
        type: "boolean",
        default: true,
        description: "",
    },
    {//Table of Contents、削除する単語リスト 改行区切り
        key: "tocRemoveWordList",
        title: t("Remove words from table of contents"),
        type: "string",
        inputAs: "textarea",
        default: "",
        description: t("Separate with line breaks"),
    },
    {//Switch loadShowByMouseOver
        key: "loadShowByMouseOver",
        type: "boolean",
        //左サイドバーをマウスオーバーで表示する
        title: t("Enable: Mouse over to show left sidebar"),
        //マウスオーバーで表示する場合と、通常表示と、表示しない場合の3パターン
        description: t("Toggle 3 pattern: mouse over, normal, and hide."),
        default: false,
    },
    {//Type AかType Bか
        key: "showByMouseOverType",
        type: "enum",
        title: t("Select mouse over type"),
        enumChoices: ["type A", "type B"],
        default: "type B",
        description: t("type A: credit by mæn, type B: credit by sethyuan"),
    },
    {//date selector
        key: "booleanDateSelector",
        title: t("Enable: Date selector in left sidebar"),
        type: "boolean",
        default: false,
        description: "",
    },
]
