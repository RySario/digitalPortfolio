# Billboard Setup Guide

## Quick Start

Your billboard system is now set up with easy content management! Here's how to use it:

### Step 1: Place Your Media Files

Create these folders if they don't exist:
```
public/
├── images/
│   └── (put your .jpg, .png files here)
└── videos/
    └── (put your .mp4, .webm files here)
```

**IMPORTANT - File Naming:**
- ✅ Use simple names: `banner.jpg`, `demo-reel.mp4`
- ❌ Avoid spaces: NOT `The Estate Server banner.jpg`
- ✅ Use hyphens or underscores: `estate-server-banner.jpg`

### Step 2: Edit the Config File

Open: `src/config/BillboardContent.js`

For a single image on the main billboard:
```javascript
mainBillboard: {
  enabled: true,
  cycleInterval: 8000,
  content: [
    { type: 'image', path: '/images/my-photo.jpg' }
  ]
}
```

For cycling through multiple items:
```javascript
mainBillboard: {
  enabled: true,
  cycleInterval: 5000,  // 5 seconds per item
  content: [
    { type: 'image', path: '/images/photo1.jpg' },
    { type: 'image', path: '/images/photo2.jpg' },
    { type: 'video', path: '/videos/demo.mp4' },
    { type: 'image', path: '/images/photo3.jpg' }
  ]
}
```

### Step 3: Refresh Browser

That's it! Your content will automatically load and cycle.

---

## Common Issues & Fixes

### Issue 1: "Error loading billboard texture"

**Problem:** Wrong file path format

**Wrong:**
```javascript
❌ path: 'public\images\my-file.jpg'      // Backslashes, includes 'public'
❌ path: '\images\my-file.jpg'            // Backslashes
❌ path: 'images/my-file.jpg'             // No leading slash
```

**Correct:**
```javascript
✅ path: '/images/my-file.jpg'            // Forward slashes, leading slash, no 'public'
✅ path: '/videos/my-video.mp4'
```

