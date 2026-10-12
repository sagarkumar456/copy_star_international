#!/usr/bin/env bash
set -e

KEY="$HOME/Downloads/ssh-key-rutemate_frontend.key"
SERVER="ubuntu@80.225.220.220"

echo "🚀 [1/3] Staging and pushing changes to GitHub..."
git add .
if ! git diff-index --quiet HEAD --; then
  COMMIT_MSG="${1:-Update website $(date '+%Y-%m-%d %H:%M:%S')}"
  git commit -m "$COMMIT_MSG"
fi
git push origin main

echo "📡 [2/3] Updating live server via SSH..."
ssh -i "$KEY" -o BatchMode=yes -o StrictHostKeyChecking=accept-new "$SERVER" \
  "cd /home/ubuntu/copy_star_international && git pull origin main && sudo cp -r dist/* /var/www/html/ && sudo chown -R www-data:www-data /var/www/html"

echo "✅ [3/3] Deployed successfully!"
echo "👉 Live URL: https://copystarinternational.com"
