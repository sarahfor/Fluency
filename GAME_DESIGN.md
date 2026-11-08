# Fluent game design notes

Reviewed November 8, 2026. Fluent is an independent AI literacy prototype for the public. These are product-design references, not evidence that Fluent improves learning outcomes.

## What Duolingo documents

| Published mechanism | Duolingo's description | Fluent's current translation |
| --- | --- | --- |
| Learn by doing | The [Duolingo Method](https://blog.duolingo.com/duolingo-teaching-method/) introduces concepts through interactive exercises, with optional hints and short explanations. | Unit 1 gives a practical action before a concept name. In Unit 2, every new AI term starts with a three-scene discovery challenge; the full example, definition, and illustration appear after the learner finds the match. |
| Small steps with feedback | The [Duolingo Method](https://blog.duolingo.com/duolingo-teaching-method/) describes moving from simpler pattern recognition to harder application. | Each Unit 2 lesson has three discovery challenges followed by five application questions. A wrong choice invites another attempt. |
| Visible progress and rewards | [Duolingo 101](https://blog.duolingo.com/duolingo-101-how-to-learn-a-language-on-duolingo/) documents XP, streaks, hearts, and short lessons. | Fluent shows lesson progress, XP, a daily goal, and a streak. Discoveries award 2 XP; questions award 10 XP on a correct answer once per day. Mistakes do not cost hearts. |
| Review rather than only accumulation | Duolingo's [Time Spent Learning Well](https://blog.duolingo.com/time-spent-learning-well/) article explains why it weights progress through lessons and practice rather than raw XP alone. | Fluent has a missed-question practice queue. XP is explicitly participation feedback, not an AI fluency score or a learning-effectiveness claim. |
| Varied exercise formats | Duolingo describes [matching, mistake review, and other practice types](https://blog.duolingo.com/ways-to-practice-in-duolingo/). | Fluent offers the four-move everyday path, logo and model matching, word-vector and next-word experiments, scene choices, and application questions. |

## Unit 1: Try AI in everyday life

Reviewed November 8, 2026. Four authored practice scenes come before the former first unit, now **Unit 2: The language of AI**. A player chooses the details needed for a message, asks a more specific follow-up, selects actions from notes, and corrects a wrong time against an original note. Each successful action first shows a useful authored result, then names the move and links its evidence. These are simulations: no live AI drafts a result, no external fact is checked, and nothing is sent. Closing mid-round restarts Unit 1; completion is remembered in this browser. The path awards 20 XP once per day for completion, a participation marker rather than a fluency score.

The message and follow-up scenes use [OpenAI's prompting guide](https://help.openai.com/en/articles/10032626-prompt-engineering-best-practices-for-chatgpt) for clear instructions, context, tone, and iterative refinement. [OpenAI's ChatGPT FAQ](https://help.openai.com/en/articles/12677804-what-is-chatgpt-faq) supports the follow-up and summarization capabilities illustrated. [OpenAI's truth guide](https://help.openai.com/en/articles/8313428-does-chatgpt-tell-the-truth) supports the advice to verify important claims against reliable sources. These sources support the concepts, not the invented scenes or a claim about learning outcomes.

## Everyday voice game

Reviewed November 8, 2026. **Speak, then what?** follows the everyday path as an optional voice-tools game. Players choose dictation, transcription, or voice conversation for three authored situations, then correct a simulated name error before a simulated send. It uses no microphone, records no audio, and sends no message. Each reveal links to the source for its concept: [Wispr Flow's dictation guide](https://docs.wisprflow.ai/articles/2772472373-what-is-flow), [OpenAI's transcription guide](https://developers.openai.com/api/docs/guides/transcription), and [Google's Gemini Live guide](https://support.google.com/gemini/answer/15274899). These product documents define the categories; they do not show that the game improves learning.

## Interaction rules

1. Ask for one action before showing a new term's definition.
2. Give immediate, specific feedback; allow another attempt without a penalty.
3. Reveal the explanation, visual, and source links after the learner acts.
4. Keep evidence available without making it the main obstacle to progress.
5. Preserve keyboard access, visible focus, responsive layout, and reduced-motion preferences.
6. Save progress in this browser. Repeated actions cannot farm the same XP award on the same day.

## Limits

The examples are authored illustrations. The three-scene activity checks recognition among the examples shown, not general AI fluency. Fluent has not been studied for learning effectiveness. It does not implement Duolingo's adaptive sequencing, leaderboards, or social competition.
