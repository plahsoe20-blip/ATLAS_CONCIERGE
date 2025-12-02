#!/bin/bash
# Quick commit script - minimal version

cd /workspaces/ATLAS_CONCIERGE

echo "Adding changes..."
git add -A

echo "Committing..."
git commit -m "feat: Integrate backend API with frontend

- API services: auth, rides, drivers, websocket
- Real API calls in Store context
- Enhanced LoginPage with error handling
- Documentation and setup scripts
- JWT auth with auto-refresh
- Real-time WebSocket updates
"

echo "Pushing to main..."
git push origin main

echo "Done!"
