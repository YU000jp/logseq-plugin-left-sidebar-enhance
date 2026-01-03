import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'
import { t } from 'logseq-l10n'
import { settingKeys } from './keys'

export const tocSettings = (currentSettings?: Record<string, unknown>): SettingSchemaDesc[] => {
             const cfg = currentSettings ?? {}
             const list: SettingSchemaDesc[] = []

             list.push(
                          {
                                       key: settingKeys.toc.heading,
                                       title: t('Page outline function'),
                                       type: 'heading',
                                       default: null,
                                       description: '(Table of Contents)',
                          },
                          {
                                       key: settingKeys.toc.master,
                                       title: '',
                                       type: 'boolean',
                                       default: true,
                                       description: t('Enable'),
                          })

             if (cfg[settingKeys.toc.master] === true) {
                          list.push(
                                       {
                                                    key: settingKeys.toc.booleanAsZoomPage,
                                                    title: t('Open pages as zoomed by default') + '🆕',
                                                    type: 'boolean',
                                                    default: true,
                                                    description: t('If disabled, hold the `Ctrl` key and click to open as a zoomed block.'),
                                       },
                                       {
                                                    key: settingKeys.toc.highlightBlockOnHover,
                                                    title: t('Highlight blocks when hovering over headers'),
                                                    type: 'boolean',
                                                    default: true,
                                                    description: t('Highlights the corresponding block when hovering over a header in the header list.'),
                                       },
                                       {
                                                    key: settingKeys.toc.highlightHeaderOnHover,
                                                    title: t('Highlight headers when hovering over blocks'),
                                                    type: 'boolean',
                                                    default: true,
                                                    description: t('Highlights the corresponding header in the header list when hovering over a block in the page.'),
                                       },
                                       {
                                                    key: settingKeys.toc.enableJournalsList,
                                                    title: t('Show date list in journals'),
                                                    type: 'boolean',
                                                    default: true,
                                                    description: t('Toggle to display or hide the date list in journals.'),
                                       },
                                       {
                                                    key: settingKeys.toc.tocRemoveWordList,
                                                    title: t('Words to exclude from the header list'),
                                                    type: 'string',
                                                    inputAs: 'textarea',
                                                    default: '',
                                                    description: t('Enter words to exclude, separated by line breaks.'),
                                       },
                                       {
                                                    key: settingKeys.toc.headingNumberDisplayEnable,
                                                    title: t('Enable heading numbering (display-only mode)'),
                                                    type: 'boolean',
                                                    default: false,
                                                    description: t('Display hierarchical numbers on headings without modifying files. Uses CSS for rendering.'),
                                       })

             if (cfg[settingKeys.toc.headingNumberDisplayEnable] === true) {
                          list.push({
                                       key: settingKeys.toc.headingNumberDelimiterDisplay,
                                       title: t('Heading number delimiter (display-only)'),
                                       type: 'string',
                                       default: '.',
                                       description: t('Delimiter for heading numbers in display mode (e.g., ".", "-", " → ", "_")'),
                          })
             }

             if (cfg[settingKeys.toc.master] === true) {
                          list.push(
                          {
                                       key: settingKeys.toc.headingNumberFileEnable,
                                       title: t('Enable heading numbering (file-update mode, file-based graphs only)'),
                                       type: 'boolean',
                                       default: false,
                                       description: t('Automatically add hierarchical numbers to heading text in markdown files. Only works on local file-based graphs.'),
                          })

             if (cfg[settingKeys.toc.headingNumberFileEnable] === true) {
                          list.push(
                          {
                                       key: settingKeys.toc.headingNumberDelimiterFile,
                                       title: t('Heading number delimiter (file-update mode, new)'),
                                       type: 'string',
                                       default: '.',
                                       description: t('New delimiter for heading numbers when updating files'),
                          },
                          {
                                       key: settingKeys.toc.headingNumberDelimiterFileOld,
                                       title: t('Heading number delimiter (file-update mode, old)'),
                                       type: 'string',
                                       default: '.',
                                       description: t('Old delimiter to detect and replace when recalculating heading numbers'),
                          },
                          {
                                       key: settingKeys.toc.headingNumberCleanup,
                                       title: t('Remove all heading numbers from files'),
                                       type: 'boolean',
                                       default: false,
                                       description: t('⚠️ When enabled, removes all heading numbers from all pages. This will lock the plugin during cleanup. Setting will automatically reset to false when complete.'),
                          })
             }

             list.push(
                          {
                                       key: settingKeys.toc.headingLevelMarkEnable,
                                       title: t('Show heading level markers (H1, H2, etc.)'),
                                       type: 'boolean',
                                       default: false,
                                       description: t('Display small heading level indicators next to headings'),
                          },
                          {
                                       key: settingKeys.toc.pageStateStorageMode,
                                       title: t('Page activation storage mode'),
                                       type: 'enum',
                                       enumChoices: ['storeTrueOnly', 'storeFalseOnly'],
                                       enumPicker: 'select',
                                       default: 'storeTrueOnly',
                                       description: t('storeTrueOnly: Store only enabled pages. storeFalseOnly: Enable by default, store only disabled pages.'),
                          },
                          {
                                       key: settingKeys.toc.pageStates,
                                       title: t('Page activation states'),
                                       type: 'object',
                                       default: {},
                                       description: t('Internal storage for per-page activation states. Managed by toolbar icon.'),
                          })
             }
             }

             return list
}
