# Fluent game design notes

Reviewed November 7, 2026. Fluent is an independent AI literacy prototype for the public. These are product-design references, not evidence that Fluent improves learning outcomes.

## What Duolingo documents

| Published mechanism | Duolingo's description | Fluent's current translation |
| --- | --- | --- |
| Learn by doing | The [Duolingo Method](https://blog.duolingo.com/duolingo-teaching-method/) introduces concepts through interactive exercises, with optional hints and short explanations. | Every new AI term starts with a three-scene discovery challenge. The choice cards use short cues; the full example, definition, and illustration appear after the learner finds the match. |
| Small steps with feedback | The [Duolingo Method](https://blog.duolingo.com/duolingo-teaching-method/) describes moving from simpler pattern recognition to harder application. | Each lesson has three discovery challenges followed by five application questions. A wrong discovery choice names the other concept and invites another attempt. |
| Visible progress and rewards | [Duolingo 101](https://blog.duolingo.com/duolingo-101-how-to-learn-a-language-on-duolingo/) documents XP, streaks, hearts, and short lessons. | Fluent shows lesson progress, XP, a daily goal, and a streak. Discoveries award 2 XP; questions award 10 XP on a correct answer once per day. Mistakes do not cost hearts. |
| Review rather than only accumulation | Duolingo's [Time Spent Learning Well](https://blog.duolingo.com/time-spent-learning-well/) article explains why it weights progress through lessons and practice rather than raw XP alone. | Fluent has a missed-question practice queue. XP is explicitly participation feedback, not an AI fluency score or a learning-effectiveness claim. |
| Varied exercise formats | Duolingo describes [matching, mistake review, and other practice types](https://blog.duolingo.com/ways-to-practice-in-duolingo/). | Fluent offers logo and model matching, word-vector and next-word experiments, scene choices, and application questions. |

## Interaction rules

1. Ask for one action before showing a new term's definition.
2. Give immediate, specific feedback; allow another attempt without a penalty.
3. Reveal the explanation, visual, and source links after the learner acts.
4. Keep evidence available without making it the main obstacle to progress.
5. Preserve keyboard access, visible focus, responsive layout, and reduced-motion preferences.
6. Save progress in this browser. Repeated actions cannot farm the same XP award on the same day.

## Limits

The examples are authored illustrations. The three-scene activity checks recognition among the examples shown, not general AI fluency. Fluent has not been studied for learning effectiveness. It does not implement Duolingo's adaptive sequencing, leaderboards, or social competition.
