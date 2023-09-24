import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user';

/* user setting */
// https://logseq.github.io/plugins/types/SettingSchemaDesc.html
export const settingsTemplate: SettingSchemaDesc[] = [
    {
        key: "heading000",
        type: "heading",
        //設定項目なし
        title: "No setting items",
        description: "",
        default: "",
    },
    {//Switch loadShowByMouseOver
        key: "loadShowByMouseOver",
        type: "boolean",
        //左サイドバーをマウスオーバーで表示する
        title: "Enable mouse over to show left sidebar",
        //マウスオーバーで表示する場合と、通常表示と、表示しない場合の3パターン
        description: "Toggle 3 pattern: mouse over, normal, and hide.",
        default: true,
    }
];
