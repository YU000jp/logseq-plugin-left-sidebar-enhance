import { getVisualTimerConfig } from "./config"
import { computeDayWindowTimer, computeTargetDateTimer, TimerData } from "./timers"

export const buildTimerList = (now: Date, mountRef: Date): TimerData[] => {
             const cfg = getVisualTimerConfig((logseq.settings ?? {}) as Record<string, unknown>)
             const list = [] as TimerData[]

             if (cfg.enableDayWindow) list.push(computeDayWindowTimer(now, cfg))
            if (cfg.enableTargetDate) {
                const target = computeTargetDateTimer(now, cfg)
                if (target) list.push(target)
            }

             return list
}

export default {}
