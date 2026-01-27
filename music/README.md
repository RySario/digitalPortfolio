# Music Folder

Place your background music file here.

## Supported Formats

- MP3 (recommended)
- OGG
- WAV

## Instructions

1. Add your music file to this folder (e.g., `background.mp3`)
2. Update the path in `js/config.js`:

```javascript
music: {
  enabled: true,
  file: "music/background.mp3",
  defaultVolume: 0.3
}
```

## Tips

- Keep file size under 5MB for faster loading
- Use MP3 format for best browser compatibility
- Consider using instrumental music or lo-fi beats
- Make sure you have the rights to use the music
- Test volume levels (0.3 = 30% volume is a good default)

## Disable Music

To disable the music player, set `enabled: false` in `js/config.js`:

```javascript
music: {
  enabled: false,
  // ...
}
```
