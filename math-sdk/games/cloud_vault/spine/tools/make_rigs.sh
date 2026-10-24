#!/bin/sh
# Regenerate the chest/frame rigs and their .spine projects (character/symbols come from V28).
set -e
SPINE="${SPINE:-/Applications/Spine.app/Contents/MacOS/Spine}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
/usr/bin/python3 "$ROOT/tools/make_rigs.py"
for rig in chest frame screens; do
  rm -f "$ROOT/$rig/$rig.spine"
  "$SPINE" -i "$ROOT/$rig/$rig.json" -o "$ROOT/$rig/$rig.spine" -r
done
