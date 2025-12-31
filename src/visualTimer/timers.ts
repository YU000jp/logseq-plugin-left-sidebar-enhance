import { addDays, addHours, differenceInDays, differenceInHours, differenceInMinutes, startOfDay } from "date-fns"
import { t } from "logseq-l10n"
import { VisualTimerConfig } from "./config"
import { clamp, formatRemaining } from "./shared"

export type TimerData = {
  title: string
  percent: number
  centerText: string
  subText: string
  // optional metadata
  isTarget?: boolean
  isExpired?: boolean

}

export const computeDayWindowTimer = (now: Date, cfg: VisualTimerConfig): TimerData => {
  const todayStart = startOfDay(now)
  const start = addHours(todayStart, cfg.dayWindowStartHour)

  const endBase = cfg.dayWindowEndHour === 24 ? addDays(todayStart, 1) : todayStart
  const endHour = cfg.dayWindowEndHour === 24 ? 0 : cfg.dayWindowEndHour
  const end = addHours(endBase, endHour)

  const normalizedEnd = end.getTime() <= start.getTime() ? addDays(end, 1) : end
  const total = normalizedEnd.getTime() - start.getTime()
  const elapsed = clamp(now.getTime() - start.getTime(), 0, total)
  const remaining = clamp(normalizedEnd.getTime() - now.getTime(), 0, total)
  const percent = total === 0 ? 0 : (elapsed / total) * 100

  return {
    title: `${t("visualTimer.title.dayWindow")} (${cfg.dayWindowStartHour}-${cfg.dayWindowEndHour})`,
    percent,
    centerText: formatRemaining(remaining),
    subText: t("Remaining (hh:mm)"),
  }
}

// Weekday range feature removed

export const computeTargetDateTimer = (now: Date, cfg: VisualTimerConfig): TimerData | null => {
  if (!cfg.targetDate) return null
  // cfg.targetDateがDate型でない場合はnullを返す
  if (!(cfg.targetDate instanceof Date)) return null
  // Use startOfDay to fix the progress target to 00:00 of the target date
  const target = startOfDay(cfg.targetDate)

  // If the target is today or in the past (relative to start of today), mark as expired
  const todayStart = startOfDay(now)
  if (target.getTime() <= todayStart.getTime()) {
    return {
      title: `${t("visualTimer.title.targetDate")} ${target.getFullYear()}/${String(target.getMonth() + 1).padStart(2, "0")}/${String(
        target.getDate()
      ).padStart(2, "0")}`,
      percent: 100,
      centerText: t("visualTimer.expired") || "Expired",
      subText: t("visualTimer.sub.pastDate") || "The target date has passed.",
      isTarget: true,
      isExpired: true,
    }
  }

  // Use start of today as the fixed start reference so progress is consistent
  const startRef = startOfDay(now)
  const total = target.getTime() - startRef.getTime()
  const elapsed = clamp(now.getTime() - startRef.getTime(), 0, Math.max(0, total))
  const percent = total <= 0 ? 100 : (elapsed / total) * 100

  const remainingDays = differenceInDays(target, now)
  const remainingHours = differenceInHours(target, now) % 24
  const remainingMinutes = differenceInMinutes(target, now) % 60

  // total hours remaining (not modulo) for near-target hour display
  const totalHoursRemaining = differenceInHours(target, now)

  let centerText = ""
  let subText = ""

  // Show days when 2 or more days remain; otherwise show hours (total hours)
  if (remainingDays >= 2) {
    centerText = `${remainingDays}${t("visualTimer.unit.dayShort")}`
    subText = t("Days remaining")
  } else if (totalHoursRemaining > 0) {
    centerText = `${totalHoursRemaining}${t("visualTimer.unit.hourShort")}`
    subText = t("Hours remaining")
  } else {
    centerText = `${remainingMinutes}${t("visualTimer.unit.minuteShort")}`
    subText = t("Minutes remaining")
  }

  return {
    title: `${t("visualTimer.title.targetDate")} ${target.getFullYear()}/${String(target.getMonth() + 1).padStart(2, "0")}/${String(
      target.getDate()
    ).padStart(2, "0")}`,
    percent,
    centerText,
    subText,
    isTarget: true,
    isExpired: false,
  }
}
