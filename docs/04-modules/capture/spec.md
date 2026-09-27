# Capture module

Prototype status, 2026-09-12: local HTTP capture and a React fixture exist. Vue validation is next. The current implementation accepts a CLI URL/root selector, reads simple leaf text and measured boxes, and collects same-origin PNG/JPEG bytes. Named state presets, compiler source metadata, content-addressed assets and a full environment manifest are target ideas, not current features.

## Contract

Input: allowlisted project, route, viewport width/height, device scale, root selector, named state preset and capture timeout. The user starts the trusted project. A missing build or route is a setup error; do not guess arbitrary install/start commands.

Output: DOM observations, text runs, styles, source metadata, assets, screenshot, environment manifest and warnings. Application/domain code consumes normalized observations, not live browser handles.

## Pipeline

1. Launch a pinned Chromium build in a fresh context with fixed viewport, locale, timezone and theme.
2. Navigate to the configured target and run only the registered fixture/state setup.
3. Wait for an explicit readiness signal, required font readiness, image decoding and stable measured bounds. Use a bounded timeout; network-idle alone is insufficient.
4. Freeze transitions/animations for capture and reset scroll to a declared position. Record dynamic content fixtures and state parameters.
5. Read visible layout, computed styles, DOM order, text ranges and supplied metadata. Batch reads before any writes to avoid repeated forced layout.
6. Collect content-addressed asset bytes, normalize observations and save the reference screenshot with the exact capture dimensions.

For deterministic visual checks, pin the baseline environment; browser screenshots can differ by OS and rendering configuration. [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots)

## Geometry and difficult cases

For simple untransformed elements, use measured rectangles and derive child coordinates relative to the chosen parent. Account for viewport versus document coordinates, scroll, borders and clipping. Keep subpixel values until output. Do not treat `getBoundingClientRect()` as an untransformed local rectangle: rotation and skew require transform matrices or an explicit unsupported warning.

DOM order alone is insufficient for stacking contexts. The MVP supports documented simple paint ordering; z-index/stacking tests must pass before expanding scope. Treat inline text as text runs and range boxes, not duplicated `innerText` at every ancestor.

Pseudo-elements, closed shadow roots, cross-origin iframes, sticky/fixed elements, virtualized lists, canvas/WebGL and video need explicit policy. Initially warn and block or rasterize a permitted visible subtree; do not claim their internal editability. Full-page capture is a separate feature from viewport capture because sticky content and lazy loading change the result.

## Micro responsibilities

`readiness`: stable capture preconditions. `dom-reader`: measurements and style observations. `text-reader`: leaf text/ranges. `asset-collector`: bytes, hashes and limits. `capture-manifest`: environment/state metadata. `capture-page`: orchestration.

Stop at configured node, depth, image-byte and elapsed-time limits with a useful error. The prototype schema limits 1,000 nodes, depth 100, 2 MB per image and 4 MB total encoded image bytes; the DOM reader stops earlier near its node/depth limits. These are protective limits, not demonstrated capacity. Overall capture deadline coverage still needs review in a capture task.
