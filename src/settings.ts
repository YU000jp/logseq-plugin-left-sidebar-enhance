import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'
import { t } from 'logseq-l10n'

/* ユーザー設定 */
// https://logseq.github.io/plugins/types/SettingSchemaDesc.html
export const settingsTemplate = (): SettingSchemaDesc[] => [

    {// お気に入りと履歴の重複項目を自動的に非表示
        key: "booleanFavAndRecent",
        title: t("Hide duplicate items in Favorites and History"),
        type: "boolean",
        default: true,
        description: t("Automatically removes duplicates in Favorites and History when the plugin starts and every 10 minutes."),
    },
    {// マウスオーバーで左サイドバーを表示
        key: "loadShowByMouseOver",
        type: "boolean",
        title: t("Show left sidebar on mouse hover"),
        description: t("Choose between three modes: show on hover, always show, or hide."),
        default: false,
    },
    {// マウスオーバーの動作タイプを選択
        key: "showByMouseOverType",
        type: "enum",
        title: t("Mouse hover behavior type"),
        enumChoices: ["Type A", "Type B"],
        default: "Type B",
        description: "Type A: Inspired by 'mæn', Type B: Inspired by 'sethyuan'.",
    },
    {// 左サイドバーに残り時間可視化ビジュアルを表示
        key: "booleanVisualTimer",
        title: t("Enable visual timer in the left sidebar"),
        type: "boolean",
        default: false,
        description: t("Show circular progress-bars for remaining time."),
    },

    {// Visual Timer settings
        key: "headingVisualTimer",
        title: t("Visual Timer settings"),
        type: "heading",
        default: null,
        description: "",
    },
    {
        key: "visualTimerEnableDayWindow",
        title: t("Enable day-window progress bar"),
        type: "boolean",
        default: true,
        description: t("Show a progress bar for the configured daily time window."),
    },
    {
        key: "visualTimerDayWindowStartHour",
        title: t("Day window start hour"),
        type: "number",
        default: 5,
        description: t("Start hour for the day window (0-23)."),
    },
    {
        key: "visualTimerDayWindowEndHour",
        title: t("Day window end hour"),
        type: "number",
        default: 24,
        description: t("End hour for the day window (1-24). 24 means midnight."),
    },

    {
        key: "visualTimerEnableWeekdays",
        title: t("Enable weekdays progress bar"),
        type: "boolean",
        default: true,
        description: t("Show a progress bar for the configured weekday range."),
    },
    {
        key: "visualTimerWeekdayStart",
        title: t("Weekday range start"),
        type: "enum",
        enumChoices: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        default: "Mon",
        description: t("Start day of the weekday range."),
    },
    {
        key: "visualTimerWeekdayEnd",
        title: t("Weekday range end"),
        type: "enum",
        enumChoices: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        default: "Fri",
        description: t("End day of the weekday range."),
    },

    {
        key: "visualTimerEnableTargetDate",
        title: t("Enable target-date progress bar"),
        type: "boolean",
        default: true,
        description: t("Show a progress bar counting down to a target date."),
    },
    {
        key: "visualTimerTargetDate",
        title: t("Target date"),
        type: "string",
        inputAs: "date",
        default: "",
        description: t("Pick the target date for the countdown."),
    },
    {// ページアウトライン(目次)機能の設定
        key: "heading00Toc",
        title: t("Page outline function"),
        type: "heading",
        default: null,
        description: "(Table of Contents)",
    },
    {// 左サイドバーに目次を表示
        key: "booleanLeftTOC",
        title: "",
        type: "boolean",
        default: true,
        description: t("Enable"),
    },
    {// ページを開く時にズーム表示をデフォルトに
        key: "booleanAsZoomPage",
        title: t("Open pages as zoomed by default") + "🆕",
        type: "boolean",
        default: true,
        description: t("If disabled, hold the `Ctrl` key and click to open as a zoomed block."),
    },
    {// ヘッダーにマウスオーバーした時に対応するブロックをハイライト
        key: "highlightBlockOnHover",
        title: t("Highlight blocks when hovering over headers"),
        type: "boolean",
        default: true,
        description: t("Highlights the corresponding block when hovering over a header in the header list."),
    },
    {// ブロックにマウスオーバーした時に対応するヘッダーをハイライト
        key: "highlightHeaderOnHover",
        title: t("Highlight headers when hovering over blocks"),
        type: "boolean",
        default: true,
        description: t("Highlights the corresponding header in the header list when hovering over a block in the page."),
    },
    {// ジャーナルページで日付リストを表示
        key: "enableJournalsList",
        title: t("Show date list in journals"),
        type: "boolean",
        default: true,
        description: t("Toggle to display or hide the date list in journals."),
    },
    {// 目次から除外する単語のリスト（改行区切り）
        key: "tocRemoveWordList",
        title: t("Words to exclude from the header list"),
        type: "string",
        inputAs: "textarea",
        default: "",
        description: t("Enter words to exclude, separated by line breaks."),
    },
]
