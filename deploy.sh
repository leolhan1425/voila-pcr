#!/bin/bash
set -e

echo "Building..."
npx vite build

echo "Deploying to qpcr.hanlabnw.com..."
rsync -avz --delete dist/ root@89.167.19.159:/opt/voila-pcr/dist/

echo "Done! https://qpcr.hanlabnw.com"
