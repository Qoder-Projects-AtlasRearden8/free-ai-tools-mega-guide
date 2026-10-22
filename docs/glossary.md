# Plain-English AI glossary

No jargon gates. These are the words you will meet while using the guide, without a computer science lecture attached.

> Definitions are simplified for beginners. Providers sometimes use the same word in different ways. When a term affects money, privacy, or rights, read the provider's own definition.

## A–C

**Agent** — An AI setup that can take several steps toward a goal, often using tools such as a browser, files, or code. Agents need clear limits and human review; "it did it by itself" is not a quality guarantee. See [coding tools](tools/coding.md) for examples.

**API (application programming interface)** — A way for one program to talk to another. An AI API lets your own software send prompts to a model and receive answers. Using an API is usually a developer activity and may require payment.

**API key** — A secret string that identifies your account to an API. Treat it like a password. Never put one in a chat, screenshot, public repository, or prompt.

**ASR (automatic speech recognition)** — Software that turns speech into text. Also called speech-to-text or transcription. See [audio tools](tools/audio.md).

**Benchmark** — A test used to compare models. Benchmarks are useful clues, not proof that a model will do your specific job well. Marketing numbers can be selected, outdated, or gamed.

**BYOK (bring your own key)** — A setup where you use an app with your own API key and account. The app may be open source or free, while model usage is billed by the API provider.

**Chatbot / assistant** — An interface where you type or speak and a model responds. A "general assistant" can handle many topics; a specialized assistant stays closer to one job. They are not people, even when they sound like them.

**Context window** — How much text (and sometimes images or audio) a model can consider at once. A larger window lets you paste more material, but it does not guarantee the model will use it well or remember it perfectly. It also consumes memory and may increase cost.

**Credit** — A unit of usage on some free plans. One generation or message may cost several credits. Check what happens when credits run out and whether they expire.

## D–H

**Deepfake / synthetic media** — Audio, video, or images created or altered to show something that did not happen. Creating intimate or deceptive media of real people without consent can be harmful and illegal. Disclose synthetic media where required.

**Diffusion model** — A type of model used for image and audio generation. It learns to turn noise into a result, guided by your prompt. See [image tools](tools/images.md).

**Embeddings** — Numeric representations of text or other data that let software find similar meaning. Search and "chat with your documents" tools often use embeddings behind the scenes.

**Fine-tuning** — Further training a model on examples to adapt its behavior or style. It is different from prompting. Fine-tuning requires data, compute, and care about rights and bias.

**Free tier** — A no-cost plan with limits. The limits may include daily messages, credits, image resolution, watermarks, storage, model access, or queue priority. See the [safety checklist](free-tier-safety.md).

**GGUF** — A file format commonly used to run compressed language models locally. It is associated with the llama.cpp ecosystem and many desktop apps. See [Local-first AI](local-ai.md).

**Hallucination** — A confident but false or unsupported output. A model is not retrieving the truth by default; it is predicting a plausible response. Verify facts, quotes, citations, and numbers against reliable sources.

**HIPAA** — A U.S. health information privacy law. A consumer AI account is generally not a HIPAA-compliant place for protected health information. This glossary is educational, not legal advice; follow your employer's policy and use approved systems for patient data.

## I–M

**Inference** — The act of running a trained model to get an answer. Training builds the model; inference uses it. Local inference happens on your hardware. Cloud inference happens on a provider's servers.

**Knowledge cutoff** — The point after which a model's training data may not include new events. Some tools can search the web; others cannot. Even with search, check the source and date.

**LLM (large language model)** — A model trained on large amounts of text to predict and generate language. "Large" is relative. LLMs can write, explain, classify, and reason through patterns, but they can also make mistakes and reflect biases in their training data.

**Local AI** — Running an AI model on a device you control rather than sending every request to a cloud service. It can improve privacy and offline access, but setup, hardware, licences, and security still matter. See [Local-first AI](local-ai.md).

**LoRA (low-rank adaptation)** — A small add-on trained to adjust a model's behavior or style without retraining the whole model. LoRA files are popular for image styles and character or brand looks. Check the base model's licence and the LoRA's own terms.

**MCP (Model Context Protocol)** — An open standard for connecting AI apps to tools and data sources in a consistent way. Think of it as a common plug shape. A connector can read files or take actions, so permissions and trust matter.

