# Custom domain base path fix

- Added `public/CNAME` with `mhismail.com` so GitHub Pages serves the site at the domain root.
- Updated deploy workflow to set `VITE_BASE_PATH` to `/` when a CNAME is present (otherwise uses `configure-pages` base path). Prevents `/mohsin-ismail/` asset paths on the custom domain.
- Context: Fixes blank-screen 404s where assets were requested under `/mohsin-ismail/` on the custom domain.
