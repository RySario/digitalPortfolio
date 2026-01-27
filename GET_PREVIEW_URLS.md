# How to Get Spotify Preview URLs

Your songs need preview URLs to play directly on your site. Here's how to get them:

## Method 1: Using Spotify Web (Easiest)

1. Open your Spotify track in a web browser (e.g., https://open.spotify.com/track/2yACYwM6qjqt1n5iez7TeK)
2. Right-click on the page and select "Inspect" or press F12
3. Go to the "Network" tab in the developer tools
4. Play the song preview (30-second clip)
5. In the Network tab, filter by "mp3" or look for a file starting with "mp3-preview"
6. Right-click on that file and select "Copy > Copy URL"
7. This is your preview URL! Add it to the `previewUrl` field in `js/config.js`

## Method 2: Using a Preview URL Extractor

1. Go to: https://spotify-downloader.com/ (or any Spotify preview extractor)
2. Paste your Spotify track URL
3. Look for the "30-second preview" option
4. Copy the preview URL
5. Add it to your config

## Method 3: Use Node.js Script (Most Reliable)

Create a file called `getPreviewUrls.js`:

```javascript
// Install: npm install spotify-web-api-node
const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET'
});

// Get track IDs from your URLs
const trackIds = [
  '2yACYwM6qjqt1n5iez7TeK',  // Love Blur
  '01JPQ87UHeGysPVwTqMJHK',  // She Don't
  '40WWeoX26jtsfdmFx5iRty',  // I'm Low On Gas
  '39LLxExYz6ewLAcYrzQQyP'   // Levitating
];

spotifyApi.clientCredentialsGrant().then(
  data => {
    spotifyApi.setAccessToken(data.body['access_token']);

    return spotifyApi.getTracks(trackIds);
  }
).then(
  data => {
    data.body.tracks.forEach(track => {
      console.log(`${track.name}: ${track.preview_url}`);
    });
  }
).catch(err => console.log(err));
```

Get Spotify credentials at: https://developer.spotify.com/dashboard

## Quick Fix for Now

I've added example preview URLs to your config. They might not work for all songs. To test:
1. Click a play button on your site
2. If it doesn't play, follow Method 1 above to get the correct URL
3. Replace the `previewUrl` in your config with the correct one

## Note
- Preview URLs are 30-second clips
- They're publicly accessible (no auth needed)
- They expire after some time (may need to update occasionally)
- Not all songs have preview URLs available
