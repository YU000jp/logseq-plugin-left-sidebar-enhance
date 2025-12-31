export const settingKeys = {
             visualTimer: {
                          master: 'booleanVisualTimer',
                          heading: 'headingVisualTimer',
                          enableDayWindow: 'visualTimerEnableDayWindow',
                          dayWindowStartHour: 'visualTimerDayWindowStartHour',
                          dayWindowEndHour: 'visualTimerDayWindowEndHour',
                          enableWeekdays: 'visualTimerEnableWeekdays',
                          weekdayStart: 'visualTimerWeekdayStart',
                          weekdayEnd: 'visualTimerWeekdayEnd',
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
             },
             common: {
                          booleanFavAndRecent: 'booleanFavAndRecent',
                          loadShowByMouseOver: 'loadShowByMouseOver',
                          showByMouseOverType: 'showByMouseOverType',
             },
} as const

export type SettingKeys = typeof settingKeys
