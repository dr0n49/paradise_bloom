#!/bin/sh
# Export every Spine project in games/cloud_vault/spine/<name>/<name>.spine to
# frontend/public/spine/<name>/ (JSON + packed atlas). Run after editing in the Spine editor.
set -e
SPINE="${SPINE:-/Applications/Spine.app/Contents/MacOS/Spine}"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
for proj in "$ROOT"/spine/*/*.spine; do
  name="$(basename "$proj" .spine)"
  out="$ROOT/frontend/public/spine/$name"
  rm -rf "$out" && mkdir -p "$out"
  settings="$ROOT/spine/tools/export_$name.json"
  if [ -f "$settings" ]; then
    "$SPINE" -i "$proj" -o "$out" -e "$settings"
  else
    "$SPINE" -i "$proj" -o "$out" -e json+pack
  fi
  # The runtime uses a versioned address so old celebration textures are not reused.
  if [ "$name" = "frame" ]; then
    revised="$ROOT/frontend/public/spine/frame-v6"
    rm -rf "$revised" && mkdir -p "$revised"
    cp "$out"/* "$revised"/
  fi
  if [ "$name" = "screens" ]; then
    revised="$ROOT/frontend/public/spine/screens-v10"
    rm -rf "$revised" && mkdir -p "$revised"
    cp "$out"/* "$revised"/
  fi
done
# The character has no .spine project (meshes + physics need Spine Professional): it is generated.
"$ROOT/spine/tools/make_character.sh"
