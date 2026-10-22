# Local-first AI: a plain-English starter

Most AI tools in this guide run on someone else's computer. You type, your words travel over the internet, a model answers, and the company's terms decide what happens to that conversation.

**Local AI** flips that arrangement. The model runs on your own laptop, desktop, or server. Your prompts and files can stay on hardware you control, and some tools keep working without an internet connection once everything is installed.

That sounds appealing — and it is, for the right person and the right job. It is also more work than opening a website. This page helps you decide whether it is worth it, choose a first tool, and avoid the privacy and security mistakes that "local" does not magically prevent.

> **The short version:** local AI can be a good fit if you have enough RAM and storage, patience for setup, and a real reason to keep data on your machine. It is not a guarantee of privacy, a free GPU, or a replacement for professional judgment.

## What "local" actually means

There are several arrangements people call local AI:

- **Fully local:** the model and app run on your device. The model file is stored on your disk. After setup, basic generation can work offline.
- **Local app with cloud features:** the model runs locally, but the app may use the internet for updates, account features, telemetry, speech services, or optional cloud models.
- **Self-hosted:** you run a server on your own machine or network, often with a browser interface. It may still call out to external services unless you configure it not to.
- **Local-first:** the app prefers local processing but may fall back to the cloud for some features. Read what is happening in each mode.

"Open source" usually means the source code for the app is available. It does **not** automatically mean the model weights are open, the model is uncensored, or the whole stack is audited. Those are separate questions.

## The trade-offs, honestly

| What local AI can give you | What it asks from you |
| --- | --- |
| More control over where prompts and files live | Enough RAM, storage, and patience for installation |
| No per-message bill or monthly chat quota | Electricity, heat, fan noise, and download bandwidth |
| Offline use after setup, for some tools | Manual updates, model management, and backups |
| Freedom to choose models and interfaces | Model licences still apply; capabilities vary widely |
| Less exposure to a provider changing its free tier | You become responsible for security and maintenance |
| Room to experiment without uploading every test | Setup time, troubleshooting, and occasional breakage |

Local does not mean better. A small local model can be less accurate, weaker at long documents, and slower than a hosted frontier model. If your task is "write a careful summary of a 90-page report," a hosted assistant may do it better. If your task is "help me revise a private draft without sending it to a company," a local model can be the more comfortable choice.

## Privacy: local is not a magic eraser

A local model cannot upload your prompt by itself. The app around it might still:

- check for updates and send usage statistics;
- load templates, fonts, or extensions from the internet;
- use a cloud speech-to-text feature while displaying a local chat;
- write full prompts to a log or crash report;
- sync your folder through Dropbox, OneDrive, iCloud, or a backup service;
- expose a local web interface to your network without a password.

**The useful test:** finish setup, disconnect from the internet, restart the app, and try a basic prompt. If it works, the core path is local. Then turn off telemetry and check the app's network and logging settings. Review the actual privacy documentation instead of trusting a "private by design" badge.

A local tool is also not automatically appropriate for patient information, client records, or regulated data. Your employer's policy, contracts, and legal obligations still apply. If you are not allowed to store a file on your laptop, running a model beside it does not make the file safe.

## Hardware, without the hype

AI models need memory. How much depends on the model's size, how compressed it is (quantization), how much text you give it at once (context), and whether your graphics card can help.

These are **rough planning numbers**, not requirements or guarantees:

| Your machine | Realistic starting point |
| --- | --- |
| 8 GB RAM, no dedicated GPU | Small 3B–4B models, compressed to fit. Short prompts, modest speed. Expect fans and patience. |
| 16 GB RAM, modern integrated graphics | 7B–9B models, compressed. Usable for drafts, summaries, and experiments. |
| 32 GB RAM or a GPU with 8–12 GB VRAM | 13B–14B models may be comfortable; 7B–9B models generally run well. |
| 32 GB+ unified memory (Apple Silicon) | A good range of 7B–14B models; larger models may work but slowly. |
| 24 GB+ VRAM | Larger models and image generation become practical. Still not a guarantee of quality or speed. |
| CPU only | Possible for small models and utilities; expect much slower generation and image work. |

Other practical facts:

