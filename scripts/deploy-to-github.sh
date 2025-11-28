#!/usr/bin/env bash
set -euo pipefail

# Simple helper to add, commit and push the PWA files we created.
# Run from repository root: bash scripts/deploy-to-github.sh

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "Staging PWA files and CSS..."
git add public/pwa-192x192.svg public/pwa-512x512.svg public/manifest.webmanifest src/index.css index.html || true

MSG="Add PWA icons, manifest and mobile CSS tweaks"
echo "Committing with message: $MSG"
git commit -m "$MSG" || echo "No changes to commit"

echo "Pushing to origin main..."
git push origin main

echo "Done. If git prompts for credentials, provide your GitHub username and a Personal Access Token (PAT) as password, or configure SSH keys/credential helper." 
