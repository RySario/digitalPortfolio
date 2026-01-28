# Media Folder

Place your images and videos here for the About section gallery.

## Supported Formats

**Images:**
- JPG/JPEG
- PNG
- GIF
- WebP

**Videos:**
- MP4
- WebM
- OGG

## Tips

- Use square images (1:1 aspect ratio) for best results
- Compress images before uploading (use TinyPNG or similar)
- Recommended image size: 800x800px or smaller
- Keep file sizes under 2MB for faster loading

## Example Files

Add your files like:
- `photo1.jpg`
- `photo2.jpg`
- `video1.mp4`

Then update `js/config.js` to reference them:

```javascript
mediaFiles: [
  { type: "image", src: "media/LydiaRyanGrad.jpg", alt: "Description" },
  { type: "image", src: "media/photo2.jpg", alt: "Description" },
  { type: "video", src: "media/video1.mp4", alt: "Description" },
]
```
