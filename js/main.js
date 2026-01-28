// ============================================
// MAIN APPLICATION MODULE
// Coordinates all modules and handles app logic
// ============================================

import CONFIG from './config.js';
import { initThreeScene } from './threeScene.js';
import { initGitHub } from './github.js';

class Portfolio {
  constructor() {
    this.threeScene = null;
    this.github = null;
    this.isInitialized = false;

    this.init();
  }

  async init() {
    console.log('🚀 Initializing Digital Portfolio...');

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  async setup() {
    try {
      // Initialize all modules
      this.initializeModules();

      // Populate content from config
      this.populateContent();

      // Setup event listeners
      this.setupEventListeners();

      // Setup scroll animations
      this.setupScrollAnimations();

      // Fetch GitHub projects
      if (this.github) {
        await this.github.fetchRepositories();
      }

      this.isInitialized = true;
      console.log('✅ Portfolio initialized successfully!');

    } catch (error) {
      console.error('❌ Error initializing portfolio:', error);
    }
  }

  initializeModules() {
    // Initialize Three.js scene
    try {
      this.threeScene = initThreeScene();
      console.log('✓ Three.js scene loaded');
    } catch (error) {
      console.error('Error initializing Three.js:', error);
    }

    // Initialize GitHub integration
    try {
      this.github = initGitHub();
      console.log('✓ GitHub module loaded');
    } catch (error) {
      console.error('Error initializing GitHub:', error);
    }
  }

  populateContent() {
    // Update hero section
    const heroTitle = document.querySelector('.hero-title .glitch');
    const heroTagline = document.querySelector('.hero-tagline');

    if (heroTitle) {
      heroTitle.textContent = CONFIG.name;
      heroTitle.setAttribute('data-text', CONFIG.name);
    }

    if (heroTagline) {
      heroTagline.textContent = CONFIG.tagline;
    }

    // Populate About section
    this.populateAboutSection();

    // Populate Socials section
    this.populateSocialsSection();

    // Populate Music section
    this.populateMusicSection();

    // Populate Contact section
    this.populateContactSection();
  }

  populateAboutSection() {
    // Media gallery
    const mediaGallery = document.querySelector('.media-gallery');
    if (mediaGallery && CONFIG.about.mediaFiles) {
      mediaGallery.innerHTML = '';

      CONFIG.about.mediaFiles.forEach((media, index) => {
        const mediaItem = document.createElement('div');
        mediaItem.className = 'media-item';
        mediaItem.style.animationDelay = `${index * 0.1}s`;

        if (media.type === 'image') {
          const img = document.createElement('img');
          img.src = media.src;
          img.alt = media.alt;
          img.loading = 'eager';
          img.decoding = 'sync';
          img.fetchPriority = 'high';

          // Handle image load error
          img.onerror = () => {
            mediaItem.innerHTML = `
              <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary); font-size: 0.85rem; text-align: center; padding: 1rem;">
                <div>
                  <i class="fas fa-image" style="font-size: 2rem; margin-bottom: 0.5rem; display: block;"></i>
                  Add image to:<br>${media.src}
                </div>
              </div>
            `;
          };

          mediaItem.appendChild(img);
        } else if (media.type === 'video') {
          const video = document.createElement('video');
          video.src = media.src;
          video.controls = false;
          video.loop = true;
          video.muted = true;
          video.playsInline = true;
          video.preload = 'auto';
          video.autoplay = true;
          video.setAttribute('playsinline', '');
          video.setAttribute('webkit-playsinline', '');

          // Force high quality video playback
          video.style.objectFit = 'cover';
          video.style.width = '100%';
          video.style.height = '100%';

          // Auto play when video loads
          video.addEventListener('loadeddata', () => {
            video.play().catch(e => console.log('Video autoplay blocked:', e));
          });

          mediaItem.appendChild(video);
        }

        // Add click handler to show description modal
        mediaItem.addEventListener('click', () => {
          this.showMediaModal(media);
        });

        // Add hover indicator if there's a description
        if (media.description) {
          const indicator = document.createElement('div');
          indicator.className = 'media-info-indicator';
          indicator.innerHTML = '<i class="fas fa-info-circle"></i>';
          mediaItem.appendChild(indicator);
        }

        mediaGallery.appendChild(mediaItem);
      });
    }

    // Description
    const description = document.querySelector('.about-description');
    if (description && CONFIG.about.description) {
      description.innerHTML = CONFIG.about.description;
    }
  }

  showMediaModal(media) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('media-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'media-modal';
      modal.className = 'media-modal';
      modal.innerHTML = `
        <div class="media-modal-overlay"></div>
        <div class="media-modal-content">
          <button class="media-modal-close">
            <i class="fas fa-times"></i>
          </button>
          <div class="media-modal-media"></div>
          <div class="media-modal-info">
            <h3 class="media-modal-title"></h3>
            <p class="media-modal-description"></p>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Close button handler
      modal.querySelector('.media-modal-close').addEventListener('click', () => {
        this.closeMediaModal();
      });

      // Close on overlay click
      modal.querySelector('.media-modal-overlay').addEventListener('click', () => {
        this.closeMediaModal();
      });

      // Close on escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
          this.closeMediaModal();
        }
      });
    }

    // Populate modal content
    const mediaContainer = modal.querySelector('.media-modal-media');
    const title = modal.querySelector('.media-modal-title');
    const description = modal.querySelector('.media-modal-description');

    mediaContainer.innerHTML = '';
    title.textContent = media.alt || 'Media';
    description.textContent = media.description || 'No description available.';

    if (media.type === 'image') {
      const img = document.createElement('img');
      img.src = media.src;
      img.alt = media.alt;
      mediaContainer.appendChild(img);
    } else if (media.type === 'video') {
      const video = document.createElement('video');
      video.src = media.src;
      video.controls = true;
      video.loop = true;
      video.muted = true;
      video.autoplay = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      mediaContainer.appendChild(video);
    }

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeMediaModal() {
    const modal = document.getElementById('media-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';

      // Pause any playing video
      const video = modal.querySelector('video');
      if (video) {
        video.pause();
      }
    }
  }

  populateSocialsSection() {
    const socialsGrid = document.querySelector('.socials-grid');

    if (socialsGrid && CONFIG.socialsContent) {
      socialsGrid.innerHTML = '';

      CONFIG.socialsContent.forEach((social, index) => {
        const card = document.createElement('a');
        card.href = social.url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = 'social-card';
        card.style.animationDelay = `${index * 0.1}s`;

        card.innerHTML = `
          <div class="social-card-header">
            <i class="${social.icon}"></i>
            <div class="social-card-info">
              <h3 class="social-card-title">${social.title}</h3>
              <p class="social-card-handle">${social.handle}</p>
            </div>
          </div>
          <p class="social-card-description">${social.description}</p>
          <div class="social-card-footer">
            <span class="social-card-stats">${social.stats}</span>
            <i class="fas fa-arrow-right social-card-arrow"></i>
          </div>
        `;

        socialsGrid.appendChild(card);
      });
    }
  }

  populateMusicSection() {
    const musicGrid = document.querySelector('.music-grid');

    if (musicGrid && CONFIG.musicRecommendations) {
      musicGrid.innerHTML = '';

      CONFIG.musicRecommendations.forEach((song, index) => {
        const card = document.createElement('div');
        card.className = 'music-card';
        card.style.animationDelay = `${index * 0.1}s`;
        card.dataset.isPlaying = 'false';

        // Extract Spotify track ID from URL
        const trackId = song.spotifyUrl.split('/track/')[1]?.split('?')[0];

        card.innerHTML = `
          <div class="music-card-image-container">
            <button class="music-card-play-btn" data-song-index="${index}" data-track-id="${trackId}">
              <i class="fas fa-play"></i>
            </button>
            <div class="music-card-image">
              <img src="${song.imageUrl}" alt="${song.album}" loading="lazy">
              <div class="music-card-visualizer">
                <div class="music-bar"></div>
                <div class="music-bar"></div>
                <div class="music-bar"></div>
                <div class="music-bar"></div>
              </div>
            </div>
            <audio class="music-card-audio" preload="none">
              <source src="" type="audio/mpeg">
            </audio>
          </div>
          <div class="music-card-info">
            <h3 class="music-card-title">${song.title}</h3>
            <p class="music-card-artist">${song.artist}</p>
            <div class="music-card-footer-info">
              <span class="music-card-genre">${song.genre}</span>
              <a href="${song.spotifyUrl}" target="_blank" rel="noopener noreferrer" class="music-card-spotify-link" title="Open in Spotify">
                <i class="fab fa-spotify"></i>
              </a>
            </div>
          </div>
        `;

        // Add click handler for play button
        const playBtn = card.querySelector('.music-card-play-btn');
        const imageContainer = card.querySelector('.music-card-image');
        const audio = card.querySelector('.music-card-audio');
        const visualizer = card.querySelector('.music-card-visualizer');

        playBtn.addEventListener('click', async (e) => {
          e.stopPropagation();

          // Stop any other playing audio
          document.querySelectorAll('.music-card').forEach(otherCard => {
            if (otherCard !== card && otherCard.dataset.isPlaying === 'true') {
              const otherAudio = otherCard.querySelector('.music-card-audio');
              const otherBtn = otherCard.querySelector('.music-card-play-btn');
              const otherVisualizer = otherCard.querySelector('.music-card-visualizer');
              if (otherAudio) {
                otherAudio.pause();
                otherAudio.currentTime = 0;
              }
              otherCard.dataset.isPlaying = 'false';
              otherBtn.querySelector('i').className = 'fas fa-play';
              otherVisualizer.classList.remove('active');
            }
          });

          // Toggle playback
          if (card.dataset.isPlaying === 'true') {
            // Pause (keep position)
            audio.pause();
            card.dataset.isPlaying = 'false';
            playBtn.querySelector('i').className = 'fas fa-play';
            visualizer.classList.remove('active');
          } else {
            // Check if audio file or preview URL is provided
            const audioSource = song.audioFile || song.previewUrl;

            if (audioSource) {
              try {
                // Only set source if it's different or not set yet
                if (!audio.src || audio.src !== new URL(audioSource, window.location.href).href) {
                  audio.src = audioSource;
                }

                // Play (will resume from current position if previously paused)
                await audio.play();
                card.dataset.isPlaying = 'true';
                playBtn.querySelector('i').className = 'fas fa-pause';
                visualizer.classList.add('active');
              } catch (error) {
                console.error('Error playing audio:', error);
                alert(`Audio file not found or cannot play.\n\nMake sure the file exists at: ${audioSource}\n\nOpening Spotify instead...`);
                window.open(song.spotifyUrl, '_blank');
              }
            } else {
              // No audio source provided, open Spotify
              window.open(song.spotifyUrl, '_blank');
            }
          }
        });

        // Handle audio end
        audio.addEventListener('ended', () => {
          card.dataset.isPlaying = 'false';
          playBtn.querySelector('i').className = 'fas fa-play';
          visualizer.classList.remove('active');
          audio.currentTime = 0;
        });

        musicGrid.appendChild(card);
      });
    }
  }

  populateContactSection() {
    // Email button
    const emailBtn = document.getElementById('email-btn');
    if (emailBtn) {
      emailBtn.href = `mailto:${CONFIG.email}`;
    }

    // Resume button
    const resumeBtn = document.getElementById('resume-btn');
    if (resumeBtn) {
      resumeBtn.href = CONFIG.resumeFile;
    }

    // GitHub button
    const githubBtn = document.getElementById('github-btn');
    if (githubBtn) {
      githubBtn.href = CONFIG.socials.github;
    }
  }

  setupEventListeners() {
    // Mobile navigation toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
      navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
      });

      // Close menu when clicking a link
      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          navLinks.classList.remove('active');
        });
      });
    }

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 100) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      lastScroll = currentScroll;
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));

        if (target) {
          const offset = 80; // Account for fixed navbar
          const targetPosition = target.offsetTop - offset;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  setupScrollAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
      observer.observe(section);
    });

    // Observe all animated elements
    const animateOnScroll = () => {
      document.querySelectorAll('.project-card, .social-card, .music-card, .media-item, .about-description, .contact-card, .section-title').forEach(el => {
        observer.observe(el);
      });
    };

    // Initial observation
    animateOnScroll();

    // Re-observe after content loads (for GitHub projects)
    setTimeout(animateOnScroll, 2000);
    setTimeout(animateOnScroll, 3000); // Extra check for slower loads
  }

  // Public methods for external access
  getThreeScene() {
    return this.threeScene;
  }

  getGitHub() {
    return this.github;
  }
}

// Initialize the application
const app = new Portfolio();

// Export for debugging purposes
window.portfolio = app;

// Console welcome message
console.log('%c🎨 Digital Portfolio', 'color: #00ffff; font-size: 24px; font-weight: bold;');
console.log('%cBuilt with Three.js, JavaScript & CSS', 'color: #ff00ff; font-size: 14px;');
console.log('%cEdit js/config.js to customize your portfolio!', 'color: #8892b0; font-size: 12px;');

export default Portfolio;
