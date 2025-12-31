import { parse } from "date-fns"

export type VisualTimerConfig = {
  enableDayWindow: boolean
  dayWindowStartHour: number
  dayWindowEndHour: number

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

// weekday feature removed

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
    const s = raw.trim()
    // If format is YYYY-MM-DD, parse as local date using date-fns.parse
    const isoDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(s)
    if (isoDateOnly) {
      const date = parse(s, "yyyy-MM-dd", new Date())
      return Number.isNaN(date.getTime()) ? null : date
    }
    // otherwise delegate to Date parsing (may include timezone)
    const date = new Date(s)
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

  // weekday feature removed

  const enableTargetDate = cfg[settingKeys.visualTimer.enableTargetDate] !== false
  const targetDate = parseTargetDate(cfg[settingKeys.visualTimer.targetDate])

  return {
    enableDayWindow,
    dayWindowStartHour: clampInt(startHour, 0, 23),
    dayWindowEndHour: clampInt(endHour, 1, 24),

    

    enableTargetDate,
    targetDate,
  }
}
