#!/bin/bash
# Urban Nail Bar - Sync MacOS + Windows folders (run on Mac or Git Bash)
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PARENT="$(cd "$ROOT/.." && pwd)"
MAC=""
WIN=""

if [[ "$(basename "$ROOT")" == *"MacOS"* ]]; then
  MAC="$ROOT"
  WIN="$PARENT/Urban Nail Bar (Windows)"
else
  WIN="$ROOT"
  MAC="$PARENT/Urban Nail Bar (MacOS)"
fi

echo "============================================"
echo "  Urban Nail Bar - SYNC BOTH FOLDERS"
echo "============================================"
echo "  MacOS:   $MAC"
echo "  Windows: $WIN"
echo ""

if [ ! -f "$MAC/package.json" ] || [ ! -f "$WIN/package.json" ]; then
  echo "ERROR: Could not find both Urban Nail Bar folders side by side."
  read -r _
  exit 1
fi

echo "Choose sync direction:"
echo "  [1] This folder -> sibling"
echo "  [2] Sibling -> this folder"
echo "  [3] Cancel"
read -r -p "Select 1-3: " CHOICE

PS1="$WIN/scripts/SYNC-FOLDERS.ps1"
if [ ! -f "$PS1" ]; then
  PS1="$MAC/scripts/SYNC-FOLDERS.ps1"
fi

case "$CHOICE" in
  1)
    if [[ "$(basename "$ROOT")" == *"MacOS"* ]]; then
      SRC="$MAC"; DST="$WIN"
    else
      SRC="$WIN"; DST="$MAC"
    fi
    ;;
  2)
    if [[ "$(basename "$ROOT")" == *"MacOS"* ]]; then
      SRC="$WIN"; DST="$MAC"
    else
      SRC="$MAC"; DST="$WIN"
    fi
    ;;
  *) echo "Cancelled."; exit 0 ;;
esac

echo ""
echo "Syncing: $SRC -> $DST"
if command -v powershell.exe >/dev/null 2>&1; then
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$PS1" -Source "$SRC" -Dest "$DST"
elif command -v pwsh >/dev/null 2>&1; then
  pwsh -NoProfile -File "$PS1" -Source "$SRC" -Dest "$DST"
else
  # Portable rsync fallback (code + data; skip node_modules/.git)
  rsync -a --delete --exclude node_modules --exclude .git --exclude '_patch-scheduler-launch.js' "$SRC/" "$DST/"
  echo "Synced via rsync."
fi

echo ""
echo "IMPORTANT: Only ONE computer should run the Node server as source of truth."
echo "Press Return to close."
read -r _
