# Cookie consent bar — implementation spec

Source: `lorem-ipsum-design-i-(copy)-export.json` · page **"All desings"**.

## Frames

| Role    | Frame                                 | id       | Size     |
| ------- | ------------------------------------- | -------- | -------- |
| Desktop | `Cookie / Privacy Consent Bar`        | `3:716`  | 1440×748 |
| Mobile  | `Mobile Cookie / Privacy Consent Bar` | `6:1289` | 390×844  |

The bar is drawn at the bottom of the viewport in both frames. The desktop frame is 174 px tall
with 40 px side padding, a 53 px copy block and a 282 px button group on the right. The mobile
frame is 306 px tall with 24 px side padding, a stacked copy block and two full-width buttons with
16 px between them.

Copy is "We value your privacy" at 16/400 and the consent sentence at 12/400 in `#666666`. The
buttons are "Only Essentials" (outline) and "Allow All" (filled), 12/500, 42 px tall with a 4 px
radius.

## Behaviour

- The bar is fixed to the bottom of the viewport and appears until the visitor chooses.
- `Only Essentials` stores `essential`; `Allow All` stores `all`. The choice lives in the
  `lorem-ipsum-consent` cookie for 180 days with `Path=/` and `SameSite=Lax`.
- Analytics tags mount only for `all`. GA4/GTM and Vercel Analytics do not load while the choice is
  absent or `essential`; the choice event is `lorem-ipsum-consent-change`.
- The bar is not a modal and does not dim or lock the page. It sits below sheets, dialogs and the
  mobile menu in the stacking order, so an open overlay is never covered by it.
- The newsletter popup waits for `all` consent and then waits 20 seconds. Visitors who choose
  essentials-only do not get the marketing popup.

## Code

- `components/consent/banner.tsx` renders the bar.
- `lib/consent/index.ts` owns the cookie name, read/write helpers and the change event.
- `components/analytics/consent-gate.tsx` mounts the analytics tags only for `all`.
- `components/newsletter/popup.tsx` listens for the consent event before scheduling.
