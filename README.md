# Rahul Chand | Intelligent Portfolio OS

This repository contains the fixed multi-file version of the Intelligent Portfolio OS.

## Files

- `index.html` - main portfolio page
- `styles.css` - all styling and animations
- `app.js` - all interactive behaviour

## How to deploy on GitHub Pages

1. Upload all three files to the root of your GitHub repository.
2. Make sure the main file is named `index.html`.
3. Commit the changes.
4. Open the GitHub Pages site and hard refresh the browser.

## What changed

- Viewer Mode is now a popup instead of a large section.
- JavaScript is separated into `app.js`.
- CSS is separated into `styles.css`.
- Buttons use one delegated event system.
- Search, drawer, project modal, command center, CV export, and business card controls are handled from one robust action router.
- Hero decorative boxes were moved into a side dock and hidden on medium screens to avoid blocking content.
- A self-test message appears in the footer.

Expected footer message:

```text
Self-test passed: interactive layer online
```
