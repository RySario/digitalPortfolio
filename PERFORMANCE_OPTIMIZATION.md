# Performance Optimization Guide - Fix Unresponsive Loading

## 🚨 Problem
Application becomes unresponsive after loading screen, showing black screen with "page unresponsive" warning. Takes 2-3 minutes to become interactive.

## 🔍 Root Cause: Massive Asset Sizes (131 MB)

### PRIMARY ISSUE: Your Assets Are Too Large

**FBX Model File:**
- File: `public/cyberpunk-store/source/poopy.fbx`
- Current Size: **60 MB** ❌
- Target Size: **<10 MB** ✅
- Issue: Blocks main thread for 30-60 seconds during parsing

**Texture Files:**
- Directory: `public/cyberpunk-store/textures/`
- Current Total: **71 MB** (20 files)
- Largest files:
  - `low_poly_Stand_Normal.png`: 18 MB
  - `low_poly_Stand_BaseColor.png`: 16 MB
  - `low_poly_Metal_Normal.png`: 10 MB
  - `low_poly_Metal_BaseColor.png`: 5 MB
- Target: **<2 MB per texture**

**⚠️ Web hosting won't help!** The bottleneck is CPU/GPU processing, not network. Moving to production hosting will actually make it SLOWER due to network transfer time.

---

## 🎯 Quick Fix (40-50% Improvement - Can Do Now)

These code changes can be implemented immediately without touching assets:

### 1. Reduce Shadow Maps

**File:** `src/core/Engine.js`

**Change lines 195-209 (neon lights):**
```javascript
Config.lighting.neonLights.forEach((lightConfig, index) => {
  const light = new THREE.PointLight(
    lightConfig.color,
    lightConfig.intensity,
    lightConfig.distance,
    lightConfig.decay
  )
  light.position.set(
    lightConfig.position.x,
    lightConfig.position.y,
    lightConfig.position.z
  )

  // Only first light casts shadows
  light.castShadow = (index === 0)

  if (light.castShadow) {
    light.shadow.mapSize.width = 512   // Reduced from 1024
    light.shadow.mapSize.height = 512
  }

  this.scene.add(light)
})
```

**Change lines 186-194 (directional light):**
```javascript
directionalLight.shadow.mapSize.width = 1024   // Reduced from 2048
directionalLight.shadow.mapSize.height = 1024
```

**Change lines 222-244 (spotlights):**
```javascript
spotlight.castShadow = false  // Changed from true
// Remove all shadow map size lines since shadows are disabled
```

### 2. Remove Excessive Logging

**File:** `src/building/CyberpunkStoreModel.js`

**Replace lines 127-140:**
```javascript
// OLD CODE (remove this):
console.log(`Mesh ${meshCount}: ${child.name}`)
console.log(`  Material: ${materialName}`)
console.log(`  Position (local): ...`)
console.log(`  Position (world): ...`)

// NEW CODE (keep only this):
meshCount++
if (materialName.toLowerCase().includes('pantalla')) {
  console.log(`  ⭐ Screen mesh found: ${child.name}`)
}
```

**After the traverse loop, add:**
```javascript
console.log(`Total meshes: ${meshCount}`)
console.log(`Unique materials: ${Array.from(materialNames).join(', ')}`)
```

---

## 🔥 Critical Fix (80-90% Improvement - REQUIRED for Production)

### 1. Compress FBX Model

**Using Blender (Free):**
1. Download Blender: https://www.blender.org/download/
2. File → Import → FBX → Select `poopy.fbx`
3. In Object Mode:
   - Select all objects (A key)
   - Delete hidden/unused objects
4. Apply Decimate Modifier:
   - Select mesh → Add Modifier → Decimate
   - Set Ratio to 0.5 (reduces polygons by 50%)
   - Click Apply
5. File → Export → FBX
   - Enable "Apply Modifiers"
   - Check file size - should be <10 MB
6. Replace original file

**Target: Reduce from 60 MB to <10 MB**

### 2. Compress Textures

**Option A: Using ImageMagick (Command Line):**
```bash
# Install ImageMagick first
# Then navigate to textures folder:
cd public/cyberpunk-store/textures/

# Resize all textures to 50% size
magick mogrify -resize 50% -quality 85 *.png

# Check file sizes
ls -lh
```

**Option B: Using Online Tool:**
1. Go to https://tinypng.com/
2. Upload all PNG files from `public/cyberpunk-store/textures/`
3. Download compressed versions
4. Replace original files

**Option C: Using Photoshop/GIMP:**
1. Open each large texture (>5 MB)
2. Image → Image Size → Reduce to 50% (2048×2048 instead of 4096×4096)
3. Save with compression (JPEG quality 85 or PNG-8)

**Target: All textures <2 MB each**

---

## 📊 Expected Results

| What | Before | After | Improvement |
|------|--------|-------|-------------|
| Total Asset Size | 131 MB | <30 MB | **77% smaller** |
| FBX Load Time | 30-60s | 3-5s | **85% faster** |
| Texture Load Time | 20-40s | 3-5s | **80% faster** |
| Shadow GPU Memory | 28 MB | 2 MB | **93% reduction** |
| Total Load Time | **2-3 minutes** | **8-15 seconds** | **85% faster** |

---

## 🧪 Testing

### After Code Changes:
```bash
npm run dev
```

**In Browser:**
1. Open DevTools (F12)
2. Go to Performance tab
3. Click Record
4. Refresh page
5. Stop recording when scene loads
6. Check for:
   - ❌ Red bars >1 second (long tasks)
   - ✅ Should see smooth progression
   - ✅ No "page unresponsive" warnings

