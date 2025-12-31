export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export const pad2 = (n: number) => String(n).padStart(2, "0")

export const formatRemaining = (ms: number): string => {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}:${pad2(minutes)}`
}

import { t as _t } from "logseq-l10n"

export const formatLargestUnit = (ms: number, t?: (k: string) => string): string => {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000))
  const totalHours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const days = Math.floor(totalHours / 24)
  const hours = totalHours % 24

  const fn = t ?? _t
  if (days > 0) return `${days}${fn("visualTimer.unit.dayShort")}`
  if (hours > 0) return `${hours}${fn("visualTimer.unit.hourShort")}`
  return `${minutes}${fn("visualTimer.unit.minuteShort")}`
}

export default {}
