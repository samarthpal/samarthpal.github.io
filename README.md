# samarthpal.github.io — Portfolio 3.0

Interactive portfolio of **Samarth Kumar Pal**, CTO at DaemonHive Technologies.
React 19 + Vite 6 + SCSS + GSAP (ScrollTrigger) + Lenis. Canvas 2D only, no WebGL, so it runs in every browser.

## First-time setup

1. Rename the two placeholder files:
   - `env` → `.env` (then fill in the Google Form values, see below)
   - `makefile.txt` → `makefile`
2. Node 24 (`nvm use`), then `make install`, then `make dev`

| make target    | does                                                                          |
| -------------- | ----------------------------------------------------------------------------- |
| `make dev`     | local dev server (`VITE_PORT`, default 5173)                                  |
| `make build`   | production build in `build/`, plus `version.txt` and `relv.txt`               |
| `make preview` | build, then serve the production build locally                                |
| `make lint`    | ESLint                                                                        |
| `make deploy`  | build, then push `build/` to the `gh-pages` branch (same flow as 2.0)         |
| `make resume`  | regenerate `public/resume.pdf` from `src/data/profile.json` (needs reportlab) |
| `make brand`   | regenerate the PNG icons and `og.png` (needs Pillow)                          |

## Contact form setup (Google Forms)

The browser posts straight to Google Forms in `no-cors` mode. Google doesn't send CORS headers, so the response
can't be read. A completed request counts as sent, and only a network failure counts as an error. That's why the
old axios version always said "failed".

1. Create a Google Form with three questions: **Name** (short answer), **Email** (short answer), **Message** (paragraph).
   In Settings, turn **off** "Collect email addresses" and "Restrict to users in your organisation".
2. Open ⋮ → **Get pre-filled link**, type `x` into each field, then click **Get link** and copy it.
3. The link looks like `https://docs.google.com/forms/d/e/<FORM_ID>/viewform?usp=pp_url&entry.1111=x&entry.2222=x&entry.3333=x`
4. Fill in `.env`:
   ```
   VITE_APP_GOOGLE_FORM_URL=https://docs.google.com/forms/d/e/<FORM_ID>/formResponse
   VITE_APP_GOOGLE_FORM_NAME_ID=1111
   VITE_APP_GOOGLE_FORM_EMAIL_ID=2222
   VITE_APP_GOOGLE_FORM_MESSAGE_ID=3333
   ```
   Use `formResponse`, **not** `viewform`. The IDs work with or without the `entry.` prefix.
5. Restart `make dev` (Vite reads env only at startup), send a test message and check the form's **Responses** tab.

`VITE_` values are compiled into the public bundle. A form URL isn't a secret, but never put real secrets in `.env` here.

## Where things live

- `src/data/profile.json`: **all content** (bio, skills, case studies, experience). The site, the terminal and the resume
  generator all read from it.
- `src/data/portrait.js`: crop/mask for `me.jpeg` (hero portrait, About portal).
- `src/pages/landing/home/*`: the six scroll chapters (hero, about, work, toolbox, lab, contact).
- Case studies: `scope` (what was built) shows until you add real `outcomes` metrics in `profile.json`,
  e.g. `"outcomes": [{ "value": "40%", "label": "faster checkout" }]`.

## Accent colour

The site is dark-only. Colour tokens live in `src/styles/mixins.scss` (`theme-dark`). To change the accent
(currently amber `#ffb21a`), edit `--accent` / `--accent-2` there, the two SVGs in `public/`, and `ACCENT` in
`scripts/build_brand.py` / `scripts/build_resume.py`. Then run `make brand` and `make resume`.

- `src/helpers/terminal.js`: terminal commands. `src/helpers/ascii.js` / `pixel.js`: the renderers.
- `public/favicon.svg`, `public/logo.svg`: the logo (pixel "SP" + caret inside a hive hexagon).

## Performance notes

- The hero `<h1>` is real HTML and renders on the first paint, so it is the LCP element. Nothing covers it on load.
- Canvases only animate while visible and interacting. Their loops stop when idle.
- Pins and horizontal scroll are desktop-only (≥768px). With `prefers-reduced-motion` you get plain fades and no smooth scroll.
- The pixel font loads lazily when the lab comes close.
