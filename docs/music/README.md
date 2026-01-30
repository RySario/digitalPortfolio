# Music Folder

Place your music files here for:
1. **Background Music** - Plays automatically on your site
2. **Song Cards** - Individual songs users can click to play

## Supported Formats

- MP3 (recommended)
- OGG
- WAV

---

## Background Music Setup

1. Add your background music file to this folder (e.g., `background.mp3`)
2. Update the path in `js/config.js`:

```javascript
music: {
  enabled: true,
  file: "music/background.mp3",
  defaultVolume: 0.3
}
```

---

## Song Cards Setup (NEW!)

### How to Add Playable Songs:

1. **Get MP3 Files:**
   - Download/convert your songs to MP3 format
   - Name them clearly (e.g., `love-blur.mp3`, `she-dont.mp3`)
   - Place them in this folder

2. **Update Config:**
   - Open `js/config.js`
   - Find the `musicRecommendations` array
   - Set `audioFile: "music/your-song.mp3"` for each song

**Example:**
```javascript
{
  title: "Love Blur",
  artist: "slayr",
  audioFile: "music/love-blur.mp3",  // Your MP3 file
  spotifyUrl: "https://open.spotify.com/...",
  imageUrl: "https://...",
  genre: "Hyperpop Rap"
}
```

### Current Song Files Needed:
- `music/love-blur.mp3`
- `music/she-dont.mp3`
- `music/im-low-on-gas.mp3`
- `music/levitating.mp3`

---

## ⚠️ Legal Considerations

**Copyright Notice:**
- Hosting copyrighted music without permission is copyright infringement
- Even for personal, non-commercial use, it's technically illegal

**Safer Options:**
1. ✅ **30-second clips** - More defensible as preview/fair use
2. ✅ **Royalty-free music** - Completely legal:
   - https://incompetech.com
   - https://freemusicarchive.org
   - https://www.youtube.com/audiolibrary
3. ✅ **Your own music** - You own the rights
4. ✅ **Spotify links** - No files hosted (safest option)

**If You Host MP3s:**
- Risk is very low for personal portfolios
- Similar to using music in personal YouTube videos
- Be prepared to remove files if you get a DMCA notice
- Don't monetize your site

---

## Tips

- Keep file sizes reasonable (under 5MB per song)
- Use MP3 format for best browser compatibility
- Test that files play correctly before deploying
- Consider using only 30-second clips instead of full songs
- Make sure file names match what's in your config exactly

---

## How It Works

- Click play button on song card → Plays your MP3
- If file not found → Opens Spotify instead
- Pause button → Stops playback
- Animated visualizer appears while playing
- Only one song plays at a time