### After Asset Compression:
1. Check file sizes:
   ```bash
   # Check FBX size
   ls -lh public/cyberpunk-store/source/poopy.fbx

   # Check texture sizes
   ls -lh public/cyberpunk-store/textures/
   ```

2. Run app and verify:
   - Loading screen completes smoothly
   - No black screen
   - No "page unresponsive" warning
   - Scene appears within 10-15 seconds

---

## 🎓 Why This Happens

### The Technical Breakdown:

1. **FBX Parsing (30-60s):**
   - 60 MB binary file parsed on main thread
   - JavaScript blocked while parsing
   - Browser shows "unresponsive"

2. **Texture Upload (20-40s):**
   - 71 MB of images uploaded to GPU
   - Each texture creates GPU buffers
   - Hundreds of material instances

3. **Shadow Map Rendering (10-20s):**
   - 7 lights × shadow maps = scene rendered 7+ times
   - First frame is extremely expensive
   - 28 MB GPU memory just for shadows

4. **Result:**
   - Total: 60-120 seconds blocked
   - User sees loading screen → black screen → unresponsive
   - Eventually recovers after all processing completes

---

## 💡 Additional Optimization (Optional)

### Material Deduplication

**File:** `src/building/CyberpunkStoreModel.js` - Rewrite `loadTextures()` method

**Current Problem:** Creates new material for every mesh (hundreds of instances)

**Better Approach:** Create 6 materials total (one per type), reuse them

```javascript
loadTextures(fbx, textureLoader) {
  const textureBasePath = '/cyberpunk-store/textures/'

  // Create material library (ONE of each type)
  const materials = {
    metal: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.6,
      roughness: 0.4,
      side: THREE.DoubleSide
    }),
    pantalla: new THREE.MeshStandardMaterial({
      color: 0x00d9ff,
      emissive: 0x00d9ff,
      emissiveIntensity: 0.6,
      metalness: 0.1,
      roughness: 0.2,
      side: THREE.DoubleSide
    }),
    stand: new THREE.MeshStandardMaterial({
      color: 0x6b4423,
      metalness: 0.1,
      roughness: 0.8,
      side: THREE.DoubleSide
    }),
    blinn4: new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      emissive: 0xffaa00,
      emissiveIntensity: 0.2,
      metalness: 0.2,
      roughness: 0.6,
      side: THREE.DoubleSide
    }),
    blinn5: new THREE.MeshStandardMaterial({
      color: 0x777777,
      metalness: 0.3,
      roughness: 0.6,
      side: THREE.DoubleSide
    }),
    blinn9: new THREE.MeshStandardMaterial({
      color: 0x555555,
      metalness: 0.3,
      roughness: 0.7,
      side: THREE.DoubleSide
    }),
    default: new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.2,
      roughness: 0.7,
      side: THREE.DoubleSide
    })
  }

  const texturePromises = []

  // Load textures into materials (ONE TIME)
  texturePromises.push(
    new Promise((resolve) => {
      textureLoader.load(
        textureBasePath + 'low_poly_Metal_BaseColor.png',
        (texture) => {
          materials.metal.map = texture
          materials.metal.needsUpdate = true
          console.log('✓ Metal texture loaded')
          resolve()
        },
        undefined,
        (err) => {
          console.error('✗ Metal texture failed')
          resolve()
        }
      )
    })
  )

  // Repeat for other textures: stand, blinn4, blinn5, blinn9
  // (pantalla uses emissive only, no texture)

  // Assign materials to meshes (REUSE, don't create new)
  fbx.traverse((child) => {
    if (child.isMesh) {
      const materialNameLower = child.material?.name?.toLowerCase() || 'unknown'

      if (materialNameLower.includes('metal')) {
        child.material = materials.metal
      } else if (materialNameLower.includes('pantalla')) {
        child.material = materials.pantalla
      } else if (materialNameLower.includes('stand')) {
        child.material = materials.stand
      } else if (materialNameLower.includes('blinn4')) {
        child.material = materials.blinn4
      } else if (materialNameLower.includes('blinn5')) {
        child.material = materials.blinn5
      } else if (materialNameLower.includes('blinn9')) {
        child.material = materials.blinn9
      } else {
        child.material = materials.default
      }
    }
  })

  return Promise.allSettled(texturePromises)
}
```

**Benefit:** Reduces material instances from hundreds to 6 total. Saves memory and GPU upload time.

---

## 📝 Summary

**Priority 1 (CRITICAL):**
- ✅ Compress FBX model to <10 MB
- ✅ Compress textures to <2 MB each

**Priority 2 (Quick Wins):**
- ✅ Disable shadows on 5 of 7 lights
- ✅ Reduce shadow map resolution
- ✅ Remove excessive console logs

**Priority 3 (Optional):**
- ⚪ Deduplicate materials
- ⚪ Remove model scale multiplier

**Expected Result:**
From **2-3 minutes unresponsive** → **8-15 seconds smooth loading**

---

## 🆘 Need Help?

If you're stuck on asset compression:
- Blender tutorials: https://www.youtube.com/results?search_query=blender+reduce+file+size
- TinyPNG: https://tinypng.com/ (easiest option for textures)
- ImageMagick docs: https://imagemagick.org/

The code changes are straightforward - just reduce shadow maps and remove logs. The asset compression is what takes time but gives 80%+ of the benefit.
