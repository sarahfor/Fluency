# How the Algorithm Sees You

An interactive HCI music-recommendation prototype by Ctrl Alt Elite. Built with plain HTML, CSS, and JavaScript.

Participants can try three preference input formats, review three anonymous sets of ten songs, rate fit and familiarity, select a preferred set, and download their session as JSON.

## Sample mode

All song sets are fixed examples. No LLM calls, screenshot extraction, playlist integration, or study-data backend is connected. Inputs and ratings stay in browser-tab memory and clear on reload. Sample ratings are marked as simulated in exported sessions.

## Run locally

From this directory, run:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Hosting

GitHub Pages serves the repository root on the `main` branch. Changes to `index.html`, `style.css`, or `app.js` are published after pushing to `main`.
