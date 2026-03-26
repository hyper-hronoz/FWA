#!/usr/bin/env bash

set -euo pipefail

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg is required but was not found in PATH." >&2
  exit 1
fi

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <video-file> [video-file ...]" >&2
  exit 1
fi

process_file() {
  local input="$1"

  if [ ! -f "$input" ]; then
    echo "Skipping '$input': file not found." >&2
    return 1
  fi

  local dir base name ext temp backup codec_args
  dir="$(dirname "$input")"
  base="$(basename "$input")"
  name="${base%.*}"
  ext="${base##*.}"
  temp="$dir/${name}.pingpong.tmp.${ext}"
  backup="$dir/${base}.bak"

  case "${ext,,}" in
    mp4)
      codec_args=(-c:v libx264 -pix_fmt yuv420p -movflags +faststart)
      ;;
    webm)
      codec_args=(-c:v libvpx-vp9 -pix_fmt yuv420p)
      ;;
    *)
      echo "Skipping '$input': unsupported extension '$ext'." >&2
      return 1
      ;;
  esac

  rm -f "$temp"

  ffmpeg -y -i "$input" \
    -filter_complex "[0:v]split[forward][reverse_src];[reverse_src]reverse[backward];[forward][backward]concat=n=2:v=1:a=0[v]" \
    -map "[v]" \
    "${codec_args[@]}" \
    -an \
    "$temp"

  cp "$input" "$backup"
  mv "$temp" "$input"
  echo "Updated '$input' (backup: '$backup')."
}

for file in "$@"; do
  process_file "$file"
done
