#!/bin/bash
set -e

echo "Building..."
npx vite build

echo "Deploying frontend to qpcr.hanlabnw.com..."
rsync -avz --delete dist/ root@89.167.19.159:/opt/voila-pcr/dist/

echo "Deploying server..."
rsync -avz server/ root@89.167.19.159:/opt/voila-pcr/server/

echo "Installing server dependencies & restarting API..."
ssh root@89.167.19.159 "cd /opt/voila-pcr && npm install --omit=dev && systemctl restart voilapcr-api"

echo "Done! https://qpcr.hanlabnw.com"
echo "Note: voilapcr.com deployment will be via Vercel when configured."
