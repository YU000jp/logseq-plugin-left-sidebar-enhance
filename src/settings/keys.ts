export const settingKeys = {
             visualTimer: {
                          master: 'booleanVisualTimer',
                          heading: 'headingVisualTimer',
                          enableDayWindow: 'visualTimerEnableDayWindow',
                          dayWindowStartHour: 'visualTimerDayWindowStartHour',
                          dayWindowEndHour: 'visualTimerDayWindowEndHour',
                          
                          enableTargetDate: 'visualTimerEnableTargetDate',
                          targetDate: 'visualTimerTargetDate',
             },
             toc: {
                          heading: 'heading00Toc',
                          master: 'booleanLeftTOC',
                          booleanAsZoomPage: 'booleanAsZoomPage',
                          highlightBlockOnHover: 'highlightBlockOnHover',
                          highlightHeaderOnHover: 'highlightHeaderOnHover',
                          enableJournalsList: 'enableJournalsList',
                          tocRemoveWordList: 'tocRemoveWordList',
                          // Heading numbering - display-only mode
                          headingNumberDisplayEnable: 'headingNumberDisplayEnable',
                          headingNumberDelimiterDisplay: 'headingNumberDelimiterDisplay',
                          // Heading numbering - file update mode
                          headingNumberFileEnable: 'headingNumberFileEnable',
                          headingNumberDelimiterFile: 'headingNumberDelimiterFile',
                          headingNumberDelimiterFileOld: 'headingNumberDelimiterFileOld',
                          // Heading level markers
                          headingLevelMarkEnable: 'headingLevelMarkEnable',
                          // Per-page activation
                          pageStateStorageMode: 'pageStateStorageMode',
                          pageStates: 'pageStates',
             },
             common: {
                          booleanFavAndRecent: 'booleanFavAndRecent',
                          loadShowByMouseOver: 'loadShowByMouseOver',
                          showByMouseOverType: 'showByMouseOverType',
             },
} as const

export type SettingKeys = typeof settingKeys
