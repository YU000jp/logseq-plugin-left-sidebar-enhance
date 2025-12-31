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
                                       })
             }

             return list
}
