import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'
import { t } from 'logseq-l10n'
import { settingKeys } from './keys'

export const tocSettings = (currentSettings?: Record<string, unknown>): SettingSchemaDesc[] => {
    const cfg = currentSettings ?? {}
    const list: SettingSchemaDesc[] = []

    // Section header
    list.push({
        key: settingKeys.toc.heading,
        title: t('Page outline function'),
        type: 'heading',
        default: null,
        description: '(Table of Contents)',
    })

    // Master enable
    list.push({
        key: settingKeys.toc.master,
        title: '',
        type: 'boolean',
        default: true,
        description: t('Enable'),
    })

    if (cfg[settingKeys.toc.master] === true) {
        list.push({
            key: settingKeys.toc.booleanAsZoomPage,
            title: t('Open pages as zoomed by default') + '🆕',
            type: 'boolean',
            default: true,
            description: t('If disabled, hold the `Ctrl` key and click to open as a zoomed block.'),
        })

        list.push({
            key: settingKeys.toc.highlightBlockOnHover,
            title: t('Highlight blocks when hovering over headers'),
            type: 'boolean',
            default: true,
            description: t('Highlights the corresponding block when hovering over a header in the header list.'),
        })

        list.push({
            key: settingKeys.toc.highlightHeaderOnHover,
            title: t('Highlight headers when hovering over blocks'),
            type: 'boolean',
            default: true,
            description: t('Highlights the corresponding header in the header list when hovering over a block in the page.'),
        })

        list.push({
            key: settingKeys.toc.enableJournalsList,
            title: t('Show date list in journals'),
            type: 'boolean',
            default: true,
            description: t('Toggle to display or hide the date list in journals.'),
        })

        list.push({
            key: settingKeys.toc.tocRemoveWordList,
            title: t('Words to exclude from the header list'),
            type: 'string',
            inputAs: 'textarea',
            default: '',
            description: t('Enter words to exclude, separated by line breaks.'),
        })

        // display-only numbering removed

        list.push({
            key: settingKeys.toc.headingNumberFileEnable,
            title: t('Enable heading numbering (file-update mode, file-based graphs only)'),
            type: 'boolean',
            default: false,
            description: t('Automatically add hierarchical numbers to heading text in markdown files. Only works on local file-based graphs.'),
        })

        if (cfg[settingKeys.toc.headingNumberFileEnable] === true) {
            list.push({
                key: settingKeys.toc.headingNumberDelimiterFile,
                title: t('Heading number delimiter (file-update mode, new)'),
                type: 'string',
                default: '.',
                description: t('New delimiter for heading numbers when updating files'),
            })

            list.push({
                key: settingKeys.toc.headingNumberDelimiterFileOld,
                title: t('Heading number delimiter (file-update mode, old)'),
                type: 'string',
                default: '.',
                description: t('Old delimiter to detect and replace when recalculating heading numbers'),
            })
        }

        list.push({
            key: settingKeys.toc.headingNumberCleanup,
            title: t('Remove heading numbers from current page'),
            type: 'boolean',
            default: false,
            description: t('⚠️ When enabled, removes all heading numbers from the currently open page. Setting will automatically reset to false when complete.'),
        })

        // heading level mark removed

        list.push({
            key: settingKeys.toc.pageStateStorageMode,
            title: t('Page activation storage mode'),
            type: 'enum',
            enumChoices: ['storeTrueOnly', 'storeFalseOnly'],
            enumPicker: 'select',
            default: 'storeTrueOnly',
            description: t('storeTrueOnly: Store only enabled pages. storeFalseOnly: Enable by default, store only disabled pages.'),
        })

        list.push({
            key: settingKeys.toc.pageStates,
            title: t('Page activation states'),
            type: 'object',
            default: {},
            description: t('Internal storage for per-page activation states. Managed by toolbar icon.'),
        })
    }

    return list
}
