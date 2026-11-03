# LS Experience Showroom — static deploy

**Canonical deployment: this GitHub Pages build** — static app, hash routing, no server code, every experience served as
its own unchanged file. Built by `node tools/build-showroom.js` into `showroom-dist/`.
The single-file claude.ai artifact is a convenience preview only (embedded copies via blob URLs; may render blank under
that environment's CSP; no SOT showroom mode). Do not build workflows on the preview.

## Build provenance
Each `experiences/<id>/PROVENANCE.json` records the tag, commit and sha256 of the frozen guest build.
SOT showroom mode uses `experiences/the-porters-sot-v0.5/diagnostics.html` — a **diagnostics derivative**, not the frozen build:
derived from `sot-v0.5-terminal-test` (4ebd4b9), difference: diagnostics flag only, own sha256 (`diagnosticsBuildSha256`).
Guest presentation always loads the frozen build (`canonicalBuildSha256`).

## GitHub Pages (`IgorSpitzer/liefersoft-prototypes`, root)
`showroom-dist/` is the complete site for the repo root:
- `index.html` — the LS Experience Showroom (replaces the Prototype Studio hub, which is retired; `projects.json` is no longer deployed — it was import input only).
- `pizza-mann-app/ pizza-mann-sot/ havn/ noosou/ giazzo/ backhaus/ brava/ sushi/ thumbs/*.jpg` — byte-identical to commit `f1e6d8a` (verified per file and per folder tree).
- `experiences/the-porters-order-table-v1/`, `experiences/the-porters-sot-v0.5/` — frozen Porters builds (+ SOT diagnostics derivative), with `PROVENANCE.json`.

1. Replace the repo content with `showroom-dist/` (legacy folders produce no diff; `index.html` changes; `projects.json` is removed; Porters folders and two thumbnails are added). Keep `.nojekyll`.
2. Open `https://<pages-host>/#/showroom`.
3. Later custom domain: point `showroom.liefersoft.de` (CNAME) at the Pages site — routes stay identical.

All experiences are served from the same origin as the shell (required for the showroom-mode state controls).

## Routes
| Route | Purpose |
|---|---|
| `#/showroom` | Browse by brand (default) |
| `#/showroom?by=surface` | Browse by surface (Webshop · Order & Pay · SOT) |
| `#/showroom?vertical=<id>` | Vertical filter (combinable with `by=surface`) |
| `#/showroom/<brand>` | Brand detail, e.g. `#/showroom/the-porters` |
| `#/launch/<experience>` | Guest presentation — no showroom controls |
| `#/launch/<experience>?dev=1` | Showroom mode — states, reset, canonical viewport, fullscreen |

Hidden escape from a guest presentation: **5 taps within 3 s in the bottom-left corner** (44 px), or **Shift+Esc** (desktop).
This is a **showroom/demo mechanism only**. A production SOT must use a technician/admin flow — never a hidden guest gesture.

State buttons (Start · Categories · Product list · Product detail · Modifiers · Cart · Upsell · Payment · Confirmation) are
showroom navigation vocabulary only; each button shows the experience's own term (Order@Table: Cart = *Your Round*,
Payment = *Tip & Payment*). Surface semantics are never renamed.

## Chrome kiosk (physical SOT)
```
chrome --kiosk --noerrdialogs --disable-pinch --overscroll-history-navigation=0 --disable-features=TranslateUI \
  "https://<pages-host>/showroom/#/launch/the-porters-sot-v0.5"
```
The SOT keeps its 1080×1920 composition and scales uniformly on other portrait resolutions.
