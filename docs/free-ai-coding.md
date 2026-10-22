# Free AI coding: a safe, beginner-friendly path

AI coding tools can explain an error, write a small function, add tests, or turn a rough idea into a prototype. The free options are real. The catch is that code is unusually good at looking finished before it is correct.

This guide helps you choose a free lane, set up a practice project you can safely break, and review AI-written code without trusting the confidence of the answer.

> **The rule:** use AI to move faster on work you can test and understand. Do not use it to ship code you cannot review, with credentials you cannot protect, or in systems you are not allowed to change.

## What "free AI coding" can mean

Free coding tools usually fall into one of these lanes:

| Lane | Examples | Best for | The catch |
| --- | --- | --- | --- |
| In-editor completion | [GitHub Copilot](tools/coding.md#tool-github-copilot), [Gemini Code Assist](tools/coding.md#tool-gemini-code-assist), [Continue](tools/coding.md#tool-continue-dev) | Small suggestions while you type | Monthly limits; suggestions can be plausible but wrong |
| Chat beside the code | [GitHub Copilot](tools/coding.md#tool-github-copilot), [Windsurf](tools/coding.md#tool-windsurf), [Cursor](tools/coding.md#tool-cursor) | Explaining errors, planning a change | Free quotas; context can include more code than you expect |
| Browser app builders | [Replit](tools/coding.md#tool-replit), [Bolt.new](tools/coding.md#tool-bolt-new), [Lovable](tools/coding.md#tool-lovable), [v0](tools/coding.md#tool-v0) | A quick prototype or landing page | Hosting/export limits, lock-in, and shallow security review |
| Terminal assistants and agents | [Gemini CLI](tools/coding.md#tool-gemini-cli), [Aider](tools/coding.md#tool-aider), [OpenHands](tools/coding.md#tool-openhands), [Goose](tools/coding.md#tool-goose) | Editing a local repository | Can run commands; needs sandboxing, tests, and review |
| Local coding models | [Continue](tools/coding.md#tool-continue-dev), [Tabby](tools/coding.md#tool-tabby), [Ollama](tools/local.md#tool-ollama) | Privacy-sensitive experiments | Hardware, setup, and weaker models on modest machines |
| Notebook helpers | [Google Colab](tools/coding.md#tool-google-colab) | Learning data work | Runtime limits and account/data terms |

A free plan is not the whole cost. A coding agent can burn through a hosted model allowance quickly. A local model costs electricity and setup time. A browser builder may let you preview for free but charge for a custom domain, private project, or export.

## Before you let AI touch a project

Set up three things first:

1. **Version control.** If the project is not in Git, create a practice repository before the first AI edit. Git gives you a diff and an undo path.
2. **A test or check.** At minimum, know how to run the project and one command that tells you whether it still works.
3. **A safe scope.** Use a practice folder, invented data, and no production credentials.

### A five-minute practice repository

```bash
mkdir ai-practice
cd ai-practice
git init
printf '# Practice\n\nA safe place to test AI-assisted changes.\n' > README.md
printf 'def add(a, b):\n    return a + b\n' > calculator.py
printf 'from calculator import add\n\nassert add(2, 3) == 5\nprint("tests passed")\n' > test_calculator.py
git add README.md calculator.py test_calculator.py
git commit -m "Start practice project"
```

This is deliberately small. If the agent breaks it, you can see exactly what changed. The test is run with:

```bash
python test_calculator.py
```

Use whatever language you actually know. The point is the loop: change, inspect, test, decide.

## A good first AI-assisted task

Ask for a small, testable change, not "build my app."

**Good brief:**

> Add a `multiply` function to `calculator.py` and a test for it. Change only those files. Do not add dependencies. Show the diff and tell me how to run the test.

**Bad brief:**

> Build a full app with authentication and payments.

The second brief hands over design, security, dependencies, and scope at once. A beginner cannot review the result, and a more capable model will still make choices you did not understand.

**Review loop:**

1. Read the diff before accepting it.
2. Ask why each new dependency exists. Fewer is better.
3. Run the test yourself.
4. Try one edge case the AI did not mention: zero, an empty string, a large value, a bad input.
5. If the change is larger than the job, ask for a smaller version.
6. Commit only when you can explain what changed and why.

## The ten-minute review checklist

For any AI-assisted code change, ask:

- **Does it run?** Not "does it look right."
- **Do the tests pass?** And do the tests actually test the behaviour, or only the happy path?
- **What did it touch?** Check the full diff, including files you did not expect.
- **What did it install?** New packages are new supply-chain trust. Check the name, source, and need.
- **What can it access?** File paths, network calls, shell commands, environment variables.
- **Does it handle failure?** Bad input, missing files, timeouts, permissions.
- **Is the licence compatible?** Especially for code copied from a source or generated under a provider's terms.
- **Could it expose a secret?** Search for keys, tokens, passwords, local paths, and private URLs before committing.
- **Can I maintain it?** If you cannot change it without the AI, keep it a prototype.

If any answer is "I don't know," do not ship it. Learn that part or choose a smaller task.

## GitHub without leaking your life

GitHub is a free place to store code and collaborate, but a repository can expose more than source code. A few habits prevent most embarrassment:

- **Use a unique password and two-factor authentication.**
- **Make the first repository private** unless you are deliberately publishing a portfolio project.
- **Protect API keys with a `.gitignore` and environment variables.** Add `.env` to `.gitignore` before the first commit.
- **Scan what is staged, not just what is saved.** Run `git diff --cached` and `git status` before committing.
- **Use fine-grained tokens.** Give a token the smallest scope and shortest life that works.
- **Do not paste tokens into an AI chat.** "Help me fix this error" can accidentally include a credential.
- **Review a pull request by its diff and checks**, not by the author's summary.
- **Check the licence** before reusing someone else's code or publishing generated code commercially.

The guide's own project demonstrates the pattern: data is the source of truth, generated files are rebuilt, tests run before a commit, and no secrets or personal data belong in the repository.

### Useful Git commands for a nervous beginner

```bash
git status              # What changed?
git diff                # What exactly changed?
git diff --cached       # What is staged for commit?
git add file.py         # Stage one file, not the whole folder
git commit -m "..."     # Save a checkpoint
git restore file.py     # Discard an unstaged change
git log --oneline       # See your checkpoints
```

Do not use destructive commands you do not understand. If a command promises to "clean up everything," stop and read its documentation.

## Working with coding agents

An agent can edit files, run tests, and execute shell commands. That is more power than autocomplete. Treat it like an enthusiastic intern with your terminal.

- **Use a disposable folder or repository.** Never start in an important project.
- **Choose approval-before-edit mode** if the tool offers it. Read the plan before allowing changes.
- **Disable broad filesystem access.** Point it at the practice folder, not your home directory.
- **Keep secrets out of the environment it can read**, or use a dedicated test account.
- **Do not let it install unknown dependencies without review.**
- **Require a test run and a diff inspection** before you accept.
- **Stop after a failed loop.** Repeated blind "try again" runs can pile up changes that no one understands.
- **Keep a human in charge of deploys, payments, email, and deletion.** An agent should not publish or send on your behalf without a review step.

For a deeper explanation of tool permissions and MCP, read [Agents and MCP](agents-and-mcp.md).

## Free tiers and common traps

- **A free completion limit is not a free project.** Check how many chat or agent requests you get per month.
- **Hosted model keys can cost money.** Pointing an open-source agent at a paid API does not make the API free.
- **Browser builders may own the hosting.** Check export, custom-domain, and ownership terms before building a business site.
- **Free compute has idle limits.** Colab and hosted previews are not production servers.
- **Trial language is not a free tier.** If a card is required, treat it as a trial, not a permanent free tool.
- **Student and open-source programmes change.** Verify eligibility on the official page.

The [free-tier safety checklist](free-tier-safety.md) covers account, payment, and privacy rules in more detail.

## What not to put in a coding prompt or agent

- employer source code without permission;
- patient or client records;
- API keys, passwords, private keys, or session cookies;
- identity documents or financial details;
- unreleased product plans or unpublished manuscripts;
- personal data about other people.

If the tool needs the data to be useful, use an approved environment with the right agreement. A local model can reduce cloud exposure, but it does not make regulated data automatically safe on your laptop.

## AI coding at work

Before using a free coding tool for an employer's project:

1. Check the employer's approved-tool list and source-code policy.
2. Check whether the provider may train on your input and whether that is permitted.
3. Use the employer's accounts and data, not a personal free account.
4. Follow the disclosure and code-review rules for generated code.
5. Keep secrets in the approved secret store, never in a prompt or repository.
6. Ask a human security reviewer before an agent touches authentication, payments, infrastructure, or personal data.

The fact that a tool is convenient does not mean the workplace has approved it.

## A realistic first month

| Week | Goal |
| --- | --- |
| 1 | Set up Git and a practice repository. Try one explanation and one small completion. |
| 2 | Ask for a small function and a test. Review, run, and commit it yourself. |
| 3 | Try a coding agent in the practice repository with a narrow brief and approval-before-edit. |
| 4 | Compare a local tool with a hosted free tier. Decide which one earns a place in your workflow. |

You do not need ten tools. One editor helper, one way to ask questions, and a safe repository are enough to learn the rhythm.

## Where to go next

- [Coding and development](tools/coding.md) — every listing, free limits, and sign-up notes.
- [Local AI & privacy](tools/local.md) — run a model and editor locally.
- [Agents and MCP](agents-and-mcp.md) — permissions, tool use, and a safe first agent.
- [Free-tier safety](free-tier-safety.md) — cards, renewals, privacy, and output rights.
- [Start here](start-here.md) — paths for beginners, authors, small business, and healthcare learners.

The best coding assistant is the one that leaves you with code you can explain, test, and maintain. If it only leaves you with code, it has not finished the job.
