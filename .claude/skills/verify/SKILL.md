---
name: verify
description: Build, serve, and visually drive the static export of propereconomics.com in headless Chrome (no Playwright needed).
---

# Verifying ProperEconomics changes

Static-export Next.js site - no dev-server-only behavior worth testing; verify against the real export.

## Build

```
npm run build        # runs prebuild index generation, exports to out/
```

## Serve the export

`out/` uses trailing-slash directory routes. No static server is installed; use a
minimal Node http server that resolves `p`, `p.html`, and `p/index.html`
(write it to the scratchpad; see git history of theme work for a known-good one).
Port 8899 was free.

## Drive it headless (no Playwright/puppeteer in this repo)

- Chrome lives at `C:\Program Files\Google\Chrome\Application\chrome.exe`
  (Edge at `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`).
- Launch: `chrome.exe --headless=new --remote-debugging-port=9223 --user-data-dir=<scratch>/chrome-profile --no-first-run about:blank`
- Node 24's built-in `WebSocket` can speak CDP directly - no deps:
  `GET http://127.0.0.1:9223/json/list` → connect to `webSocketDebuggerUrl` →
  `Page.enable`, `Page.navigate`, `Runtime.evaluate` (clicks, assertions),
  `Emulation.setEmulatedMedia` (force `prefers-color-scheme`),
  `Page.captureScreenshot` (base64 → file).
- Headless Chrome inherits the OS color scheme - force light/dark explicitly
  with `Emulation.setEmulatedMedia` when testing theme behavior.
- The site sets `scroll-behavior: smooth` on `<html>`: `window.scrollTo(y)` and
  `scrollTop = y` ANIMATE, so coordinates read right after are stale. Always
  scroll with `window.scrollTo({top, behavior: "instant"})`, then re-read
  `getBoundingClientRect()` in a separate evaluate.
- `scrollIntoView()` on SVG child elements is a no-op - scroll the window to
  `rect.y + window.scrollY` instead.
- `Input.dispatchMouseEvent` needs viewport coordinates and the target must be
  inside the viewport, or events silently hit nothing.

## Useful assertions

Read effective theme state in one evaluate:
`getComputedStyle(document.documentElement).getPropertyValue("--accent" | "--bg" | "--chart-*")`,
`document.documentElement.dataset.theme`, `localStorage.getItem("theme")`.

## Flows worth driving

- Home in light + dark; theme toggle button is `button[aria-label^="Switch to"]` in the header.
- Toggle must override an opposite system preference and persist across navigation (localStorage `theme`).
- `/timeline/` - click an economist bar (find its `<text>` label, click closest `g`) to draw
  influence (solid accent) vs argued-against (dashed teal) arrows.
- `/learn/supply-and-demand/` - chart series colors, act buttons, slider.

## Cleanup

Kill by command line, never by process name (the user's real Chrome is running):
`Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -match 'remote-debugging-port=9223' -or $_.CommandLine -match 'serve\.mjs' } | ...Stop-Process`
