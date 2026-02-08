# Codex Notes For This Repo (`jekyll-theme-cs50`)

## What This Repo Is
This repo is the public-site Jekyll theme (non-Canvas). Course content repos like `~/foa-website` typically use it for the standalone site.

## Scope Rules
- Keep this theme focused on public-site rendering.
- Do not add Canvas UI/chrome selectors or Canvas-specific hacks here (examples: `.ic-*`, `#wrapper`, `#content`).
- If a bug only happens inside Canvas, fix it in the Canvas theme override repo (typically `~/canvas-jekyll-theme`).
- If the same component must look correct in both Canvas and the public site, implement the styling in both theme repos rather than trying to make one repo guess the other environment.