**Model** — The learned pattern-recognition system behind an AI tool. The app is the interface; the model is the engine. Different models can behave very differently inside the same app.

**Model weights** — The learned numbers that make a model work. "Open weights" means the files are available, but not necessarily under an open-source licence or with permission for any use.

**Multimodal** — Able to work with more than one type of input or output, such as text plus images or audio. A vision model can describe a photo; a multimodal assistant may read a screenshot.

## O–S

**OCR (optical character recognition)** — Turning an image of text into machine-readable text. Useful for scanned forms and accessibility, but always check the result against the original.

**Open source** — In software, source code is available under a licence that allows certain uses, changes, and redistribution. In AI, the term is often used more loosely. Always ask whether the app, the model weights, or both are open — and under what licence.

**Parameters** — The learned values inside a model, often described in billions (for example, "7B"). More parameters can mean more capability and more memory use, but size alone does not determine quality.

**PHI (protected health information)** — Individually identifiable health information protected by rules such as HIPAA in the U.S. Do not put PHI into free consumer AI tools. This guide is education only and does not provide clinical or compliance advice.

**Prompt** — The instruction or input you give a model. Clear context, a specific task, and a desired format usually help. A prompt is not a security boundary; do not put secrets in one.

**Prompt injection** — A malicious instruction hidden in content a model reads, such as a web page or uploaded file, designed to make the model ignore its real instructions. Treat outside content as untrusted, especially when an agent can take actions.

**Quantization** — Compressing a model to use less memory, often by storing weights with fewer bits. A 4-bit model is smaller and usually a bit less accurate than the full version. See [Local-first AI](local-ai.md).

**RAG (retrieval-augmented generation)** — A setup where software first searches a collection of documents, then gives the model relevant passages to answer with. RAG can reduce unsupported answers, but it does not guarantee correctness. Open the original source.

**Rate limit** — A cap on how often or how much you can use a service in a period. Free tiers often have tighter limits or lower-priority queues.

**Seed** — A number that helps make a random generation reproducible. The same seed and settings can produce a similar result, though not always an identical one across tools or versions.

**Self-hosted** — Running software on infrastructure you control. You may avoid a licence fee, but you take on installation, updates, security, backups, and model access. See [Local-first AI](local-ai.md).

**Speech-to-text** — See **ASR**.

**Synthetic media** — Images, audio, video, or text generated or substantially altered by AI. Disclosure may be required by law, a platform, a publisher, or basic honesty.

## T–Z

**Temperature** — A setting that influences randomness. Lower values tend to be more predictable; higher values can be more varied and less reliable. Not every app exposes it.

**Token** — A chunk of text the model processes — often part of a word. Models and pricing are often measured in tokens. A long document uses more tokens than a short paragraph.

**Training data** — The material used to train a model. The quality, diversity, consent status, and licensing of training data are all subjects of active debate and litigation.

**TTS (text-to-speech)** — Software that turns written text into spoken audio. Voice quality and cloning rules vary widely. Only clone a voice with clear permission. See [audio tools](tools/audio.md).

**Vector database** — A storage system for embeddings that makes similarity search practical. You will encounter this under the hood of document-chat and personal-knowledge tools; you rarely need to set one up to try a hosted app.

**Vibe coding** — Building software by describing what you want and letting an AI generate or change code, often with a fast review loop. It can be a useful learning shortcut, not a reason to skip tests, security review, or understanding what you ship.

**Watermark** — A visible or invisible marker on generated output. Some free plans require watermarks; some tools embed provenance markers. Do not assume an invisible watermark is absent just because you cannot see one.

**Weights** — See **model weights**.

---

## The four questions worth memorizing

When a new AI term appears, ask:

1. **What does it do to my data?** Where does it go, who can see it, and does it train on it?
2. **What does it cost when the free limit ends?** Money, time, watermark, rights, or quality?
3. **What must I verify?** Facts, citations, code, permissions, or a human decision?
4. **Who is responsible?** You are. A tool can draft, suggest, and generate. It cannot take responsibility.

For practical next steps, read the [free-tier safety checklist](free-tier-safety.md) or return to [Start here](start-here.md).
