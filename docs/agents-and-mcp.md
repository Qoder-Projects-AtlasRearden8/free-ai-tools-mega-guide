# AI agents and MCP: a beginner's safety-first guide

A chatbot answers. An **agent** can take steps. That difference is useful, and it is also where most of the risk lives.

This page explains agents and the Model Context Protocol (MCP) in plain English, points to free and open-source tools in the directory, and gives you a small first project that does not put your files, accounts, or reputation at risk.

> **The short version:** an agent is a model plus instructions, tools, and permission to act. MCP is a common way to connect it to those tools. Neither one makes the model trustworthy. Start read-only, keep a human checkpoint, and never give an agent more access than the task needs.

## What is an AI agent?

An agent usually combines:

1. **A model** that reads the situation and decides what to do next.
2. **Instructions** that describe the goal, boundaries, and when to stop.
3. **Tools** such as file access, a browser, a terminal, a code editor, or an app's API.
4. **A loop** that lets the model take an action, inspect the result, and try another step.

A chat assistant can explain a spreadsheet formula. An agent can open the spreadsheet, change cells, run a check, and report back. The more access it has, the more useful it can be — and the more damage a mistake can do.

Agents are not magic coworkers. They can misunderstand the goal, use the wrong tool, follow malicious text found on a web page, loop, or be confidently wrong. The useful question is not "Can it act?" It is "What can it act on, and what happens when it is wrong?"

## What is MCP?

**MCP (Model Context Protocol)** is an open standard for connecting an AI application to tools and data. A useful comparison is a common port: instead of every AI app inventing a separate connector for every file system, calendar, database, or code host, MCP defines a shared way for them to talk.

The pieces are usually described as:

- **Host:** the AI application you use, such as a desktop assistant or coding editor.
- **Client:** the connection inside the host that talks to a server.
- **Server:** a small program that exposes specific abilities, such as "search these notes," "read this repository," or "query this database."
- **Tool:** one action a server offers. A well-designed server exposes the smallest useful set.

Some servers run locally and communicate with the host on your machine. Others are remote services reached over a network. A server might be a polished official product, a community project, or a demo someone wrote in an afternoon. **Installing an MCP server is installing software with the permissions you grant it.**

MCP is a connector standard, not a security badge. It does not decide whether a server is honest, whether a tool is safe, or whether the model will use it wisely.

## The permission ladder

Start at the lowest rung that can still finish the job.

| Level | What the agent can do | Good first use |
| --- | --- | --- |
| 1. Read-only | Read files or search public information | Summarize a small folder or look up a public reference |
| 2. Draft-only | Prepare changes without applying them | Propose a patch or a checklist for you to review |
| 3. Reversible changes | Edit a test project, with version control | Add a test to a disposable repository |
| 4. External actions | Send, post, buy, delete, or change shared state | Only after a written process and a human approval step |
| 5. Regulated or irreversible | Move patient data, make payments, alter production systems | Not a sensible first agent project |

If an agent asks for a permission that is higher than the job needs, stop and ask why. "It works better with full access" is not a reason.

## What MCP unlocks for a beginner

With a small, well-scoped server, an assistant can work with **your** information instead of only what you paste into the chat. Common examples include:

- searching your own notes;
- reading project documentation;
- checking a public code repository;
- querying a local database with read-only credentials;
- using a browser with a separate, logged-out profile;
- turning a repeated lookup into a documented tool.

Those are also the abilities that can leak data or make unwanted changes. A local MCP server does not guarantee that the model stays local, and a remote one may log every request. Read the host's and server's documentation before connecting anything private.

## Free and open tools to explore

The directory labels each tool's free path. MCP and agent support can change quickly; check the current docs before installing.

### Coding agents and assistants

