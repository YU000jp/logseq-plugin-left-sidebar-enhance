import { getVisualTimerConfig } from "./config"
import { computeDayWindowTimer, computeTargetDateTimer, computeWeekdaysTimer, TimerData } from "./timers"

export const buildTimerList = (now: Date, mountRef: Date): TimerData[] => {
  const cfg = getVisualTimerConfig((logseq.settings ?? {}) as Record<string, unknown>)
  const list = [] as TimerData[]

  if (cfg.enableDayWindow) list.push(computeDayWindowTimer(now, cfg))
  if (cfg.enableWeekdays) list.push(computeWeekdaysTimer(now, cfg))
  if (cfg.enableTargetDate) {
    const target = computeTargetDateTimer(now, mountRef, cfg)
    if (target) list.push(target)
  }

  return list
}

export default {}
