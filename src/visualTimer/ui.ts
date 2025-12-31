import { t } from "logseq-l10n"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { buildStyles, CircularProgressbar } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"
import { createRoot, Root } from "react-dom/client"
import { settingKeys } from "../settings/keys"
import { buildTimerList } from "./controller"

let reactRoot: Root | null = null

const VisualTimerPanel = () => {
  const [now, setNow] = useState(() => new Date())
  const mountTimeRef = useRef<Date>(new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const timers = useMemo(() => buildTimerList(now, mountTimeRef.current), [now])

  // detect expired target and clear it after 10s
  useEffect(() => {
    const expired = timers.find((x: any) => x.isTarget && x.isExpired)
    if (!expired) return
    const id = window.setTimeout(async () => {
      try {
        // clear targetDate setting so the progress bar disappears
        // @ts-ignore
        if (typeof (logseq as any)?.updateSettings === "function") {
          await (logseq as any).updateSettings({ [settingKeys.visualTimer.targetDate]: "" })
          // show toast to notify user
          try {
            // @ts-ignore
            if (logseq?.UI && typeof logseq.UI.showMsg === "function") logseq.UI.showMsg(t("Target date cleared.") || "Target date cleared.")
          } catch (e) {
            // ignore
          }
        }
      } catch (e) {
        // ignore
      }
    }, 10_000)

    return () => window.clearTimeout(id)
  }, [timers])

  return React.createElement(
    "div",
    { className: "lse-visualTimer-grid" },
    timers.map((timer) =>
      React.createElement(
        "div",
        { className: "lse-visualTimer-card", key: timer.title },
        React.createElement(
          "div",
          { className: "lse-visualTimer-title" },
          // support newline in title: split into multiple lines
          typeof timer.title === "string" && timer.title.includes("\n")
            ? timer.title.split("\n").map((line: string, i: number) => React.createElement("div", { key: i }, line.trim()))
            : timer.title
        ),
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
