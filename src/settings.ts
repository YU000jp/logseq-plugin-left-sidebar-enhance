import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user';

/* user setting */
// https://logseq.github.io/plugins/types/SettingSchemaDesc.html
export const settingsTemplate: SettingSchemaDesc[] = [
    {//Switch loadShowByMouseOver
        key: "loadShowByMouseOver",
        type: "boolean",
        //左サイドバーをマウスオーバーで表示する
        title: "Enable mouse over to show left sidebar",
        //マウスオーバーで表示する場合と、通常表示と、表示しない場合の3パターン
        description: "Toggle 3 pattern: mouse over, normal, and hide.",
        default: true,
    },
    {//Type AかType Bか
        key: "showByMouseOverType",
        type: "enum",
        title: "Select mouse over type",
        enumChoices: ["type A", "type B"],
        default: "type B",
        description: "type A: credit by mæn, type B: credit by sethyuan",
    },
    {//date selector
        key: "booleanDateSelector",
        title: "Enable date selector in left sidebar",
        type: "boolean",
        default: true,
        description: "default: true",
    },
];
