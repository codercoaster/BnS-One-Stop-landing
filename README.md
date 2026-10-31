# B&S One Stop — Landing

Static landing page (mockup) for **B&S One Stop — Best Hot Dogs in Town**, 1823 Superior St, Columbia, SC.

- `index.html`, `css/styles.css`, `js/main.js` — no build step.
- Animations: GSAP 3.13 (ScrollTrigger, SplitText, DrawSVG) + Lenis, loaded from jsDelivr.
- Images: `assets/img/` (WebP-optimized, resized copies of the originals in `assets/images/`, incl. `logo.webp`, `logo-sm.webp`, favicon and apple-touch icon from `B&S LOGO.png`).

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy to GitHub Pages

Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)`.
All paths are relative, so it works under `https://<user>.github.io/<repo>/`.
