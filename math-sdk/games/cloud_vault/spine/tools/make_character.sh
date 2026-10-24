#!/bin/sh
# Generate the character rig (runtime JSON with meshes + physics) and pack its atlas into the game.
# Spine Essential cannot open meshes/physics, so there is no character.spine: make_character.py is the source.
set -e
SPINE="${SPINE:-/Applications/Spine.app/Contents/MacOS/Spine}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/../frontend/public/spine/character"
# Source, first found: the approved master frame as one mesh (character/master), the layered heroine
# (character/layers, see character/BRIEF_layered_character.md), else the V28 pieces.
if [ -f "$ROOT/character/master/master.png" ]; then
  /usr/bin/python3 "$ROOT/tools/make_master_rig.py"
elif [ -f "$ROOT/character/layers/body.png" ]; then
  /usr/bin/python3 "$ROOT/tools/make_heroine.py" --check
  /usr/bin/python3 "$ROOT/tools/make_heroine.py"
else
  /usr/bin/python3 "$ROOT/tools/make_character.py"
fi
rm -rf "$OUT" && mkdir -p "$OUT"
cp "$ROOT/character/character.json" "$OUT/character.json"
"$SPINE" -i "$ROOT/character/images" -o "$OUT" -n character -p "$ROOT/tools/pack_character.json"
