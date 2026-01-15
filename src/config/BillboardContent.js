/**
 * Billboard Content Configuration
 *
 * Easy-to-edit file for managing billboard images and videos
 * Just add your file paths here and they'll automatically load!
 *
 * INSTRUCTIONS:
 * 1. Place your images in: public/images/
 * 2. Place your videos in: public/videos/
 * 3. Add the paths to the arrays below
 * 4. Refresh your browser!
 */

export const BillboardContent = {
  /**
   * Main Billboard (large billboard at top of building)
   * Cycles through these images/videos in order
   * Change interval: time in milliseconds (5000 = 5 seconds)
   */
  mainBillboard: {
    enabled: true,
    cycleInterval: 8000, // 8 seconds per item
    content: [
      // Add your image and video paths here
      // Examples (uncomment and modify):
    { type: 'image', path: '/images/grad.jpg'}
      // { type: 'image', path: '/images/portfolio-header.jpg' },
      // { type: 'image', path: '/images/my-work.png' },
      // { type: 'video', path: '/videos/demo-reel.mp4' },
      // { type: 'image', path: '/images/skills-showcase.jpg' },

      
    ]
  },

  /**
   * Custom Billboards - Create your own billboards anywhere!
   * Each billboard is fully customizable with position, size, rotation, and content
   */
  customBillboards: [
    // Example billboard (commented out - uncomment and modify to use):
    // {
    //   name: "Side Display",                    // Billboard name (for debugging)
    //   width: 10,                               // Width in scene units
    //   height: 8,                               // Height in scene units
    //   position: { x: 20, y: 15, z: 10 },      // 3D position (x, y, z)
    //   rotation: { x: 0, y: 1.5, z: 0 },       // Rotation in radians (x, y, z)
    //   color: 0xd946a6,                         // Base color (hex) - pink/magenta default
    //   emissiveIntensity: 0.6,                  // Glow intensity (0-1)
    //   interactive: false,                      // Make billboard clickable?
    //   skipFrame: false,                        // Skip top/bottom frame bars?
    //   cycleInterval: 6000,                     // Time per content item (milliseconds)
    //   content: [
    //     { type: 'image', path: '/images/my-image.jpg' },
    //     { type: 'video', path: '/videos/my-video.mp4' },
    //   ]
    // },

    // Add more custom billboards here...
  {
    name: "Top Board",
    width: 2,
    height: 2, 
    position: {x:-19, y:42.55, z:9},
    color: 0xd946a6,
    cycleInterval: 3000, 
    content: [
      {type: 'image', path: '/images/ryLydiaGrad.JPG'},
      {type: 'image', path: '/images/circus.jpg'},
      {type: 'image', path: '/images/treeKiss.JPG'},
    ]
  },
  {
    name: "Top Mid Board",
    width: 2,
    height: 2, 
    position: {x:-19, y:39, z:9},
    color: 0xd946a6,
    cycleInterval: 3000, 
    content: [
      {type: 'image', path: '/images/japStreet.JPG'},
      {type: 'image', path: '/images/broProposal.JPG'},
      {type: 'image', path: '/images/familyGrad.JPG'},
    ]
  }
  ]
}

/**
 * QUICK START EXAMPLES:
 *
 * === MAIN BILLBOARD ===
 *
 * 1. Add a single image to main billboard:
 *    content: [
 *      { type: 'image', path: '/images/my-photo.jpg' }
 *    ]
 *
 * 2. Cycle through 3 images:
 *    content: [
 *      { type: 'image', path: '/images/photo1.jpg' },
 *      { type: 'image', path: '/images/photo2.jpg' },
 *      { type: 'image', path: '/images/photo3.jpg' }
 *    ]
 *
 * 3. Mix images and videos:
 *    content: [
 *      { type: 'image', path: '/images/intro.jpg' },
 *      { type: 'video', path: '/videos/demo.mp4' },
 *      { type: 'image', path: '/images/outro.jpg' }
 *    ]
 *
 * 4. Use a solid color instead:
 *    content: [
 *      { type: 'color', color: 0xff0000 } // Red color
 *    ]
 *
 * === CUSTOM BILLBOARDS ===
 *
 * 5. Create a custom billboard to the right of the building:
 *    customBillboards: [
 *      {
 *        name: "Right Side Display",
 *        width: 12,
 *        height: 9,
 *        position: { x: 25, y: 20, z: 0 },
 *        rotation: { x: 0, y: -1.5, z: 0 },
 *        cycleInterval: 8000,
 *        content: [
 *          { type: 'image', path: '/images/project-showcase.jpg' }
 *        ]
 *      }
 *    ]
 *
 * 6. Create multiple billboards with different content:
 *    customBillboards: [
 *      {
 *        name: "Portfolio 1",
 *        width: 8,
 *        height: 6,
 *        position: { x: -20, y: 15, z: 10 },
 *        rotation: { x: 0, y: 0.5, z: 0 },
 *        cycleInterval: 5000,
 *        content: [
 *          { type: 'image', path: '/images/work-1.jpg' },
 *          { type: 'image', path: '/images/work-2.jpg' }
 *        ]
 *      },
 *      {
 *        name: "Video Display",
 *        width: 16,
 *        height: 9,
 *        position: { x: 0, y: 30, z: -15 },
 *        rotation: { x: 0, y: 0, z: 0 },
 *        cycleInterval: 10000,
 *        content: [
 *          { type: 'video', path: '/videos/demo-reel.mp4' }
 *        ]
 *      }
 *    ]
 *
 * TIPS:
 * - Position: x (left/right), y (up/down), z (forward/back)
 * - Rotation: Values in radians (0 to 6.28). Use 1.57 for 90°, 3.14 for 180°
 * - Width/Height: Experiment with values between 5-20 for good results
 * - Color: Use hex colors like 0xff0000 (red), 0x00ff00 (green), 0x0000ff (blue)
 */
