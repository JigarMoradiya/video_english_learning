#!/bin/sh
# Pre-render guard: show EXACTLY what uncommitted source changes the render will ship.
#
# Why: a render always builds from the files on disk — it cannot ship "just the change
# you asked for". A pending rewrite of ai_ay/oi_oy/oa_ow once shipped silently inside a
# logo-only re-render. This banner makes that impossible to miss.
#
# It WARNS, never blocks: during active work src/ is dirty on purpose. The rule is that
# every render states what it ships, and the person rendering confirms the list is only
# what was agreed.

cd "$(dirname "$0")/.." || exit 1

CHANGES=$(git status --porcelain -- src/ public/ remotion.config.ts 2>/dev/null)

if [ -n "$CHANGES" ]; then
  echo "┌─────────────────────────────────────────────────────────────────"
  echo "│ ⚠  THIS RENDER SHIPS UNCOMMITTED CHANGES:"
  git status --porcelain -- src/ public/ remotion.config.ts | sed 's/^/│    /'
  echo "│  If anything here is NOT what was just agreed on, stop and check"
  echo "│  (git stash the rest, or render after committing)."
  echo "└─────────────────────────────────────────────────────────────────"
else
  echo "✓ preflight: src/ clean — render matches the last commit"
fi
exit 0