**Why:**
- Vite automatically serves files from `/public` folder at the root path
- Use forward slashes `/` (not backslashes `\`)
- Include the leading `/`
- Don't include `public` in the path

### Issue 2: File Doesn't Load

**Checklist:**
1. ✅ File is in `/public/images/` or `/public/videos/` folder
2. ✅ Filename matches exactly (case-sensitive!)
3. ✅ Path uses forward slashes: `/images/file.jpg`
4. ✅ Path starts with `/`
5. ✅ No spaces in filename
6. ✅ Check browser console (F12) for specific error message

### Issue 3: Video Doesn't Play

**Solutions:**
- Use MP4 format with H.264 codec (best compatibility)
- Keep file size under 10-20 MB
- Videos auto-play muted (browser requirement)
- Check console for autoplay errors

---

## Examples

### Example 1: Single Image
```javascript
mainBillboard: {
  enabled: true,
  cycleInterval: 8000,
  content: [
    { type: 'image', path: '/images/portfolio-header.jpg' }
  ]
}
```

### Example 2: Cycling Images
```javascript
mainBillboard: {
  enabled: true,
  cycleInterval: 5000,  // Change every 5 seconds
  content: [
    { type: 'image', path: '/images/work-1.jpg' },
    { type: 'image', path: '/images/work-2.jpg' },
    { type: 'image', path: '/images/work-3.jpg' }
  ]
}
```

### Example 3: Mix of Images and Videos
```javascript
mainBillboard: {
  enabled: true,
  cycleInterval: 8000,
  content: [
    { type: 'image', path: '/images/intro.jpg' },
    { type: 'video', path: '/videos/demo-reel.mp4' },
    { type: 'image', path: '/images/projects.jpg' },
    { type: 'video', path: '/videos/showcase.mp4' }
  ]
}
```

### Example 4: Create Custom Billboards
```javascript
customBillboards: [
  {
    name: "Side Display",
    width: 10,
    height: 8,
    position: { x: 20, y: 15, z: 10 },
    rotation: { x: 0, y: 1.5, z: 0 },
    cycleInterval: 6000,
    content: [
      { type: 'image', path: '/images/project-1.jpg' }
    ]
  },
  {
    name: "Video Wall",
    width: 16,
    height: 9,
    position: { x: -20, y: 20, z: 5 },
    rotation: { x: 0, y: -1.5, z: 0 },
    cycleInterval: 8000,
    content: [
      { type: 'video', path: '/videos/project-demo.mp4' }
    ]
  }
]
```

---

## Creating Custom Billboards

You can create your own billboards anywhere in the scene with custom size, position, and rotation!

### Custom Billboard Parameters

Each custom billboard can have these properties:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| **name** | String | Billboard identifier (for debugging) | `"Side Display"` |
| **width** | Number | Billboard width in scene units | `10` |
| **height** | Number | Billboard height in scene units | `8` |
| **position** | Object | 3D position {x, y, z} | `{ x: 20, y: 15, z: 10 }` |
| **rotation** | Object | Rotation in radians {x, y, z} | `{ x: 0, y: 1.5, z: 0 }` |
| **color** | Hex | Base color (optional, default pink) | `0xd946a6` |
| **emissiveIntensity** | Number | Glow intensity 0-1 (optional, default 0.6) | `0.8` |
| **interactive** | Boolean | Clickable? (optional, default false) | `false` |
| **skipFrame** | Boolean | Skip top/bottom frame? (optional, default false) | `false` |
| **cycleInterval** | Number | Time per content item in ms | `6000` |
| **content** | Array | Images/videos to display | See examples above |

### Position Guide

- **x**: Left (-) to Right (+)
- **y**: Down (-) to Up (+)
- **z**: Back (-) to Front (+)

**Main building is at:** `x: 0, y: 0, z: 0`

**Example positions:**
- Right side: `{ x: 20, y: 15, z: 0 }`
- Left side: `{ x: -20, y: 15, z: 0 }`
- Behind: `{ x: 0, y: 20, z: -15 }`
- In front: `{ x: 0, y: 10, z: 20 }`

### Rotation Guide

Rotation values are in **radians** (not degrees).

**Quick conversions:**
- 0° = `0`
- 45° = `0.785` (π/4)
- 90° = `1.57` (π/2)
- 180° = `3.14` (π)
- 270° = `4.71` (3π/2)
- 360° = `6.28` (2π)

**Rotation axes:**
- **x**: Tilt forward/backward
- **y**: Turn left/right (most common)
- **z**: Roll clockwise/counter-clockwise

**Example rotations:**
- Face right: `{ x: 0, y: 1.57, z: 0 }`
- Face left: `{ x: 0, y: -1.57, z: 0 }`
- Face back: `{ x: 0, y: 3.14, z: 0 }`
- Tilted up 45°: `{ x: -0.785, y: 0, z: 0 }`

### Complete Custom Billboard Example

```javascript
customBillboards: [
  {
    name: "Rooftop Billboard",
    width: 20,              // Large billboard
    height: 10,
    position: { x: 0, y: 45, z: 0 },  // High above building
    rotation: { x: -0.5, y: 0, z: 0 }, // Tilted down slightly
    color: 0x00ffff,        // Cyan color
    emissiveIntensity: 0.8, // Bright glow
    interactive: false,
    skipFrame: false,
    cycleInterval: 10000,   // 10 seconds per item
    content: [
      { type: 'image', path: '/images/banner-1.jpg' },
      { type: 'video', path: '/videos/promo.mp4' },
      { type: 'image', path: '/images/banner-2.jpg' }
    ]
  },
  {
    name: "Ground Level Sign",
    width: 6,               // Small billboard
    height: 4,
    position: { x: 15, y: 5, z: 15 }, // Front-right corner
    rotation: { x: 0, y: -0.785, z: 0 }, // Angled toward center
    cycleInterval: 5000,
    content: [
      { type: 'image', path: '/images/logo.png' }
    ]
  }
]
```

---

## File Organization Tips

### Recommended Structure
```
public/
├── images/
│   ├── main/
│   │   ├── slide-1.jpg
│   │   ├── slide-2.jpg
│   │   └── slide-3.jpg
│   └── portfolio/
│       ├── project-1.jpg
│       ├── project-2.jpg
│       └── project-3.jpg
└── videos/
    ├── demo-reel.mp4
    └── intro.mp4
```

Then use paths like:
```javascript
{ type: 'image', path: '/images/main/slide-1.jpg' }
{ type: 'video', path: '/videos/demo-reel.mp4' }
```

---

## Features

✅ **Auto-cycling:** Content automatically rotates
✅ **Mix media:** Combine images and videos
✅ **Easy config:** Just edit one file
✅ **Error handling:** Shows red if file fails to load
✅ **Console logging:** Helpful messages in browser console (F12)
✅ **Custom billboards:** Create unlimited billboards with custom size, position, and rotation
✅ **True colors:** Images and videos display without color tinting
✅ **Flexible placement:** Position billboards anywhere in 3D space
✅ **Individual control:** Each billboard has its own content cycle timing

---

## Common Path Mistakes

Here are common mistakes when setting up billboard paths:

**❌ Wrong - Includes "public" in path:**
```javascript
{ type: 'image', path: 'public/images/my-file.jpg' }
```

**❌ Wrong - Uses backslashes:**
```javascript
{ type: 'image', path: '\\images\\my-file.jpg' }
```

**❌ Wrong - Spaces in filename:**
```
File: public/images/The Estate Server banner.jpg
```

**❌ Wrong - No leading slash:**
```javascript
{ type: 'image', path: 'images/my-file.jpg' }
```

**✅ Correct - Clean format:**
```
File: public/images/estate-server-banner.jpg

Config:
{ type: 'image', path: '/images/estate-server-banner.jpg' }
```

**Why these rules?**
- Vite automatically serves files from `/public` at the root path
- Use forward slashes `/` (not backslashes `\`)
- Include the leading `/`
- Don't include `public` in the path
- Avoid spaces in filenames (use hyphens or underscores instead)

---

## Testing

1. Open browser console (F12)
2. Look for these messages:
   ```
   📺 Starting billboard content cycling...
   📺 Main Billboard: Starting cycle with 1 item(s)
   📺 Main: Loading image: /images/your-file.jpg
   ✅ Successfully loaded: /images/your-file.jpg
   ```

3. If you see ❌ errors, check the path and filename

---

## Need Help?

**Check console messages:** Press F12 in browser, look at Console tab
**Verify file exists:** Check `/public/images/` folder
**Test path:** Type `http://localhost:3002/images/your-file.jpg` in browser
**File size:** Keep images under 5 MB, videos under 20 MB

---

## Where is Everything?

| What | Where |
|------|-------|
| **Configure content** | `src/config/BillboardContent.js` |
| **Add images** | `public/images/` |
| **Add videos** | `public/videos/` |
| **Billboard system code** | `src/building/BillboardSystem.js` |
| **Engine initialization** | `src/core/Engine.js` (line ~90) |

Happy billboard-ing! 🎉
