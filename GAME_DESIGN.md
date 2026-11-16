# Fluent game design notes

Reviewed November 15, 2026. Fluent is an independent AI literacy prototype for the public. These are product-design references, not evidence that Fluent improves learning outcomes.

For complete author–date citations and a clear distinction between research, product descriptions, and further reading, see [Research references](RESEARCH_REFERENCES.md).

## What Duolingo documents

| Published mechanism | Duolingo's description | Fluent's current translation |
| --- | --- | --- |
| Learn by doing | The [Duolingo Method](https://blog.duolingo.com/duolingo-teaching-method/) introduces concepts through interactive exercises, with optional hints and short explanations. | The everyday game gives a practical action before a concept name. In the terminology lessons, every new AI term starts with a three-scene discovery challenge; the full example, definition, and illustration appear after the learner finds the match. |
| Small steps with feedback | The [Duolingo Method](https://blog.duolingo.com/duolingo-teaching-method/) describes moving from simpler pattern recognition to harder application. | Each terminology lesson has three discovery challenges followed by five application questions. A wrong choice invites another attempt. |
| Visible progress | [Duolingo 101](https://blog.duolingo.com/duolingo-101-how-to-learn-a-language-on-duolingo/) documents short lessons and visible progress. | Fluent marks games and lessons played on one path. There is no XP, streak, or daily goal in the interface. Mistakes do not cost hearts. |
| Review rather than only accumulation | Duolingo's [Time Spent Learning Well](https://blog.duolingo.com/time-spent-learning-well/) article describes practice as part of progress. | Fluent has a missed-question practice queue. A completion mark records participation, not AI fluency or learning effectiveness. |
| Varied exercise formats | Duolingo describes [matching, mistake review, and other practice types](https://blog.duolingo.com/ways-to-practice-in-duolingo/). | Fluent offers the four-move everyday path, logo and model matching, ten historical word-model pairings, scene choices, and application questions. |

## Try AI in everyday life

Reviewed November 8, 2026. Four authored practice scenes follow the logo game in the progress map. A player chooses the details needed for a message, asks a more specific follow-up, selects actions from notes, and corrects a wrong time against an original note. Each successful action first shows a useful authored result, then names the move and links its evidence. These are simulations: no live AI drafts a result, no external fact is checked, and nothing is sent. Closing mid-round restarts the game; completion is remembered in this browser.

The message and follow-up scenes use [OpenAI's prompting guide](https://help.openai.com/en/articles/10032626-prompt-engineering-best-practices-for-chatgpt) for clear instructions, context, tone, and iterative refinement. [OpenAI's ChatGPT FAQ](https://help.openai.com/en/articles/12677804-what-is-chatgpt-faq) supports the follow-up and summarization capabilities illustrated. [OpenAI's truth guide](https://help.openai.com/en/articles/8313428-does-chatgpt-tell-the-truth) supports the advice to verify important claims against reliable sources. These sources support the concepts, not the invented scenes or a claim about learning outcomes.

## Build a tiny app

Added November 15, 2026. This is its own game at the end of the progress map. Players give a checklist app a purpose and first item, test its working preview, request a progress bar, and download a standalone HTML file. It follows the prompt → build → test → revise sequence described in [GitHub's vibe coding tutorial](https://docs.github.com/en/copilot/tutorials/vibe-coding), but this guided implementation uses a fixed template and no live AI model. Its purpose is to let a beginner make and modify something functional, not to demonstrate AI code generation.

## Everyday voice game

Reviewed November 8, 2026. **Speak, then what?** is a separate voice-tools game on the map. Players choose dictation, transcription, or voice conversation for three authored situations, then correct a simulated name error before a simulated send. It uses no microphone, records no audio, and sends no message. Each reveal links to the source for its concept: [Wispr Flow's dictation guide](https://docs.wisprflow.ai/articles/2772472373-what-is-flow), [OpenAI's transcription guide](https://developers.openai.com/api/docs/guides/transcription), and [Google's Gemini Live guide](https://support.google.com/gemini/answer/15274899). These product documents define the categories; they do not show that the game improves learning.

## What did the model predict?

Reviewed November 15, 2026. Ten short rounds ask players to guess published analogy pairings from the historical static word2vec embedding discussed by [Bolukbasi et al. (2016)](https://arxiv.org/pdf/1607.06520). The sequence moves from familiar gendered word pairs in the Introduction and Figure 2 toward social and occupational stereotypes, ending with man:computer programmer :: woman:homemaker. Figure 2's stereotype grouping reflects the paper's crowd-worker ratings. Answer choices and the increasing-difficulty order were written for Fluent; the paper did not evaluate this game or its difficulty. Each round compares a guess with a reported pairing and links to the relevant paper page. The model-match count is descriptive, not a judgment score. The game does not run word2vec or a modern language model.

## Interaction rules

1. Ask for one action before showing a new term's definition.
2. Give immediate, specific feedback; allow another attempt without a penalty.
3. Reveal the explanation, visual, and source links after the learner acts.
4. Keep evidence available without making it the main obstacle to progress.
5. Preserve keyboard access, visible focus, responsive layout, and reduced-motion preferences.
6. Save completion marks in this browser and let players replay any game.

## Limits

The examples are authored illustrations. The three-scene activity checks recognition among the examples shown, not general AI fluency. Fluent has not been studied for learning effectiveness. It does not implement Duolingo's adaptive sequencing, leaderboards, or social competition.
