# GitHub Pages workflow

- Added `.github/workflows/deploy.yml` to build and deploy with GitHub Pages using `actions/configure-pages@v5`, `upload-pages-artifact@v3`, and `deploy-pages@v4`.
- `VITE_BASE_PATH` is set from `steps.pages.outputs.base_path` during build so assets resolve for both custom domains (`/`) and repo pages (`/repo/`).
- Introduced `.gitignore` to exclude `node_modules`, `dist`, and temp files from version control.
- Context: requested to prepare for GitHub Pages deploy while honoring styling-guide deployment rules.
