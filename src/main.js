import Engine from './core/Engine.js'

// Async initialization function
async function init() {
  console.log('Starting 3D Portfolio...')

  try {
    // Create and initialize engine
    const engine = new Engine()
    await engine.init()

    // Make engine globally accessible for debugging
    window.engine = engine

    console.log('Cyberpunk Portfolio fully initialized!')
    console.log('Click and drag to rotate camera. Click the main billboard to view portfolio!')

  } catch (error) {
    console.error('Failed to initialize 3D Portfolio:', error)

    // Show error to user
    const loadingScreen = document.getElementById('loading-screen')
    if (loadingScreen) {
      const loadingText = loadingScreen.querySelector('.loading-text')
      if (loadingText) {
        loadingText.textContent = 'Error loading portfolio. Check console for details.'
        loadingText.style.color = '#ff6b6b'
      }
    }
  }
}

// Wait for DOM to be ready, then initialize
document.addEventListener('DOMContentLoaded', init)
