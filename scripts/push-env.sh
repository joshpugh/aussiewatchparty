#!/usr/bin/env bash
# Pushes every non-empty key in .env.local to the linked Vercel project
# for the `production` and `preview` environments.
#
# Usage: ./scripts/push-env.sh
# Requires: vercel CLI logged in, project linked (`vercel link`).
set -euo pipefail

ENV_FILE="${1:-.env.local}"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE" >&2
  exit 1
fi

SKIP_KEYS=("NEXT_PUBLIC_SITE_URL")  # set per-env separately

# Strip comments + blank lines, only export KEY=VALUE lines
while IFS= read -r line || [[ -n "$line" ]]; do
  # skip empty / comment
  [[ -z "${line// }" ]] && continue
  [[ "${line:0:1}" == "#" ]] && continue

  key="${line%%=*}"
  value="${line#*=}"

  [[ -z "$value" ]] && { echo "skip (empty): $key"; continue; }

  skip=0
  for s in "${SKIP_KEYS[@]}"; do
    if [[ "$key" == "$s" ]]; then skip=1; break; fi
  done
  if [[ $skip -eq 1 ]]; then echo "skip (manual): $key"; continue; fi

  for env in production preview; do
    # Remove existing value silently, then add fresh
    printf '%s' "$value" | vercel env rm "$key" "$env" --yes >/dev/null 2>&1 || true
    printf '%s' "$value" | vercel env add "$key" "$env" >/dev/null
    echo "set: $key ($env)"
  done
done < "$ENV_FILE"

echo
echo "Done. NEXT_PUBLIC_SITE_URL was skipped — set it manually so production/preview can differ."
