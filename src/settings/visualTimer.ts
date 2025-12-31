import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'
import { t } from 'logseq-l10n'
import { settingKeys } from './keys'

export const visualTimerSettings = (currentSettings?: Record<string, unknown>): SettingSchemaDesc[] => {
             const cfg = currentSettings ?? {}
             const list: SettingSchemaDesc[] = []

             list.push(
                          {// Heading
                                       key: settingKeys.visualTimer.heading,
                                       title: t('Visual Timer settings'),
                                       type: 'heading',
                                       default: null,
                                       description: '',
                          },
                          { // Master toggle
                                       key: settingKeys.visualTimer.master,
                                       title: t('Enable visual timer in the left sidebar'),
                                       type: 'boolean',
                                       default: false,
                                       description: t('Show circular progress-bars for remaining time.'),
                          })

             if (cfg[settingKeys.visualTimer.master] === false) return list

             // Day window
             list.push({
                          key: settingKeys.visualTimer.enableDayWindow,
                          title: t('Enable day-window progress bar'),
                          type: 'boolean',
                          default: true,
                          description: t('Show a progress bar for the configured daily time window.'),
             })

             if (cfg[settingKeys.visualTimer.enableDayWindow] === true) {
                          list.push(
                                       {
                                                    key: settingKeys.visualTimer.dayWindowStartHour,
                                                    title: t('Day window start hour'),
                                                    type: 'number',
                                                    default: 5,
                                                    description: t('Start hour for the day window (0-23).'),
                                       },
                                       {
                                                    key: settingKeys.visualTimer.dayWindowEndHour,
                                                    title: t('Bedtime hour'),
                                                    type: 'number',
                                                    default: 24,
                                                    description: t('Bedtime hour for the day window (1-24). 24 means midnight.'),
                                       })
             }

             // Weekday-range progress bar removed

             // Target date
             list.push({
                          key: settingKeys.visualTimer.enableTargetDate,
                          title: t('Enable target-date progress bar'),
                          type: 'boolean',
                          default: true,
                          description: t('Show a progress bar counting down to a target date.'),
             })

             if (cfg[settingKeys.visualTimer.enableTargetDate] === true) {
                          list.push({
                                       key: settingKeys.visualTimer.targetDate,
                                       title: t('Target date'),
                                       type: 'string',
                                       inputAs: 'date',
                                       default: '',
                                       description: t('Pick the target date for the countdown. Progress is measured to 00:00 (start of that day).'),
                          })
             }

             return list
}
