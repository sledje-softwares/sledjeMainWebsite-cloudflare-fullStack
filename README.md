# Sledje — main website

Astro + Cloudflare Pages. This currently holds the pre-launch
**coming-soon page** — the first page of the eventual full
marketing site, not a disconnected placeholder.

## Stack

- [Astro](https://docs.astro.build) (static output) for the site itself
- Plain CSS custom properties for design tokens — no Tailwind, no CSS-in-JS
- [Cloudflare Pages](https://developers.cloudflare.com/pages/) for hosting, with a
  [Pages Function](https://developers.cloudflare.com/pages/functions/) for the
  one form the page needs
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) for local
  Cloudflare dev and deploys

```text
/
├── functions/
│   └── api/
│       └── interest.ts        # POST /api/interest — problem-capture form handler
├── public/                    # static passthrough (currently empty)
├── src/
│   ├── assets/brand/          # brand SVG/PNG source files — see "Brand assets" below
│   ├── components/            # Header, Hero, TagBadge, InterestForm, Footer, SocialIcons
│   ├── config/
│   │   └── socials.config.ts  # every outbound social/community link
│   ├── layouts/Layout.astro   # <head>, fonts, favicon, global script
│   ├── pages/index.astro      # assembles the coming-soon page
│   ├── scripts/reveal.ts      # scroll-reveal utility (IntersectionObserver)
│   └── styles/
│       ├── tokens.css         # single source of truth: color, type, spacing, motion
│       └── global.css         # resets, base typography, focus, reveal utility classes
├── wrangler.toml               # Cloudflare Pages config + KV binding
└── astro.config.mjs
```

## Commands

| Command | Action |
| :-- | :-- |
| `npm install` | Install dependencies |
| `npm run dev` | Astro dev server at `localhost:4321` (frontend only — `/api/interest` will 404, see below) |
| `npm run build` | Build the static site to `./dist/` |
| `npm run pages:dev` | Build, then serve via `wrangler pages dev` — this is the only way to test the form locally, since it runs the Pages Function too |
| `npm run pages:deploy` | Build, then deploy to Cloudflare Pages |

## Design tokens

Everything visual is driven from **`src/styles/tokens.css`**. No component
should contain a hardcoded hex value or an arbitrary spacing/font-size
number — if a value is missing, add it to `tokens.css` first.

**Color.** Four brand values (`--color-primary`, `--color-secondary`,
`--color-text`, `--color-background`), plus a small set of values derived
from them (`--color-surface`, `--color-text-muted`, `--color-border`,
`--color-*-contrast`) so components never need to compute contrast
themselves. To change brand color, edit the four base values — the derived
values were chosen against those four, so re-check contrast (a
`prefers-color-scheme: dark` block below the `:root` block holds the dark
equivalents; edit both if you change the palette). Contrast ratios actually
in use:

| Pair | Ratio | Level |
| :-- | :-- | :-- |
| `--color-primary` (`#7A1F2B`) on `--color-background` (`#FDFDFD`) | 10.0:1 | AAA |
| `--color-text` (`#1C1A17`) on `--color-background` | 17.1:1 | AAA |
| `--color-text-muted` (`#6B6560`) on `--color-background` | 5.65:1 | AA |
| White on `--color-primary` (buttons) | 10.2:1 | AAA |
| Dark mode: `--color-primary` (`#CB616E`) on `--color-background` (`#171412`) | 4.78:1 | AA |
| Dark mode: `--color-text` (`#F2EFEA`) on `--color-background` | 16.0:1 | AAA |

**Dark mode** follows `prefers-color-scheme` — there's no manual toggle.
For a one-page notice, matching the system automatically is more reliable
than shipping a toggle nobody asked for, and it avoids any flash-of-wrong-theme
handling. If a future page on this site needs a manual toggle, keep the same
tokens and drive them from a `[data-theme]` attribute instead of the media
query.

**Spacing & type.** One modular scale, ratio 1.6, base 10px:
`--space-3xs` (4px) through `--space-4xl` (268px). The same steps back the
type scale (`--font-size-caption` through `--font-size-display-lg`) — each
type token just points at a spacing step, so text sizes never drift from
the rest of the layout. To add a size, extend the scale in `tokens.css`
rather than writing a one-off value in a component.

**Fonts.** Newsreader (display/headline, matches the wordmark) and IBM Plex
Sans (everything else), loaded via Google Fonts `<link>` tags in
`Layout.astro`. Both are referenced through `--font-display` / `--font-body`
in `tokens.css`.

## Brand assets

Canonical files live in `src/assets/brand/` and are imported through
Astro's asset pipeline wherever they're used (`Header.astro`,
`Footer.astro`, the favicon `<link>` in `Layout.astro`) — never
inline-duplicated or recolored in a component.

- `favicon-full-j-oxblood.svg` — compact mark, used as the favicon and in
  the footer. Self-contained (it draws its own white backing square), so it
  works on any background as-is.
- `wordmark-full-j-oxblood.png` — full wordmark, used in the header.

> **Note:** the brief named this file `wordmark-full-j-oxblood.svg`, but the
> file actually supplied was a PNG. It's used as-is (420×120,
> transparent background). If a true SVG version becomes available, drop it
> in at the same path and update the two `import` statements in
> `Header.astro` and swap `wordmark.width`/`height` usage if the intrinsic
> size differs — everything else (the dark-mode plate, sizing) will keep
> working unchanged.

The wordmark's ink is fixed (near-black), so it can't be recolored for dark
mode without violating "used as-is." Instead, `Header.astro` gives it a
small, always-light backing plate (`--color-logo-plate`, fixed in both
themes) in dark mode only — like a printed letterhead card pinned to a dark
wall, rather than editing the artwork.

## Social links

Edit **`src/config/socials.config.ts`**. Every component that renders a
social/community link (`SocialIcons.astro` in the footer,
`InterestForm.astro`'s WhatsApp CTA) reads from this file and skips
anything left blank — leave a platform's URL as `''` to omit it entirely,
don't point it at `#`.

```ts
export const socials = {
  linkedin: 'https://www.linkedin.com/company/...',
  twitter: '',
  instagram: '',
  youtube: '',
  whatsappCommunity: 'https://chat.whatsapp.com/...',
};
```

## Wiring the problem-capture form

The form (`InterestForm.astro`) does a plain `fetch('/api/interest', { method: 'POST' })`
with `{ problem, email, company }` (`company` is an honeypot field, always
empty for real users). The handler is a Cloudflare Pages Function at
`functions/api/interest.ts`, which validates the payload and writes each
submission to a KV namespace as its own key
(`interest:<ISO timestamp>:<uuid>` → `{ problem, email, submittedAt }`).

A static Astro build plus Pages Functions was the deliberately lightest
"Cloudflare full-stack" option here — it doesn't require adding an Astro
SSR adapter, so `astro build` still produces a plain static `dist/`.

**One-time setup**, from the Cloudflare dashboard or CLI:

1. `wrangler kv namespace create INTEREST_KV` (and `--preview` for the
   preview namespace) — copy the two ids it prints into `wrangler.toml`
   in place of the `REPLACE_WITH_...` placeholders.
2. In the Cloudflare dashboard, on the deployed Pages project: **Settings
   → Functions → KV namespace bindings** → add `INTEREST_KV` pointing at
   the same namespace. (`wrangler.toml`'s binding only covers local
   `wrangler pages dev`; the dashboard binding is what production reads.)
3. Deploy with `npm run pages:deploy`, or connect the repo in the
   dashboard for git-based deploys.

**Reading submissions back out:** `wrangler kv key list --binding=INTEREST_KV`
to list keys, `wrangler kv key get --binding=INTEREST_KV "<key>"` to read
one. There's no admin UI for this yet — for real volume, swap the `put()`
call in `functions/api/interest.ts` for D1 or a forwarding email, keeping
the same validation and honeypot logic.

## Motion

- Each section fades and rises into place once, the first time it enters
  the viewport (`src/scripts/reveal.ts` + `[data-reveal]` in `global.css`).
- The "Coming soon" text is set 1.6x the headline's size (one step up the
  modular scale) and gets a single soft glint of light sweeping across it
  every `--duration-sweep` (8s) — the one ambient motion in the hero, applied
  to the signature element itself (`TagBadge.astro`) rather than a separate
  decorative gradient. It's a `background-clip: text` gradient animation,
  gated behind an `@supports` check so browsers without text-clip support
  keep the plain solid color instead of invisible text.
- Buttons and inputs get 150–220ms hover/focus transitions
  (`--duration-fast`, `--duration-base` in `tokens.css`).
- Everything above is disabled under `prefers-reduced-motion: reduce`
  (handled once, globally, in `tokens.css` and `global.css` — components
  don't need their own media queries for it).
