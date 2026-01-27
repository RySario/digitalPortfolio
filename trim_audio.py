#!/usr/bin/env python3
"""
Trim MP3 files to 20 seconds
Uses pydub library (requires ffmpeg/avconv installed)
"""

import os
import sys

try:
    from pydub import AudioSegment
except ImportError:
    print("ERROR: pydub not installed")
    print("Install with: pip install pydub")
    sys.exit(1)

# Directory containing MP3 files
music_dir = "music"

# Duration in milliseconds (20 seconds = 20000 ms)
trim_duration = 20 * 1000

print("Trimming MP3 files to 20 seconds...")
print("=" * 50)

files_processed = []
files_failed = []

for filename in os.listdir(music_dir):
    if filename.endswith(".mp3") and not filename.startswith("temp_"):
        filepath = os.path.join(music_dir, filename)
        print(f"\nProcessing: {filename}")

        try:
            # Load audio file
            audio = AudioSegment.from_mp3(filepath)

            # Get original duration
            original_duration = len(audio) / 1000  # Convert to seconds
            print(f"  Original duration: {original_duration:.1f}s")

            # Trim to 20 seconds
            trimmed_audio = audio[:trim_duration]

            # Save trimmed audio (overwrites original)
            trimmed_audio.export(filepath, format="mp3", bitrate="192k")

            # Get new duration
            new_duration = len(trimmed_audio) / 1000
            print(f"  New duration: {new_duration:.1f}s")

            # Get file size
            file_size = os.path.getsize(filepath) / 1024 / 1024  # MB
            print(f"  New file size: {file_size:.2f}MB")
            print(f"  ✓ Successfully trimmed!")

            files_processed.append(filename)

        except Exception as e:
            print(f"  ✗ Error: {str(e)}")
            files_failed.append(filename)

print("\n" + "=" * 50)
print(f"\nSummary:")
print(f"  Successfully processed: {len(files_processed)}")
print(f"  Failed: {len(files_failed)}")

if files_processed:
    print(f"\n  Trimmed files:")
    for f in files_processed:
        print(f"    - {f}")

if files_failed:
    print(f"\n  Failed files:")
    for f in files_failed:
        print(f"    - {f}")

print("\nDone!")
