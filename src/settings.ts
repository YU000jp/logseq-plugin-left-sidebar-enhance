import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'
import { t } from 'logseq-l10n'

/* user setting */
// https://logseq.github.io/plugins/types/SettingSchemaDesc.html
export const settingsTemplate = (): SettingSchemaDesc[] => [

    {// お気に入りと履歴の重複を非表示
        key: "booleanFavAndRecent",
        title: t("Enable: Hide duplicate favorites and history"),
        type: "boolean",
        default: true,
        // プラグイン実行時と、10分ごとに重複チェックを行う
        description: t("Duplicate checks are performed at plugin runtime and every 10 minutes."),
    },


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
    {//標準でズームページとして開く
        key: "booleanAsZoomPage",
        title: t("Enable: Open as zoom page by default") + "🆕",
        type: "boolean",
        default: true,
        // これが無効の場合は、Ctrlキーを同時押しでクリックすることでズームページになる
        description: t("If disabled, hold down the `Ctrl` key and click to open as a zoom page."),
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
