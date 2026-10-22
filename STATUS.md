# Build and verification status

**Project:** Free AI Tools Mega Guide
**Publisher:** ASDALE DYNAMICS, LLC
**Edition:** First edition, verified October 22, 2026
**State:** Complete and verified locally. Not published. No remote repository is configured.

## What was built

- A directory of **165 free and free-tier AI tools** across **10 categories**: chat, writing, images, video, audio, coding, research, productivity, education, and accessibility.
- Every listing includes what is actually free, a plain-language **sign-up note**, the practical limits, best use, tags, a verification date, and an official HTTPS link.
- A zero-dependency build pipeline that validates the JSON source and generates `site/data/tools.json` plus the Markdown pages in `docs/tools/`.
- A static, local-first website with full-text search, category and access filters, shareable URL state, accessible controls, and a `/` search shortcut.
- Beginner guides in `docs/`: `start-here.md` (paths for beginners, authors, small business, healthcare learners, teachers, low-energy workers, and fun), `free-tier-safety.md`, `local-ai.md`, and `glossary.md`.
- A custom static server with security headers, strict MIME types, HEAD support, a friendly 404 page, and path-traversal and bad-encoding protection.
- Automated data, generated-output, search, HTTP server, security, and browser checks.
- Project licensing under the MIT License. Copyright (c) 2026 Asdale Dynamics, LLC.

The site makes no analytics, advertising, tracking, cookie, or remote-asset requests. It loads its local JSON, CSS, JavaScript, and SVG only. Official provider links open only when a reader clicks them.

## Requirements

- Node.js 20 or newer. Verified with Node.js 20.19.2 and npm 11.21.0.
- No `npm install` is needed; the project has no dependencies.
- Google Chrome or Chromium is optional, for the rendered-page checks. Verified with Chrome 155.

## How to run

```bash
npm start
```

Open `http://127.0.0.1:4173`. If that port is busy, use:

```bash
PORT=4174 npm start
```

The site can also be served by any static file server that serves the `site/` directory. The JSON fetches require HTTP or HTTPS; opening `index.html` directly from disk will not load the directory.

## How to build and verify

```bash
npm run build        # Validate source data and regenerate JSON and Markdown
npm test             # Build, then run all automated tests
npm run test:browser # Build, then render and exercise the site in headless Chrome
npm run verify:links # Check every official provider URL over the network
```

## Verification results

All checks below were run on October 22, 2026 in this workspace.

| Check | Result | Notes |
| --- | --- | --- |
| `npm run build` | **Pass** | 165 tools, 10 categories; generated `site/data/tools.json` and 10 Markdown category pages. |
| `npm test` | **Pass** | 44 of 44 tests passed, 0 failures. Covers data integrity, generated output, search behavior, HTTP security, and repository hygiene. |
| `npm run test:browser` | **Pass** | 8 of 8 rendered-page checks passed in headless Chrome at desktop width. |
| `npm run verify:links` | **Pass** | 165 of 165 unique official links returned a success response or were deliberately bot-blocked; 0 hard failures. |
| Live server smoke test | **Pass** | `/`, `/about.html`, CSS, JavaScript, favicon, and `/data/tools.json` returned 200 with correct MIME types; unknown page returned 404; POST returned 405. Security headers were present. |
| Data completeness | **Pass** | All 165 tools include a sign-up note; the built JSON reports `meta.tool_count` matching the 165 records. |
| Visual review | **Pass** | Desktop (1440 px) and mobile (390 px) screenshots reviewed. The three detail blocks per card remain legible, and the layout stays single-column on mobile. |

### Link check details

- 149 links returned a success response (HTTP 2xx/3xx).
- 16 links returned HTTP 403 to the automated checker and are classified as **soft blocks**, not confirmed dead links: chat.mistral.ai, meta.ai, poe.com, character.ai, quillbot.com, canva.com, ideogram.ai, leonardo.ai, creator.nightcafe.studio, craiyon.com, ttsmaker.com, lovable.dev, phind.com, gamma.app, quizlet.com, and classcompanion.com.
- 0 links were hard failures: no timeouts, DNS errors, or 5xx responses remained after the retry.
- `gemini.google.com` returns response headers larger than Node's default 16 KB limit. The checker uses a larger header limit for that fallback and records the 200 response.

## Known gaps and honest limits

- **Editorial verification only.** Offers were checked against public official pages, not by creating paid accounts or running controlled benchmarks. Speed, quality, regional availability, and quota enforcement can differ from the published terms.
- **Free tiers change.** The guide is a snapshot of October 22, 2026. If a provider's current terms differ from a listing, the provider wins.
- **Sign-up notes are guidance, not a guarantee.** A "no card expected" note describes the checked free path. A provider can change its sign-up flow at any time; stop if an unexpected payment screen appears.
- **Bot-protected links need occasional human checks.** The 16 soft-blocked sites refused automated requests. They returned a real HTTP 403 response, but a person should confirm those pages in a browser before relying on them.
- **Browser coverage is Chrome-only.** Rendered checks used headless Chrome. The HTML, CSS, and JavaScript are written for modern browsers, but Safari and Firefox were not exercised.
- **No visual regression suite.** Layout was reviewed from desktop and mobile screenshots rather than automated pixel comparisons.
- **No deployment.** The website is a local static build. It has not been pushed, deployed, or published, and this repository has no remote.
- **Healthcare content is education-only.** The guide deliberately excludes clinical decision support and warns against entering patient information. It is not medical advice and is not a HIPAA-compliant system.
- **Licensing is not legal advice.** Commercial use of AI output depends on the provider's plan, the model licence, and the marketplace or publisher rules. The MIT License covers this project's code and documentation, not third-party tools or outputs.

## Project file map

- `data/categories/*.json` — editable source of truth for every listing.
- `data/meta.json` — edition, verification date, access legend, and category order.
- `docs/` — the Markdown guide; generated tool pages live in `docs/tools/`.
- `site/` — the static website and generated directory JSON.
- `scripts/` — build, validation, static server, browser check, and link check.
- `tests/` — the automated test suite.
- `LICENSE` — MIT License for this project.
- `README.md` — project overview, setup, and maintenance instructions.
