import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'
import { t } from 'logseq-l10n'
import { settingKeys } from './keys'

export const commonSettings = (currentSettings?: Record<string, unknown>): SettingSchemaDesc[] => {
             // const cfg = currentSettings ?? {}
             const list: SettingSchemaDesc[] = []
             list.push(
                          {
                                       key: settingKeys.common.booleanFavAndRecent,
                                       title: t('Hide duplicate items in Favorites and History'),
                                       type: 'boolean',
                                       default: true,
                                       description: t('Automatically removes duplicates in Favorites and History when the plugin starts and every 10 minutes.'),
                          },
                          {
                                       key: settingKeys.common.loadShowByMouseOver,
                                       type: 'boolean',
                                       title: t('Show left sidebar on mouse hover'),
                                       description: t('Choose between three modes: show on hover, always show, or hide.'),
                                       default: false,
                          },
                          {
                                       key: settingKeys.common.showByMouseOverType,
                                       type: 'enum',
                                       title: t('Mouse hover behavior type'),
                                       enumChoices: ['Type A', 'Type B'],
                                       default: 'Type B',
                                       description: "Type A: Inspired by 'mæn', Type B: Inspired by 'sethyuan'.",
                          })
             return list
}
