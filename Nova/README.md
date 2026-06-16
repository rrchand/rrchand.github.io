# NovaDesk Web OS

NovaDesk is a local, browser-based desktop operating system prototype built with plain HTML, CSS and JavaScript.

## Fixed in this build

• Browser app now accepts URLs and search queries. External sites load in an iframe when allowed by the target site, with an Open in new tab fallback.
• Desktop icons and File Explorer items now open with a single click.
• The bottom taskbar search input now accepts typing and can launch apps or browser searches.
• The project is GitHub repository ready with `package.json`, static file structure and launch instructions.

## Run locally

### Direct open

Open `index.html` in a browser.

### Local server

```bash
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

### Using npm

```bash
npm start
```

Then open:

```text
http://localhost:8080
```

## GitHub Pages

1. Push all files to a GitHub repository.
2. Go to Settings > Pages.
3. Select the branch and root folder.
4. Open the published GitHub Pages URL.

## Notes

Some external websites block iframe embedding using security headers. NovaDesk still provides URL/search handling and an Open in new tab fallback for those sites.
