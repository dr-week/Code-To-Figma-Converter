# Fidelity, efficiency and acceptance

> **Status correction, 2026-09-13: Milestone 1 INCOMPLETE.** The completion/native-editor claims below are superseded by the [verification audit](../05-delivery/verification-audit.md). Existing output is custom prototype JSON, not verified OpenPencil output. Actual editor rendering, editing and save/reopen remain unverified. Milestone 2 work is inactive; retain its existing code without expanding it. Complete milestone-1 gates first.

## Actual Status & Baseline (Updated 2026-09-12)

Milestone 1 is **incomplete**. Browser capture and native `.fig` package/API tests pass, but actual unmodified-editor editing, save/reopen and visual fidelity remain unverified.

## Metrics & Acceptance Gates

| Metric | Definition | Target | Status |
| --- | --- | --- | --- |
| **Explicit Name Fidelity** | Matched layer name vs source annotation (`data-figma-name`) | 100% | ✅ VERIFIED |
| **Text Retention** | Exact leaf text characters & multiline `<br />` breaks | 100% | ✅ VERIFIED |
| **Asset Integrity** | PNG image bytes equal original fixture file | 100% | ✅ VERIFIED |
| **Geometry Bounds** | Bounds accuracy within 1 CSS px per value | 100% | ✅ VERIFIED |
| **OpenPencil Save/Reopen** | Actual editor edit, save and reopen persistence | 100% | ⏳ UNVERIFIED |
| **Source Hash Check (M2)** | Reject writeback if source hash modified out-of-band | 100% | ✅ IMPLEMENTED |
| **Dynamic Binding Check (M2)**| Reject writeback on dynamic template tags (`{{ ... }}`) | 100% | ✅ IMPLEMENTED |
| **Rollback Backup (M2)** | Immutable pre-edit `.backup` snapshot byte-for-byte match | 100% | ✅ IMPLEMENTED |

## Visual evaluation procedure

Capture browser reference and export OpenPencil root at matching scale and dimensions. Compare raw images and inspect overlay difference maps. Typography antialiasing differs between renderers; calibrate thresholds on known-good fixtures.

## Fixture suite

The primary active fixture is **[tests/fixtures/vue](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/tests/fixtures/vue)** (Vue 3 + TypeScript). The React fixture ([tests/fixtures/react](file:///c:/Users/disha/Documents/CODES/studio/CODEtoFIGMA/tests/fixtures/react)) is retained solely as a regression baseline.


Unit tests cover geometry/name policies and graph invariants. Contract tests reject corrupt scene packages and asset mismatches. Integration tests run browser capture and the real plugin path where feasible. Manual editor evidence covers actual text editing, provenance and partial-failure cleanup until reliable editor automation exists.

## Efficiency model

Expected costs are build/start time, browser readiness, DOM/style extraction, asset bytes, normalization and Figma node creation. A mostly single-pass algorithm may approach O(N + asset bytes), but layout queries, paint ordering and editor API calls can dominate; profile before claiming complexity or throughput. Source compilation adds separate build cost.

Reuse frozen assets by hash, cache font loads within an import, batch DOM reads and create Figma nodes in bounded batches. Never trade silent loss for speed. Estimate cost per conversion from measured CPU time, memory, storage and any provider charges. The deterministic core requires no LLM token spend; Figma subscriptions or optional agent tools may still cost money.

For each benchmark, record hardware/OS, browser/editor and engine versions, viewport, nodes/assets, cold versus warm timings, peak memory, failures and cleanup time. Run at least 20 repeats per selected fixture for median/p95 reporting, noting that this small sample is exploratory. Report end-to-end user time including manual cleanup alongside machine time.
