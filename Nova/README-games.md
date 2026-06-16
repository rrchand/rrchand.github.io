# NovaDesk Web OS with Games Pack

This update adds a full offline games pack to NovaDesk.

## Added games

• Games Hub
• Snake
• Pong
• Breakout
• Falling Blocks
• Space Defender
• Flappy Orb
• Minesweeper
• Memory Match
• 2048
• Tic Tac Toe
• Simon Says
• Whack-a-Mole
• Maze Runner
• Reaction Test
• Number Guess
• Word Scramble
• Slide Puzzle

## Install into the existing NovaDesk project

1. Save `app-games.js` in the same folder as the other NovaDesk files.
2. Replace your existing HTML entry file with `github-index.html`, or rename `github-index.html` to `index.html` for GitHub Pages.
3. Replace `main.js` with the updated version if you want the Games Hub desktop shortcut and right-click menu option.
4. Keep all original files in the same folder.

## Run locally

```bash
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

You can also open `novadesk.html` directly in a browser.

## GitHub Pages

Rename `github-index.html` to `index.html`, push all files to the repository root, then enable GitHub Pages from repository settings.

## Notes

All games are implemented with plain HTML, CSS and JavaScript. No external assets, downloads or network APIs are required.
