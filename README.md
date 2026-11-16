# Fluent: Learn AI one game at a time

A public, web-first AI learning prototype for anyone. **Know the Logo** opens the site. The progress map moves through everyday AI, voice tools, **Know the Model**, a word-embedding prediction challenge, and five short terminology lessons before **Build a tiny app**.

The everyday game gives an authored result before naming the concept. Its scenes do not call a live model or send a message. **Build a tiny app** is a separate game: players describe, test, improve, and download a working checklist app. It uses a browser template rather than a live AI coding model. The terminology lessons begin with three quick scene challenges: choose an example, get immediate feedback, then reveal the concept and illustration. See [GAME_DESIGN.md](GAME_DESIGN.md) for the Duolingo product references, the mechanics used here, and the limits of this prototype.

**Live site:** https://sarahfor.github.io/Fluency/

**What did the model predict?** asks one question: what a historical word2vec embedding returned for “man is to computer programmer as woman is to ?” Players compare their guess with the output reported in [Bolukbasi et al. (2016)](https://arxiv.org/pdf/1607.06520). The output reflects a gender stereotype. Matching it is not scored as a good answer; the game does not run the model or a current chatbot.

Sources are linked beside the learning activities. The map marks games and lessons played; it is not a fluency score. Progress is saved in your browser. There is no account, backend, or cross-device sync.

**Speak, then what?** uses authored situations and a simulated dictation error. It does not record audio or send messages. The categories follow the official descriptions of [Wispr Flow dictation](https://docs.wisprflow.ai/articles/2772472373-what-is-flow), [OpenAI transcription workflows](https://developers.openai.com/api/docs/guides/transcription), and [Gemini Live voice conversations](https://support.google.com/gemini/answer/15274899).

## Run locally

From the repository root:

```sh
python3 -m http.server 4176
```

Then open http://127.0.0.1:4176/.

## Code and research

This repository contains the static browser app used by GitHub Pages. The lesson and game content lives in `content.json`, `activities.json`, and `embedding-game-data.js`; the client-side logic is in the JavaScript modules. The [2016 word-embeddings paper](https://arxiv.org/pdf/1607.06520) supports the historical output in **What did the model predict?** Its answer choices are authored for the game. The [research references](RESEARCH_REFERENCES.md) give full citations and explain how each source relates to Fluent.
