# Fluent: Learn AI one game at a time

A public, web-first AI learning prototype for anyone. **Know the Logo** opens the site. The progress map then brings together the everyday AI game, **Build a tiny app**, the voice game, **The Word Map**, **Know the Model**, and five short terminology lessons.

The everyday game gives an authored result before naming the concept. Its scenes do not call a live model or send a message. **Build a tiny app** is a separate game: players describe, test, improve, and download a working checklist app. It uses a browser template rather than a live AI coding model. The terminology lessons begin with three quick scene challenges: choose an example, get immediate feedback, then reveal the concept and illustration. See [GAME_DESIGN.md](GAME_DESIGN.md) for the Duolingo product references, the mechanics used here, and the limits of this prototype.

**Live site:** https://sarahfor.github.io/Fluency/

The Word Map uses a tiny authored text collection to build context-count vectors, compare word pairs, and show how changing one sentence changes the result. Players then match two word analogies and compare their choices with outputs reported for a historical word2vec embedding in [Bolukbasi et al. (2016)](https://arxiv.org/pdf/1607.06520). One output reflects a gender stereotype; matching it is not scored as a good answer. A final activity lets players guess a continuation and inspect counts from two different prompts. The authored examples do not run word2vec, a tokenizer, or a language model. The tokenizer splits text into pieces; the language model predicts a continuation.

Sources are linked beside the learning activities. The map marks games and lessons played; it is not a fluency score. Progress is saved in your browser. There is no account, backend, or cross-device sync.

**Speak, then what?** uses authored situations and a simulated dictation error. It does not record audio or send messages. The categories follow the official descriptions of [Wispr Flow dictation](https://docs.wisprflow.ai/articles/2772472373-what-is-flow), [OpenAI transcription workflows](https://developers.openai.com/api/docs/guides/transcription), and [Gemini Live voice conversations](https://support.google.com/gemini/answer/15274899).

## Run locally

From the repository root:

```sh
python3 -m http.server 4176
```

Then open http://127.0.0.1:4176/.

## Code and research

This repository contains the static browser app used by GitHub Pages. The lesson and game content lives in `content.json`, `activities.json`, and `embedding-game-data.js`; the client-side logic is in the JavaScript modules. [Google's embedding-space guide](https://developers.google.com/machine-learning/crash-course/embeddings/embedding-space), [Google's language-model guide](https://developers.google.com/machine-learning/crash-course/llm), and the [2016 word-embeddings paper](https://arxiv.org/pdf/1607.06520) support the concepts in The Word Map. The toy data and its limits are described in the game itself. The [research references](RESEARCH_REFERENCES.md) give full citations and explain how each source relates to Fluent.
