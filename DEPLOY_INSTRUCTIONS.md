Deployment instructions
=======================

This project now includes PWA icons, a manifest and mobile CSS tweaks.

How to commit & push the changes from your machine
-------------------------------------------------

1. Open a new Terminal and go to the project folder:

```bash
cd ~/Desktop/my-project
```

2. (Optional) Inspect changes:

```bash
git status
git diff --staged
```

3. Use the provided helper script to add, commit and push the files:

```bash
bash scripts/deploy-to-github.sh
```

Notes
-----
- If push prompts for credentials, enter your GitHub username and a Personal Access Token (PAT) as the password for HTTPS, or set up SSH keys and push with SSH.
- If you prefer to commit manually, run:

```bash
git add public/pwa-192x192.svg public/pwa-512x512.svg public/manifest.webmanifest src/index.css index.html
git commit -m "Add PWA icons, manifest and mobile CSS tweaks"
git push
```

Next steps
----------
- Build production and test PWA install locally:

```bash
npm run build
npx serve -s dist
```

- Deploy to GitHub Pages automatically: create a GitHub Actions workflow or use `gh-pages`. Ask me and I can generate the workflow file for you.
