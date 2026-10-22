# Free AI Tools Mega Guide

A plain-English, local-first directory of **165 genuinely free or free-tier AI tools** across ten practical categories.

Every entry tells you **what is actually free**, **what sign-up asks for**, **where the limits are**, **what the tool is best for**, and links to the **official site**. Each listing carries a last-verified date, because free plans change and this guide would rather admit that than pretend otherwise.

**Last verified:** October 22, 2026 · **Edition:** First edition · **Publisher:** ASDALE DYNAMICS, LLC

> **Free tiers are a snapshot, not a promise.** Providers can change quotas, models, pricing, or entire plans without notice. Open the official pricing page before you depend on a tool, upload anything private, or build a business process around it.

This guide is written in the warm, step-by-step spirit of *The Massive AI Manual* and [Dylan Asdale's AI work](https://dylanasdale.github.io): clear explanations, no condescension, and no hype where the fine print matters.

## Read it three ways

| Format | Best for | Where |
| --- | --- | --- |
| **Searchable website** | Browsing, filtering by category or access type, sharing a filtered view | `site/` |
| **Markdown guide** | Reading without JavaScript, printing, searching in a text editor | [`docs/`](docs/README.md) |
| **JSON data** | Building your own view, checking a listing, auditing links | `site/data/tools.json` (generated) and `data/categories/*.json` (source) |

Both the website and the Markdown pages are generated from the same category JSON, so counts and wording do not drift apart.

## Quick start

You need **Node.js 20 or newer**. There are no runtime dependencies, so there is nothing to install.

```bash
npm start
```

Open the address it prints — by default [http://127.0.0.1:4173](http://127.0.0.1:4173). Press `Ctrl+C` to stop the server.

Other useful commands:

```bash
npm run build        # Validate the data, then regenerate tools.json and docs/tools/*.md
npm test             # Build, then run the automated test suite
npm run test:browser # Optional live Chrome check of the rendered site
npm run verify:links # Check every official URL (network access required)
```

If port 4173 is busy:

```bash
PORT=4174 npm start
```

## Start with your situation

The full directory is great when you know what you need. When you don't, start with the job in front of you.

| If you are… | Start with |
| --- | --- |
| New to AI and unsure where to begin | [A first path for beginners](docs/start-here.md#brand-new-to-ai) |
| An author, editor, or KDP publisher | [Publishing path](docs/start-here.md#authors-publishers-and-kdp) |
| A small business or solo operator | [Small-business path](docs/start-here.md#small-business-and-solo-work) |
| A nurse, healthcare worker, or health student | [Healthcare learner path](docs/start-here.md#healthcare-workers-and-students) — education only |
| A teacher or student | [Teaching and study path](docs/start-here.md#teachers-and-students) |
| Looking for accessibility support | [Accessibility path](docs/start-here.md#accessibility-and-independent-living) |
| Working with limited energy or an ADHD-style brain | [Low-energy path](docs/start-here.md#low-energy-and-adhd-friendly-work) |
| Curious about local or private AI | [Local-first AI](docs/local-ai.md) |
| Here for fun, games, music, or side quests | [Fun and side quests](docs/start-here.md#fun-games-and-side-quests) |

Before signing up for anything, read the [free-tier safety checklist](docs/free-tier-safety.md). It is short, practical, and the most important page in the project.

## What "free" means here

| Label | What it means in this guide |
| --- | --- |
| **Free tier** | A no-cost plan with caps, credits, queues, feature gates, or watermarks. No card should be required unless the listing says otherwise. |
| **Free** | Free at the core. Optional paid upgrades or platform purchases may exist. |
| **Open source** | Source code is available and you can run it yourself. The software may be free; hardware, storage, electricity, and model downloads are not. |
| **Self-hosted** | You run the software on your own machine or server. No licence fee, but you supply setup, maintenance, and model access. |

A free image is not automatically free to sell. Free access is not the same as a commercial licence. Read the provider's plan terms and model licence before publishing anything.

## What is inside

```
.
├── data/
│   ├── meta.json               # Title, edition, verification date, access legend
│   └── categories/             # Ten editable source files; the source of truth
├── docs/
│   ├── README.md               # Guide home and category index
│   ├── start-here.md           # Paths by audience and situation
│   ├── free-tier-safety.md     # Privacy, money, rights, and account safety
│   ├── local-ai.md             # Plain-English local AI starter
│   ├── glossary.md             # Beginner definitions
│   └── tools/                  # Generated tool directory, one page per category
├── scripts/                    # Build, validate, serve, and link-check utilities
├── site/                       # Static website: HTML, CSS, modules, generated JSON
├── tests/                      # Data, search, output, server, and safety tests
├── LICENSE                     # Project license
├── STATUS.md                   # Build and verification record
└── package.json
```

The ten categories:

1. [Chat and general assistants](docs/tools/chat.md) — 22 tools
2. [Writing and editing](docs/tools/writing.md) — 15 tools
3. [Images and design](docs/tools/images.md) — 20 tools
4. [Video and animation](docs/tools/video.md) — 15 tools
5. [Audio, music and voice](docs/tools/audio.md) — 17 tools
6. [Coding and development](docs/tools/coding.md) — 20 tools
7. [Research and knowledge](docs/tools/research.md) — 14 tools
8. [Productivity and automation](docs/tools/productivity.md) — 16 tools
9. [Education and learning](docs/tools/education.md) — 14 tools
10. [Accessibility](docs/tools/accessibility.md) — 12 tools

The website adds full-text search, category chips, an access filter, shareable URLs (`?q=transcribe&category=audio`), keyboard access (`/` focuses search), and a dependency-free interface with no analytics, ads, cookies, or third-party scripts.

## How a listing is built

Each tool in `data/categories/<category>.json` uses one small schema:

```json
{
  "id": "example-tool",
  "name": "Example Tool",
  "access": "free-tier",
  "signup": "The account, install, or verification step, and whether a card is expected for the free path.",
  "free": "Plain-language summary of what the no-cost path actually includes.",
  "limits": "The practical catch: credits, caps, watermarks, queues, or paid gates.",
  "best_for": "One clear job this tool does well.",
  "url": "https://example.com/",
  "tags": ["example", "beginner"],
  "last_verified": "2026-10-22"
}
```

The build validates required fields (including plain-language sign-up notes), unique IDs/names/URLs, HTTPS and safe URLs, category membership, start-here references, tag counts, and verification dates. It refuses to build if the guide drops below 150 tools or a category drops below 10.

`last_verified` currently must match `meta.last_verified`. When you re-check only some tools, you can relax that rule deliberately in `scripts/validate.mjs`; the validation error is there to prevent dates from changing by accident.

## Updating and correcting the guide

1. Edit the relevant `data/categories/*.json` file. Do not edit generated pages.
2. Update the verification date only when you have actually checked the public offer and official link.
3. Run `npm run build` and `npm test`.
4. Review the generated Markdown and website changes.
5. Run `npm run verify:links` if your network allows it.

The source of truth is the data, not the output. A correction that bypasses the data will be overwritten by the next build.

## Privacy, scope, and honest limits

- **No hidden collection here.** The site has no accounts, analytics, advertising, affiliate links, cookies, or third-party scripts. It loads one local JSON file.
- **Free tools are not automatically safe for private data.** Do not paste patient details, client records, student information, passwords, API keys, identity documents, financial data, biometric data, or unpublished manuscripts into a free service without clear permission and an appropriate data agreement.
- **This is education, not professional advice.** Nothing here is medical, legal, financial, or clinical decision support. For health topics, use it to learn and prepare questions — never to diagnose, treat, triage, calculate doses, or make care decisions.
- **Verification is editorial.** We reviewed public offer language and official links; we did not create paid accounts or run controlled performance benchmarks for every tool. Limits vary by region, account age, device, and demand.
- **No endorsement, affiliation, or security audit.** A listing means the free path looks useful enough to explain, not that the provider's terms or security are right for you.
- **Free tiers move.** If this guide and the provider disagree, the provider's current terms win. See [STATUS.md](STATUS.md) for the known gaps in this edition.

## Safety before you sign up

- Read the pricing page and the renewal screen. Note whether a card is required and when a trial ends.
- Use a unique password and multi-factor authentication. A password manager helps.
- Test with invented or public material, not confidential work.
- Check who owns or can reuse the output, and whether the free plan allows commercial use.
- Keep an export of anything you would be upset to lose.
- Record your consent before recording meetings, cloning a voice, or uploading someone else's face.
- Keep a backup method for critical accessibility or care-adjacent tasks.

The [free-tier safety checklist](docs/free-tier-safety.md) expands each point.

## Colophon and credits

The guide is an educational project from **ASDALE DYNAMICS, LLC**, an Indiana company formed in October 2026. It is designed for readers of *The Massive AI Manual*, beginner AI learners, working authors, small businesses, healthcare workers studying on their own time, and anyone who wants useful tools without another subscription.

Site: plain HTML, CSS, and JavaScript. Fonts are local/system fonts. Icons are inline SVG. Directory data is generated from JSON. No external requests are made while browsing the guide, other than the official provider links you choose to click.

Provider names, logos, and linked pages belong to their respective owners. This guide is not affiliated with them. The project is open for learning and reuse under the [MIT License](LICENSE). Copyright (c) 2026 Asdale Dynamics, LLC.

**Plain-English companion pages:**

- [Guide home and category index](docs/README.md)
- [Start here by situation](docs/start-here.md)
- [Free-tier safety](docs/free-tier-safety.md)
- [Local-first AI](docs/local-ai.md)
- [Glossary](docs/glossary.md)
- [Full tool directory](docs/tools/README.md)
