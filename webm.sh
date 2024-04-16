#!/bin/bash

# Function to convert video to WebM
convert_to_webm() {
  local input_file="$1"
  echo "converting ${input_file}"
  local output_file="${input_file%.*}.webm"
  
  ffmpeg -i "$input_file" -c:v libvpx-vp9 -crf 30 -b:v 0 -b:a 128k -c:a libopus "$output_file"
}

# Recursively find and convert MP4 files
find ./content -type f -name "*.mov" -print0 | while IFS= read -r -d '' file; do
  convert_to_webm "$file"
done
