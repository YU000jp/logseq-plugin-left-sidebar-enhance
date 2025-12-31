import React, { useEffect, useMemo, useRef, useState } from "react"
import { buildStyles, CircularProgressbar } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import { createRoot, Root } from "react-dom/client"
import { getVisualTimerConfig } from "./config"
import { computeDayWindowTimer, computeTargetDateTimer, computeWeekdaysTimer } from "./timers"

let reactRoot: Root | null = null

const VisualTimerPanel = () => {
  const [now, setNow] = useState(() => new Date())
  const mountTimeRef = useRef<Date>(new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const timers = useMemo(() => {
    const cfg = getVisualTimerConfig((logseq.settings ?? {}) as Record<string, unknown>)
    const list = [] as ReturnType<typeof computeDayWindowTimer>[]

    if (cfg.enableDayWindow) list.push(computeDayWindowTimer(now, cfg))
    if (cfg.enableWeekdays) list.push(computeWeekdaysTimer(now, cfg))
    if (cfg.enableTargetDate) {
      const target = computeTargetDateTimer(now, mountTimeRef.current, cfg)
      if (target) list.push(target)
    }

    return list
  }, [now])

  return React.createElement(
    "div",
    { className: "lse-visualTimer-grid" },
    timers.map((timer) =>
      React.createElement(
        "div",
        { className: "lse-visualTimer-card", key: timer.title },
        React.createElement("div", { className: "lse-visualTimer-title" }, timer.title),
        React.createElement(
          "div",
          { className: "lse-visualTimer-ring" },
          React.createElement(CircularProgressbar as unknown as React.ComponentType<any>, {
            value: timer.percent,
            text: timer.centerText,
            styles: buildStyles({
              textSize: "14px", // Smaller text size
              pathColor: "var(--ls-link-text-color)",
              trailColor: "var(--ls-tertiary-background-color)",
              textColor: "var(--ls-primary-text-color)",
            }),
          })
        ),
        React.createElement("div", { className: "lse-visualTimer-sub" }, timer.subText)
      )
    )
  )
}

export const mountVisualTimer = (mount: HTMLDivElement) => {
  if (reactRoot) reactRoot.unmount()
  reactRoot = createRoot(mount)
  reactRoot.render(React.createElement(VisualTimerPanel))
}

export const unmountVisualTimer = () => {
  if (!reactRoot) return
  reactRoot.unmount()
  reactRoot = null
}