- **Storage:** a compressed 7B model can take a few gigabytes; larger models can be tens of gigabytes. Image models, checkpoints, and adapters add up quickly.
- **Memory bandwidth** often matters more than raw CPU speed for text generation.
- **Context length** consumes memory. A model that fits with a short prompt may run out of memory when you paste a long document.
- **Quantization** shrinks models and usually reduces quality a little. Q4 is a common compromise; lower-bit versions are smaller and rougher.
- **Battery and heat:** laptops may throttle, drain quickly, or become uncomfortable. Plug in and use a hard surface.

Before downloading, check the model card for memory guidance, licence, and intended use. Start small. A model that runs is more useful than a bigger one that crashes.

## Pick a first lane

### Text chat, the easiest doors

- [LM Studio](tools/chat.md#tool-lm-studio) — a GUI for downloading and chatting with local models. Friendly if you prefer buttons to commands.
- [Jan](tools/chat.md#tool-jan) — an open-source desktop chat app designed for local or connected models.
- [GPT4All](tools/chat.md#tool-gpt4all) — a desktop app aimed at approachable local chat and document questions.
- [Ollama](tools/chat.md#tool-ollama) — a command-line-first way to run models locally, popular with developers and tinkerers.
- [Open WebUI](tools/chat.md#tool-open-webui) — a browser-based interface you run yourself, often used with Ollama.
- [LibreChat](tools/chat.md#tool-librechat) — a self-hosted chat interface with more setup and configuration.
- [KoboldCpp](tools/writing.md#tool-koboldcpp) and [Text Generation WebUI](tools/writing.md#tool-text-generation-webui) — more knobs, more control, more patience.

**First choice for a non-technical beginner:** LM Studio, Jan, or GPT4All. Pick one. Resist the urge to install all four.

### Images on your own machine

- [Upscayl](tools/images.md#tool-upscayl) — upscales images locally with a simple interface. A low-risk first local tool.
- [IOPaint](tools/images.md#tool-iopaint) — local inpainting and object removal.
- [ComfyUI](tools/images.md#tool-comfyui) — a node-based image workflow tool. Powerful, and not the gentlest first step.
- [Stable Diffusion WebUI](tools/images.md#tool-stable-diffusion-webui) — a long-standing local image interface with extensions and many settings.
- [Fooocus](tools/images.md#tool-fooocus) — a simpler interface built for generating images without a wall of settings.
- [InvokeAI](tools/images.md#tool-invokeai) — a local creative studio with a more guided workflow.

Image generation is memory-hungry. A laptop that chats happily may struggle to generate a large image. Start with a small resolution, one image, and one model. Check the model's licence before using output commercially.

### Audio and video utilities

- [Whisper](tools/audio.md#tool-whisper) — OpenAI's open-source speech recognition project; can run locally through several interfaces.
- [MacWhisper](tools/audio.md#tool-macwhisper) — a Mac app for local transcription, with free and paid tiers.
- [Kokoro TTS](tools/audio.md#tool-kokoro-tts) — a lightweight open TTS project.
- [AudioCraft](tools/audio.md#tool-audiocraft) — audio and music research code from Meta; setup is technical.
- [Ultimate Vocal Remover](tools/audio.md#tool-ultimate-vocal-remover) — local stem separation for audio you have the right to use.

### Coding locally

- [Continue](tools/coding.md#tool-continue-dev) — an open-source coding assistant that connects to local or hosted models.
- [Aider](tools/coding.md#tool-aider) — a terminal-based pair-programming tool.
- [Cline](tools/coding.md#tool-cline) — an agent-style coding extension with a review step.
- [Tabby](tools/coding.md#tool-tabby) — a self-hosted code-completion server.

A local coding model can be useful for boilerplate and explanations; it does not remove the need for tests, review, and dependency checks.

### Automation and personal knowledge

- [n8n](tools/productivity.md#tool-n8n) — self-hostable workflow automation.
- [Activepieces](tools/productivity.md#tool-activepieces) — open-source automation with a friendly visual builder.
- [Khoj](tools/productivity.md#tool-khoj) — a self-hostable personal AI assistant that can search your own notes and documents.

## A sane first local evening

Plan for 60–90 minutes. You are not building a data center. You are answering one question: **does a local tool do a real job well enough on this machine?**

1. **Check your resources.** Look at RAM, free disk space, and whether you have a dedicated GPU. Close the apps you are not using.
2. **Pick one app.** For text, try LM Studio or Jan. For a simple image utility, Upscayl. Do not install a full stack.
3. **Download from the official source.** Use the provider's site or its official GitHub releases. Avoid repackaged "AI bundles," random installers, and websites that add their own download wrapper.
4. **Choose a small model first.** A 3B–4B model is a sensible first test on a modest laptop. Read the model card for memory needs and licence.
5. **Try one real, non-sensitive task.** Ask for a plain-English explanation, a short outline, or a rewrite of a paragraph you wrote. Notice speed, quality, and how much you have to correct.
6. **Disconnect and repeat.** Turn off Wi-Fi and try the same prompt. This tells you whether your core path is actually local.
7. **Check the settings.** Disable telemetry or usage sharing if offered. Find where models and chat history are stored. Read the app's privacy notes.
8. **Test a long input.** Paste a public document of the length you actually use. Watch memory and speed. If it fails, try a smaller model or shorter context.
9. **Decide.** If it does not save time or give you a meaningful privacy benefit, uninstall it. "Local" is not a moral obligation.
10. **Write down what worked.** Model name, app, settings, and the job. Future-you will not remember which of six model files was the good one.

## Security rules for local tools

- **Prefer official model sources and official releases.** Model files can be large and hard to inspect. A friendly download page is not a trust signal.
- **Avoid unknown pickle files.** Some model formats can execute code when loaded. Prefer formats such as GGUF or safetensors from reputable publishers, and treat `trust_remote_code` as a serious decision, not a default click.
- **Read the licence.** Open weights may restrict commercial use, require attribution, or carry acceptable-use terms. A local download does not grant rights.
- **Keep your local server local.** Bind it to `127.0.0.1` unless you intentionally need network access. If you expose a web interface to the internet, use authentication, TLS, updates, and a network setup you understand. Never port-forward an unsecured chat UI.
- **Watch extensions and plugins.** An extension can read files, make network calls, or run tools with your permissions. Install fewer, from sources you trust.
- **Update deliberately.** Updates can fix security issues, but they can also change defaults or break models. Read release notes for tools you depend on.
- **Back up your work, not just the app.** Keep prompts, outputs, and configuration somewhere you can restore. Model downloads can be replaced; your project files may not be.
- **Do not paste secrets.** A local model cannot steal an API key by itself, but its logs, clipboard integrations, extensions, and sync services can expose one. Keep keys in environment variables, not chats.
- **Use least privilege.** Run the app as your normal user; do not grant full-disk access unless the tool genuinely needs it.

## Model licences in plain English

"Open source" gets used loosely in AI. Ask three questions:

1. **Is the app's source code available?** That is software openness.
2. **Are the model weights available, and under what licence?** That is model openness. Some weights are open with conditions; some are research-only; some prohibit certain commercial uses.
3. **Are the training data and output rights clear?** Often they are not fully clear. That uncertainty matters for commercial publishing.

For client work, publishing, or products you sell, keep a record of the model, licence, and date you checked it. When a licence is ambiguous, choose a different model or ask for permission. The fact that a model is free to download is not a commercial licence.

## Local AI and this guide

The guide labels local-capable software as **open source** or **self-hosted** where that is the free path. Read each listing's limits: some tools are free apps with paid features, some require a separate model, and some are research projects rather than polished consumer products.

Relevant category pages:

- [Chat and general assistants](tools/chat.md)
- [Writing and editing](tools/writing.md)
- [Images and design](tools/images.md)
- [Audio, music and voice](tools/audio.md)
- [Coding and development](tools/coding.md)
- [Productivity and automation](tools/productivity.md)

New to the vocabulary? The [glossary](glossary.md) explains GGUF, quantization, tokens, inference, and other terms you will meet while setting up.

## When local AI is not worth it

Choose a hosted free tier — with appropriate caution — if:

- your laptop has less RAM than the smallest model needs;
- you need the strongest writing, reasoning, or image quality for a demanding task;
- you need it working today, not after a weekend of setup;
- you cannot maintain updates and security;
- the task involves data your policies prohibit on your own devices anyway;
- you are paying more in time and electricity than a small paid plan would cost.

Local AI is a tool, not an identity. The right choice is the one that fits the job, the hardware, and the responsibility you can actually carry.
