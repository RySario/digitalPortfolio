// ============================================
// MUSIC PLAYER MODULE
// Optional background music with controls
// ============================================

import CONFIG from './config.js';

class MusicPlayer {
  constructor() {
    this.audio = null;
    this.isPlaying = false;
    this.isEnabled = CONFIG.music.enabled;
    this.musicFile = CONFIG.music.file;
    this.defaultVolume = CONFIG.music.defaultVolume || 0.3;

    // DOM elements
    this.playerContainer = document.getElementById('music-player');
    this.toggleButton = document.getElementById('music-toggle');
    this.volumeSlider = document.getElementById('volume-slider');
    this.controlsPanel = document.querySelector('.music-controls');

    if (!this.isEnabled) {
      this.playerContainer.remove();
      return;
    }

    this.init();
  }

  init() {
    // Create audio element
    this.audio = new Audio();
    this.audio.loop = true;
    this.audio.volume = this.defaultVolume;

    // Check if music file exists
    this.checkMusicFile();

    // Setup event listeners
    this.setupEventListeners();

    // Show player
    this.playerContainer.classList.remove('hidden');
  }

  async checkMusicFile() {
    try {
      // Try to load the music file
      const response = await fetch(this.musicFile, { method: 'HEAD' });

      if (response.ok) {
        this.audio.src = this.musicFile;
        this.audio.load();
      } else {
        console.warn(`Music file not found: ${this.musicFile}`);
        this.showError();
      }
    } catch (error) {
      console.warn('Music file not available:', error);
      this.showError();
    }
  }

  setupEventListeners() {
    // Toggle play/pause
    this.toggleButton.addEventListener('click', () => {
      if (this.isPlaying) {
        this.pause();
      } else {
        this.play();
      }
    });

    // Show/hide controls on hover
    this.playerContainer.addEventListener('mouseenter', () => {
      if (this.audio.src) {
        this.controlsPanel.classList.remove('hidden');
      }
    });

    this.playerContainer.addEventListener('mouseleave', () => {
      this.controlsPanel.classList.add('hidden');
    });

    // Volume control
    this.volumeSlider.addEventListener('input', (e) => {
      const volume = e.target.value / 100;
      this.audio.volume = volume;
    });

    // Handle audio events
    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.updateButton();
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.updateButton();
    });

    this.audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      this.showError();
    });

    // Auto-pause when page is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.isPlaying) {
        this.pause();
      }
    });
  }

  play() {
    if (!this.audio.src) {
      console.warn('No audio source available');
      return;
    }

    // Play audio with promise handling
    const playPromise = this.audio.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('Music playing');
        })
        .catch(error => {
          console.warn('Audio play failed:', error);
          // Some browsers require user interaction before playing
          this.showPlayPrompt();
        });
    }
  }

  pause() {
    this.audio.pause();
  }

  updateButton() {
    const icon = this.toggleButton.querySelector('i');

    if (this.isPlaying) {
      icon.className = 'fas fa-pause';
      this.toggleButton.classList.add('playing');
    } else {
      icon.className = 'fas fa-play';
      this.toggleButton.classList.remove('playing');
    }
  }

  showError() {
    this.toggleButton.style.opacity = '0.5';
    this.toggleButton.style.cursor = 'not-allowed';
    this.toggleButton.title = 'Music file not found. Add a file to /music/background.mp3';

    // Disable controls
    this.volumeSlider.disabled = true;
  }

  showPlayPrompt() {
    // Show a temporary message
    const message = document.createElement('div');
    message.style.cssText = `
      position: fixed;
      bottom: 90px;
      right: 20px;
      background: var(--bg-card);
      border: 1px solid var(--accent-magenta);
      border-radius: 8px;
      padding: 12px 16px;
      color: var(--text-primary);
      font-family: var(--font-mono);
      font-size: 0.85rem;
      z-index: 999;
      animation: fadeInUp 0.3s ease;
    `;
    message.textContent = 'Click again to play music';
    document.body.appendChild(message);

    // Remove after 3 seconds
    setTimeout(() => {
      message.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => message.remove(), 300);
    }, 3000);
  }

  // Public methods
  setVolume(volume) {
    this.audio.volume = Math.max(0, Math.min(1, volume));
    this.volumeSlider.value = volume * 100;
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  destroy() {
    if (this.audio) {
      this.pause();
      this.audio.src = '';
      this.audio.load();
    }
  }
}

// Initialize and export
let musicPlayerInstance = null;

export function initMusicPlayer() {
  if (!musicPlayerInstance) {
    musicPlayerInstance = new MusicPlayer();
  }
  return musicPlayerInstance;
}

export default MusicPlayer;
