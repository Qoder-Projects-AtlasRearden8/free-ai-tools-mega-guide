# Free AI Tools Mega Guide

A plain-English, local-first guide to **169 genuinely free and free-tier AI tools** across **11 practical categories**. Every entry explains what is actually free, what sign-up asks for, where the limits are, what the tool is best for, and links to the official provider.

**Publisher:** ASDALE DYNAMICS, LLC · **Edition:** First edition · **Last verified:** October 22, 2026

> **Free tiers are a snapshot, not a promise.** Providers can change quotas, models, pricing, or entire plans without notice. Open the official pricing page before you depend on a tool, upload anything private, or build a business process around it.

The guide is written in the warm, step-by-step spirit of *The Massive AI Manual* and [Dylan Asdale's AI work](https://dylanasdale.github.io): clear explanations, no condescension, and no hype where the fine print matters.

## At a glance

| | |
| --- | --- |
| **Directory** | 169 tools, 11 categories, four access labels |
| **Website** | Static HTML, CSS, and JavaScript with search, filters, and shareable URLs |
| **Markdown** | A complete reading edition plus beginner manuals and generated category pages |
| **Data** | One source schema in `data/categories/*.json`; the site and Markdown are generated from it |
| **Privacy** | No accounts, analytics, ads, affiliate links, cookies, or remote assets |
| **Requirements** | Node.js 20+ for local serving and builds; no packages to install |

The Markdown guide and website are treated as equal editions of the same project. Counts and tool wording come from the same data, so the two formats do not drift apart.

## Start reading

You do not need to read this file to use the guide. Pick the door that matches what you need.

| If you want to… | Read |
| --- | --- |
| Browse and filter every tool | Run the website with `npm start`, or open the [full Markdown directory](docs/tools/README.md) |
| Find a path for your situation | [Start here](docs/start-here.md) |
| Check a free plan before signing up | [Free-tier safety checklist](docs/free-tier-safety.md) |
| Run a model on your own computer | [Local-first AI](docs/local-ai.md) and the [Local AI category](docs/tools/local.md) |
| Understand agents, tools, and MCP | [AI agents and MCP](docs/agents-and-mcp.md) |
| Learn coding with free AI and GitHub | [Free AI coding](docs/free-ai-coding.md) |
| Study in healthcare without crossing a clinical line | [AI for healthcare learners](docs/healthcare-learners.md) — education only |
| Decode unfamiliar AI vocabulary | [Plain-English glossary](docs/glossary.md) |
| See what was tested and what is still limited | [STATUS.md](STATUS.md) |

The [Markdown edition home](docs/README.md) has the category index, a five-minute start, and the reading version of the safety rules.

## The categories

| # | Category | Tools | What it covers |
| ---: | --- | ---: | --- |
| 1 | [Chat and general assistants](docs/tools/chat.md) | 16 | Everyday questions, explanations, research, and drafting |
| 2 | [Writing and editing](docs/tools/writing.md) | 13 | Grammar, clarity, rewriting, and long-form support |
| 3 | [Images and design](docs/tools/images.md) | 20 | Generation, design, photo cleanup, upscaling, and local editors |
| 4 | [Video and animation](docs/tools/video.md) | 15 | Social clips, editing, captions, avatars, and generative video |
| 5 | [Audio, music and voice](docs/tools/audio.md) | 17 | Transcription, speech, music, cleanup, and stem separation |
| 6 | [Coding and development](docs/tools/coding.md) | 20 | Completion, browser builders, review, notebooks, and local assistants |
| 7 | [Local AI and privacy](docs/tools/local.md) | 12 | Model runners, local chat, and self-hosted interfaces |
| 8 | [Research and knowledge](docs/tools/research.md) | 14 | Literature search, citations, and source-grounded notebooks |
| 9 | [Productivity and automation](docs/tools/productivity.md) | 16 | Workflows, meeting notes, capture, and presentations |
| 10 | [Education and learning](docs/tools/education.md) | 14 | Tutoring, classroom prep, practice, and no-code ML |
| 11 | [Accessibility](docs/tools/accessibility.md) | 12 | Seeing, hearing, speech, translation, and hands-free access |

Local-capable image, audio, and coding tools stay in their job categories so readers can find them by task. The **Local AI and privacy** category is the home for model runners, local chat apps, and self-hosted interfaces.

## What makes a listing trustworthy

Every entry answers the same five questions:

- **What is actually free?** The useful part, not a seven-day trial dressed as a plan.
- **What does sign-up ask for?** Account type, install or verification step, and whether a card is expected for the free path.
- **Where do the limits bite?** Credits, caps, watermarks, queues, hardware, or paid gates.
- **What is it best for?** One honest job, not a list of every possible feature.
- **Where is the official source?** A direct HTTPS provider link, with no affiliate redirect.

Access labels are deliberately plain:

| Label | Meaning |
| --- | --- |
| **Free tier** | A no-cost plan with caps, gates, queues, or credits. No card should be required unless the listing says otherwise. |
| **Free** | Free at the core, with optional paid upgrades or platform purchases. |
| **Open source** | Source code is available and you can run it yourself. Hardware, storage, electricity, and model downloads are not free. |
| **Self-hosted** | You run the software on your own machine or server. No licence fee, but you supply setup, model access, and maintenance. |

A free image is not automatically free to sell. Free access is not the same as a commercial licence. Read the provider's plan terms and the model licence before publishing anything.

## Run the website

You need **Node.js 20 or newer**. There are no runtime or development dependencies, so there is nothing to install.

```bash
npm start
```

Open the address it prints — by default [http://127.0.0.1:4173](http://127.0.0.1:4173). Press `Ctrl+C` to stop the server.

If port 4173 is busy:

```bash
PORT=4174 npm start
```

The site can also be served by any static file server pointed at `site/`. It needs HTTP or HTTPS for the directory JSON; opening `index.html` directly from disk will not load the tools.

The website includes full-text search, category chips, an access filter, shareable URL state (`?q=transcribe&category=audio`), keyboard access (`/` focuses search), and a rendered directory with sign-up notes on every card.

## Commands

| Command | What it does |
| --- | --- |
| `npm run build` | Validate the source data, then regenerate `site/data/tools.json` and `docs/tools/*.md` |
| `npm start` | Serve the static site locally |
| `npm test` | Build, then run data, search, generated-output, server, and repository-safety tests |
| `npm run test:browser` | Build, then render and exercise the site in headless Chrome |
| `npm run verify` | Run the full test suite and the browser checks |
| `npm run verify:links` | Check every official provider URL over the network |

`verify:links` needs network access. Some providers deliberately return 403 to automated requests; those are reported as soft blocks rather than dead links.

## Project layout

```text
.
├── data/
│   ├── meta.json               # Title, edition, verification date, category order, access legend
│   └── categories/             # Eleven editable source files; the source of truth
├── docs/
│   ├── README.md               # Markdown edition home
│   ├── start-here.md           # Paths by situation and audience
│   ├── free-tier-safety.md     # Privacy, money, rights, and account safety
│   ├── local-ai.md             # Local-model starter and hardware guide
│   ├── agents-and-mcp.md       # Agents, MCP, permissions, and safe first projects
│   ├── free-ai-coding.md       # Free coding tools, GitHub habits, and review
│   ├── healthcare-learners.md  # Education-only healthcare study guide
│   ├── glossary.md             # Beginner definitions
│   └── tools/                  # Generated directory, one page per category
├── scripts/                    # Build, validation, server, browser check, and link check
├── site/                       # Static website and generated directory JSON
├── tests/                      # Automated data, search, output, server, and safety tests
├── LICENSE                     # MIT License
├── STATUS.md                   # Build and verification record
└── package.json
```

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

The build validates required fields, unique IDs/names/URLs, HTTPS and safe URLs, category membership, start-here references, tag counts, verification dates, and minimum guide size. It refuses to build if the guide drops below 150 tools or a category drops below 10.

`last_verified` currently must match `meta.last_verified`. When you re-check only some tools, relax that rule deliberately in `scripts/validate.mjs`; the validation error exists to stop dates from changing by accident.

## Updating and correcting the guide

1. Edit the relevant `data/categories/*.json` file. Do not edit generated pages.
2. Update the verification date only when you have actually checked the public offer and official link.
3. Run `npm run build` and `npm test`.
4. Review the generated Markdown and website changes.
5. Run `npm run verify:links` if your network allows it.

The data is the source of truth, not the output. A correction that bypasses the data will be overwritten by the next build.

## Verification and limits

- **Editorial, not a benchmark.** Offers were checked against public provider pages. We did not create paid accounts or run controlled performance tests for every tool.
- **Link-checked, not guaranteed.** Official links are checked, but some providers block automated requests. A listing is not an endorsement or a security audit.
- **Snapshot dates matter.** All entries in this edition were reviewed on October 22, 2026. Limits vary by region, account age, device, and demand.
- **Free tiers move.** If this guide and the provider disagree, the provider's current terms win. See [STATUS.md](STATUS.md) for exact verification results and known gaps.

The test suite also checks that the repository contains no likely secrets, credential filenames, email addresses, phone numbers, tracking scripts, remote site assets, or inline execution permissions in the static pages.

## Privacy, scope, and safety

- **No hidden collection in this project.** The site has no accounts, analytics, advertising, affiliate links, cookies, or third-party scripts. It loads local assets and one local JSON file.
- **Free tools are not automatically safe for private data.** Do not paste patient details, client records, student information, passwords, API keys, identity documents, financial data, biometric data, or unpublished manuscripts into a free service without clear permission and an appropriate data agreement.
- **This is education, not professional advice.** Nothing here is medical, legal, financial, or clinical decision support. For health topics, use the guide to learn and prepare questions — never to diagnose, treat, triage, calculate doses, or make care decisions.
- **Local is not automatically private.** The app around a local model can still use networks, logs, telemetry, extensions, and insecure web interfaces. See [Local-first AI](docs/local-ai.md).
- **Agents need smaller permissions than you think.** Use test data, version control, and a human checkpoint. See [Agents and MCP](docs/agents-and-mcp.md).

## Colophon and credits

The guide is an educational project from **ASDALE DYNAMICS, LLC**, an Indiana company formed in October 2026. It is designed for readers of *The Massive AI Manual*, beginner AI learners, working authors, small businesses, healthcare workers studying on their own time, and anyone who wants useful tools without another subscription.

The site is plain HTML, CSS, and JavaScript. Fonts are local or system fonts. Icons are inline SVG. The directory is generated from JSON. No external requests are made while browsing the guide, other than the official provider links a reader chooses to open.

Provider names, logos, and linked pages belong to their respective owners. This guide is not affiliated with them. The project is open for learning and reuse under the [MIT License](LICENSE). Copyright (c) 2026 Asdale Dynamics, LLC.

**Plain-English companion pages:**

- [Guide home and category index](docs/README.md)
- [Start here by situation](docs/start-here.md)
- [Free-tier safety](docs/free-tier-safety.md)
- [Local-first AI](docs/local-ai.md)
- [AI agents and MCP](docs/agents-and-mcp.md)
- [Free AI coding](docs/free-ai-coding.md)
- [AI for healthcare learners](docs/healthcare-learners.md)
- [Glossary](docs/glossary.md)
- [Full tool directory](docs/tools/README.md)