- [Goose](tools/coding.md#tool-goose) — an open-source, extensible local agent for code and tools. Bring a local model or your own provider key.
- [Cline](tools/coding.md#tool-cline) — an open-source editor agent with a visible plan and approval steps.
- [Aider](tools/coding.md#tool-aider) — a terminal-based pair programmer that works well with version control.
- [OpenHands](tools/coding.md#tool-openhands) — a more autonomous coding environment; use a sandbox and a disposable project.
- [Continue](tools/coding.md#tool-continue-dev) — an open-source editor assistant that can use local or hosted models.
- [Gemini CLI](tools/coding.md#tool-gemini-cli) — an open-source terminal assistant with a free Google-account path and usage limits.

### Local interfaces and knowledge tools

- [AnythingLLM](tools/local.md#tool-anythingllm) — desktop document workspaces with local or connected models.
- [Open WebUI](tools/local.md#tool-open-webui) — a self-hosted chat interface with tools and retrieval features.
- [LibreChat](tools/local.md#tool-librechat) — a self-hosted multi-provider interface with configurable agents and tools.
- [Khoj](tools/productivity.md#tool-khoj) — a self-hostable personal assistant for your own notes and documents.

### Automation without a full agent framework

- [n8n](tools/productivity.md#tool-n8n) — self-hostable workflow automation.
- [Activepieces](tools/productivity.md#tool-activepieces) — an open-source visual automation builder.
- [Zapier](tools/productivity.md#tool-zapier) and [Make](tools/productivity.md#tool-make) — hosted automation with free task allowances.

Automation and agents overlap, but they are not the same. A workflow is a route you designed in advance. An agent decides part of the route at runtime. Prefer the predictable workflow when the steps are known; use an agent when judgment between steps is genuinely needed.

## A safe first agent project

Use a job with low stakes, public or invented data, and an easy undo.

### Project: tidy a practice repository

1. **Create a disposable folder** with a few harmless text or code files. Initialize Git so every change can be reviewed and reversed.
2. **Choose one narrow tool.** Use read-only access first, or a coding agent that shows a plan before applying edits.
3. **Write a short brief.** Name the goal, files it may touch, files it must not touch, and the stop condition. Example: "Suggest changes in these two Markdown files only. Do not run commands. Show a diff before writing."
4. **Give it test data.** No client records, credentials, unpublished manuscripts, or employer code.
5. **Review the diff, not just the summary.** The summary can be optimistic; the diff is what changed.
6. **Run the checks yourself.** Tests, lint, a manual read. An agent saying "done" is not evidence.
7. **Commit or discard.** If the result is not clearly better, discard it. A successful experiment can end in "not worth it."
8. **Write down the permissions you granted.** That list is your starting point for tightening the next run.

### Project: ask questions across your own public notes

1. Put a handful of public or invented notes in one folder.
2. Use a local knowledge tool such as AnythingLLM, Open WebUI, or Khoj with a local model if your hardware allows.
3. Keep retrieval read-only and do not connect email, calendars, or cloud drives on the first run.
4. Ask a question whose answer you already know. Check whether the tool cites the right note.
5. Try to make it answer from outside the folder. Notice whether it admits the limit.

## MCP safety rules

- **Treat every server as an app install.** Check who publishes it, where the code lives, what it can access, and when it was last updated.
- **Read the tool list before connecting.** A "notes search" server should not also have write access to your home folder. Remove tools you do not need.
- **Start with read-only credentials.** Use a separate token, a test database, or a copy of the data.
- **Keep secrets out of prompts and files.** Use environment variables or the host's secret store. Never paste an API key into a chat to "help the agent set it up."
- **Watch for prompt injection.** A web page, PDF, email, or issue comment can contain instructions aimed at the agent. An agent that reads untrusted content and can also send, buy, or delete is a dangerous combination.
- **Require approval for irreversible actions.** Sending, publishing, deleting, transferring money, changing permissions, and production deploys need a human checkpoint.
- **Keep local interfaces local.** Bind a local server to `127.0.0.1`, use authentication if it is reachable by others, and do not port-forward an unsecured interface. See [Local-first AI](local-ai.md).
- **Limit the blast radius.** Use a dedicated folder, a test account, a sandbox, and version control. Back up before a large change.
- **Log and review.** If the tool keeps a run log, read it. If it does not, keep notes of what you asked and what changed.
- **Update deliberately.** MCP servers and hosts are young software. Read release notes; a new version can add permissions or change behavior.
- **Do not paste protected health information, client records, student records, passwords, or financial data.** Follow your employer's rules and the [free-tier safety checklist](free-tier-safety.md).

## What not to hand to an agent yet

- A browser profile logged into your bank, email, or social accounts.
- Production infrastructure or shared business systems.
- Patient records, clinical systems, or anything covered by a data agreement you did not write.
- A folder containing API keys, identity documents, or private keys.
- A workflow that sends messages to other people without review.
- A task you cannot verify or undo.

If an agent needs one of these to be useful, the task is not ready for an agent. Use a narrower, read-only version or a human process.

## Free is not the same as free of responsibility

Open-source agents and MCP servers do not charge a license fee, but they still cost:

- **Hardware and electricity** for local models;
- **provider usage** when you connect a hosted model or API;
- **maintenance time** for updates, security, and configuration;
- **review time** for every action the agent takes.

A free coding agent can also consume a paid model key quickly. A free automation plan can run out of tasks in the middle of a workflow. Check the limits before letting an agent run unattended.

## A minimal starter checklist

Before your first real agent run:

- [ ] The project uses invented or public data.
- [ ] Git or another undo path is in place.
- [ ] The agent has the smallest permission set that can finish the job.
- [ ] A human reviews each irreversible action.
- [ ] Secrets are in environment variables, not prompts or files.
- [ ] The task has a clear stop condition.
- [ ] I know how to turn the agent off.
- [ ] I can explain what data leaves my machine.

If you cannot tick these boxes, shrink the task.

## Where to go next

- [Free AI coding](free-ai-coding.md) — set up a safe practice repository and choose a coding assistant.
- [Local-first AI](local-ai.md) — hardware, model licences, and keeping the runtime private.
- [Free-tier safety](free-tier-safety.md) — accounts, payments, rights, and data.
- [Glossary](glossary.md) — agent, context window, tool calling, and other terms.
- [Coding and development](tools/coding.md) and [Productivity and automation](tools/productivity.md) — full listings with limits.

Agents are most useful when they are boring: a narrow job, a visible plan, a small permission set, and a review step. Build that before you build autonomy.
