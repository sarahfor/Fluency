# Fluent: Learn AI one game at a time

A public, web-first AI learning prototype for anyone. **Unit 1, Try AI in everyday life**, has four short interactive moves: draft a message, ask a follow-up, summarize notes, and check an answer. **Unit 2, The language of AI**, retains the 15 core terms across five lessons. Players can also try the logo and model challenges, **Speak, then what?**, and **The Word Map**.

The everyday path gives an authored result before naming the concept. Its scenes do not call a live model or send a message. The terminology lessons begin with three quick scene challenges: choose an example, get immediate feedback, then reveal the concept and illustration. See [GAME_DESIGN.md](GAME_DESIGN.md) for the Duolingo product references, the mechanics used here, and the limits of this prototype.

**Live site:** https://sarahfor.github.io/Fluency/

The Word Map uses a tiny authored text collection to build context-count vectors, compare word pairs, and show how changing one sentence changes the result. A second activity lets you guess a continuation and inspect counts from two different prompts. Its word-level examples are teaching aids; they do not run word2vec, a tokenizer, or a language model. The historical stereotype example comes from [Bolukbasi et al. (2016)](https://arxiv.org/pdf/1607.06520). The tokenizer splits text into pieces; the language model predicts a continuation.

Sources are linked beside the learning activities. Scores and XP record practice, not validated fluency. Progress is saved in your browser. There is no account, backend, or cross-device sync.

**Speak, then what?** uses authored situations and a simulated dictation error. It does not record audio or send messages. The categories follow the official descriptions of [Wispr Flow dictation](https://docs.wisprflow.ai/articles/2772472373-what-is-flow), [OpenAI transcription workflows](https://developers.openai.com/api/docs/guides/transcription), and [Gemini Live voice conversations](https://support.google.com/gemini/answer/15274899).

## Run locally

From the repository root:

```sh
python3 -m http.server 4176
```

Then open http://127.0.0.1:4176/.

## Code and research

This repository contains the static browser app used by GitHub Pages. The lesson and game content lives in `content.json`, `activities.json`, and `embedding-game-data.js`; the client-side logic is in the JavaScript modules. [Google's embedding-space guide](https://developers.google.com/machine-learning/crash-course/embeddings/embedding-space), [Google's language-model guide](https://developers.google.com/machine-learning/crash-course/llm), and the [2016 word-embeddings paper](https://arxiv.org/pdf/1607.06520) support the concepts in The Word Map. The toy data and its limits are described in the game itself. The [research references](RESEARCH_REFERENCES.md) give full citations and explain how each source relates to Fluent.
