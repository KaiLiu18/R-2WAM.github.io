# R²-WAM project website

Project page for **What Visual Representations Do World Action Models Need?**

Intended GitHub Pages URL: https://kailiu18.github.io/R-2WAM.github.io/

## Preview

This is a static site with no build step or external runtime dependencies.

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. To publish, configure GitHub Pages to deploy from the `main` branch and the repository root. `.nojekyll` preserves the static files as written.

## Content and assets

- `index.html`: paper title, authors, findings, results, robot evaluation, and citation.
- `styles.css`: responsive layout, figure viewer, and reduced-motion support.
- `script.js`: grouped Table 1 gain-over-baseline explorer, accessible research tabs, figure viewer, and citation copy.
- `assets/images/overview.webp`: the corrected paper teaser (RoboTwin 92.8%).
- `assets/images/integration.webp`: the five-mechanism diagram extracted from Figure 2 of the submitted manuscript.
- `assets/images/mechanisms.webp`: the 13-source RQ2 figure.
- `assets/images/composition.webp`: the RQ3 figure including C-RADIOv4.
- `assets/images/air-fryer.webp`, `pick-place.webp`, `sweeping.webp`, and `cup-pushing.webp`: crops from the original supplementary demonstration video.
- `assets/videos/real-world-demos.mp4`: the original supplementary video, transcoded for web delivery. No new experiment footage was generated.

The numerical values in the source explorer are the reported means from Table 1. Bars show gains in percentage points over the selected condition’s VAE-only baseline. General-purpose and specialized encoders are grouped separately, sorted within each group, and share an explicitly labeled axis; raw success rates and group means remain visible. The five-mechanism architecture figure is in RQ2 alongside its evaluation results. Sweeping is explicitly labeled as debris collection rate; the other physical tasks use complete-task success.

## When the preprint is available

1. Replace the "arXiv preprint forthcoming" notice with the published link.
2. Update the citation from the temporary project-page reference to the official paper citation.
3. Add a research-code link only when its repository is public; the current footer link points to this website's source.

No arXiv identifier, code-release URL, publication venue, or author contact address is assumed.

Paper figures and experiment footage belong to their respective authors.
