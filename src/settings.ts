import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'
import { commonSettings } from './settings/common'
import { visualTimerSettings } from './settings/visualTimer'
import { tocSettings } from './settings/toc'

export const settingsTemplate = (currentSettings?: Record<string, unknown>): SettingSchemaDesc[] => {
    // build parts (visualTimer, toc, common) so each can read currentSettings
    const vt = visualTimerSettings(currentSettings)
    const toc = tocSettings(currentSettings)
    const common = commonSettings(currentSettings)

    // merge in desired order: common, visual timer, then toc
    return [...common, ...vt, ...toc]
}
