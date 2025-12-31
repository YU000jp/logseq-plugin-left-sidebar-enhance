import { addDays, addHours, differenceInDays, differenceInHours, differenceInMinutes, endOfDay, startOfDay } from "date-fns"
import { t } from "logseq-l10n"
import { VisualTimerConfig, weekdayKeyToJsDay } from "./config"

export type TimerData = {
  title: string
  percent: number
  centerText: string
  subText: string
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const pad2 = (n: number) => String(n).padStart(2, "0")

const formatRemaining = (ms: number): string => {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}:${pad2(minutes)}`
}

const formatLargestUnit = (ms: number): string => {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000))
  const totalHours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const days = Math.floor(totalHours / 24)
  const hours = totalHours % 24

  if (days > 0) return `${days}${t("visualTimer.unit.dayShort")}`
  if (hours > 0) return `${hours}${t("visualTimer.unit.hourShort")}`
  return `${minutes}${t("visualTimer.unit.minuteShort")}`
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
    title: t("visualTimer.title.dayWindow"),
    percent,
    centerText: formatRemaining(remaining),
    subText: t("Remaining (hh:mm)"),
  }
}

export const computeWeekdaysTimer = (now: Date, cfg: VisualTimerConfig): TimerData => {
  const startDow = weekdayKeyToJsDay(cfg.weekdayStart)
  const endDow = weekdayKeyToJsDay(cfg.weekdayEnd)
  const nowDow = now.getDay() // 0:Sun..6:Sat

  const deltaBackToStart = -((7 + (nowDow - startDow)) % 7)
  const windowStart = startOfDay(addDays(now, deltaBackToStart))

  const daySpan = endDow >= startDow ? endDow - startDow : 7 - (startDow - endDow)
  const windowEnd = endOfDay(addDays(windowStart, daySpan))

  const isInside = now.getTime() >= windowStart.getTime() && now.getTime() <= windowEnd.getTime()

  if (!isInside) {
    const nextStart = addDays(windowStart, 7)
    const msUntilNextStart = Math.max(0, nextStart.getTime() - now.getTime())
    return {
      title: t("visualTimer.title.weekdays"),
      percent: 0,
      centerText: formatLargestUnit(msUntilNextStart),
      subText: t("visualTimer.sub.untilNextStart"),
    }
  }

  const total = windowEnd.getTime() - windowStart.getTime()
  const elapsed = clamp(now.getTime() - windowStart.getTime(), 0, total)
  const percent = total === 0 ? 0 : (elapsed / total) * 100

  const remainingDays = differenceInDays(windowEnd, now)
  const remainingHours = differenceInHours(windowEnd, now) % 24
  const remainingMinutes = differenceInMinutes(windowEnd, now) % 60

  let centerText = ""
  let subText = ""

  if (remainingDays > 0) {
    centerText = `${remainingDays}${t("visualTimer.unit.dayShort")}`
    subText = t("Days remaining")
  } else if (remainingHours > 0) {
    centerText = `${remainingHours}${t("visualTimer.unit.hourShort")}`
    subText = t("Hours remaining")
  } else {
    centerText = `${remainingMinutes}${t("visualTimer.unit.minuteShort")}`
    subText = t("Minutes remaining")
  }

  return {
    title: t("visualTimer.title.weekdays"),
    percent,
    centerText,
    subText,
  }
}

export const computeTargetDateTimer = (now: Date, startRef: Date, cfg: VisualTimerConfig): TimerData | null => {
  if (!cfg.targetDate) return null
  const target = endOfDay(cfg.targetDate)

  const total = target.getTime() - startRef.getTime()
  const elapsed = clamp(now.getTime() - startRef.getTime(), 0, Math.max(0, total))
  const percent = total <= 0 ? 100 : (elapsed / total) * 100

  const remainingDays = differenceInDays(target, now)
  const remainingHours = differenceInHours(target, now) % 24
  const remainingMinutes = differenceInMinutes(target, now) % 60

  let centerText = ""
  let subText = ""

  if (remainingDays > 0) {
    centerText = `${remainingDays}${t("visualTimer.unit.dayShort")}`
    subText = t("Days remaining")
  } else if (remainingHours > 0) {
    centerText = `${remainingHours}${t("visualTimer.unit.hourShort")}`
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
  }
}
