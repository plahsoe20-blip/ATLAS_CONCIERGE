#!/bin/bash
cd /workspaces/ATLAS_CONCIERGE
git add backend-nestjs/package-lock.json
git commit -m "chore: Add package-lock.json from NestJS dependencies installation"
git push origin main
echo "✅ Changes pushed to GitHub"
