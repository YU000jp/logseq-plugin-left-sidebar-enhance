export type WeekdayKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun"

export type VisualTimerConfig = {
  enableDayWindow: boolean
  dayWindowStartHour: number
  dayWindowEndHour: number

  enableWeekdays: boolean
  weekdayStart: WeekdayKey
  weekdayEnd: WeekdayKey

  enableTargetDate: boolean
  targetDate: Date | null
}

const clampInt = (value: number, min: number, max: number) => Math.min(max, Math.max(min, Math.trunc(value)))

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

const isWeekdayKey = (value: unknown): value is WeekdayKey => {
  return value === "Mon" || value === "Tue" || value === "Wed" || value === "Thu" || value === "Fri" || value === "Sat" || value === "Sun"
}

export const weekdayKeyToJsDay = (key: WeekdayKey): number => {
  switch (key) {
    case "Sun":
      return 0
    case "Mon":
      return 1
    case "Tue":
      return 2
    case "Wed":
      return 3
    case "Thu":
      return 4
    case "Fri":
      return 5
    case "Sat":
      return 6
  }
}

const parseTargetDate = (raw: unknown): Date | null => {
  // falsy (except 0) => not set
  if (raw == null || raw === "") return null

  // Date instance
  if (raw instanceof Date) return Number.isNaN(raw.getTime()) ? null : raw

  // Numeric timestamp
  if (typeof raw === "number") {
    const date = new Date(raw)
    return Number.isNaN(date.getTime()) ? null : date
  }

  // ISO string or other string parseable by Date
  if (typeof raw === "string") {
    const date = new Date(raw)
    return Number.isNaN(date.getTime()) ? null : date
  }

  if (typeof raw !== "object") return null

  const obj = raw as Record<string, unknown>
  // handle nested string fields
  const dateLike = (obj.date ?? obj.value ?? obj.targetDate) as unknown
  if (typeof dateLike === "string") {
    const date = new Date(dateLike)
    return Number.isNaN(date.getTime()) ? null : date
  }

  // accept numeric year/month/day objects
  const year = toNumber(obj.year)
  const month = toNumber(obj.month)
  const day = toNumber(obj.day)
  if (year != null && month != null && day != null) {
    const date = new Date(year, month - 1, day)
    return Number.isNaN(date.getTime()) ? null : date
  }

  return null
}

import { settingKeys } from '../settings/keys'

export const getVisualTimerConfig = (settings: Record<string, unknown> | undefined | null): VisualTimerConfig => {
  const cfg = settings ?? {}

  const enableDayWindow = cfg[settingKeys.visualTimer.enableDayWindow] !== false
  const startHour = toNumber(cfg[settingKeys.visualTimer.dayWindowStartHour]) ?? 5
  const endHour = toNumber(cfg[settingKeys.visualTimer.dayWindowEndHour]) ?? 24

  const enableWeekdays = cfg[settingKeys.visualTimer.enableWeekdays] !== false
  const weekdayStart = isWeekdayKey(cfg[settingKeys.visualTimer.weekdayStart]) ? (cfg[settingKeys.visualTimer.weekdayStart] as WeekdayKey) : ("Mon" as WeekdayKey)
  const weekdayEnd = isWeekdayKey(cfg[settingKeys.visualTimer.weekdayEnd]) ? (cfg[settingKeys.visualTimer.weekdayEnd] as WeekdayKey) : ("Fri" as WeekdayKey)

  const enableTargetDate = cfg[settingKeys.visualTimer.enableTargetDate] !== false
  const targetDate = parseTargetDate(cfg[settingKeys.visualTimer.targetDate])

  return {
    enableDayWindow,
    dayWindowStartHour: clampInt(startHour, 0, 23),
    dayWindowEndHour: clampInt(endHour, 1, 24),

    enableWeekdays,
    weekdayStart,
    weekdayEnd,

    enableTargetDate,
    targetDate,
  }
}
