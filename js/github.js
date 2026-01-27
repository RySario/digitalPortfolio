// ============================================
// GITHUB API MODULE
// Fetches and displays GitHub repositories
// ============================================

import CONFIG from './config.js';

class GitHubProjects {
  constructor() {
    this.username = CONFIG.githubUsername;
    this.projectsContainer = document.querySelector('.projects-grid');
    this.repos = [];
  }

  async fetchRepositories() {
    if (!this.username || this.username === 'YOUR_GITHUB_USERNAME') {
      this.showError('Please set your GitHub username in js/config.js');
      return;
    }

    try {
      // Show loading state
      this.showLoading();

      // Fetch repositories from GitHub API
      const response = await fetch(
        `https://api.github.com/users/${this.username}/repos?sort=updated&per_page=100`
      );

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const repos = await response.json();

      // Filter out forks and sort by stars
      this.repos = repos
        .filter(repo => !repo.fork)
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 6); // Show top 6 projects

      this.displayProjects();

    } catch (error) {
      console.error('Error fetching GitHub repositories:', error);
      this.showError('Failed to load GitHub projects. Please check the console for details.');
    }
  }

  displayProjects() {
    // Clear loading state
    this.projectsContainer.innerHTML = '';

    if (this.repos.length === 0) {
      this.showError('No public repositories found.');
      return;
    }

    // Create project cards
    this.repos.forEach((repo, index) => {
      const card = this.createProjectCard(repo, index);
      this.projectsContainer.appendChild(card);
    });
  }

  createProjectCard(repo, index) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.style.animationDelay = `${index * 0.1}s`;

    // Get language color
    const languageColor = this.getLanguageColor(repo.language);

    // Create card HTML
    card.innerHTML = `
      <div class="project-header">
        <h3 class="project-title">${this.escapeHtml(repo.name)}</h3>
      </div>

      <p class="project-description">
        ${this.escapeHtml(repo.description || 'No description provided.')}
      </p>

      <div class="project-footer">
        ${repo.language ? `
          <div class="project-language">
            <span class="language-dot" style="background: ${languageColor}"></span>
            <span>${this.escapeHtml(repo.language)}</span>
          </div>
        ` : '<div></div>'}

        <a href="${repo.html_url}" class="project-link" target="_blank" rel="noopener noreferrer">
          View Project →
        </a>
      </div>
    `;

    // Add click handler to open repo
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking the link
      if (!e.target.closest('.project-link')) {
        window.open(repo.html_url, '_blank', 'noopener,noreferrer');
      }
    });

    return card;
  }

  getLanguageColor(language) {
    // Common language colors (GitHub style)
    const colors = {
      'JavaScript': '#f1e05a',
      'TypeScript': '#2b7489',
      'Python': '#3572A5',
      'Java': '#b07219',
      'C++': '#f34b7d',
      'C': '#555555',
      'C#': '#178600',
      'PHP': '#4F5D95',
      'Ruby': '#701516',
      'Go': '#00ADD8',
      'Rust': '#dea584',
      'Swift': '#ffac45',
      'Kotlin': '#F18E33',
      'HTML': '#e34c26',
      'CSS': '#563d7c',
      'Vue': '#41b883',
      'React': '#61dafb',
      'Shell': '#89e051',
      'Dart': '#00B4AB'
    };

    return colors[language] || '#00ffff';
  }

  showLoading() {
    this.projectsContainer.innerHTML = `
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i> Loading projects from GitHub...
      </div>
    `;
  }

  showError(message) {
    this.projectsContainer.innerHTML = `
      <div class="loading-spinner" style="color: #ff6b6b;">
        <i class="fas fa-exclamation-triangle"></i> ${this.escapeHtml(message)}
      </div>
    `;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize and export
let githubInstance = null;

export function initGitHub() {
  if (!githubInstance) {
    githubInstance = new GitHubProjects();
  }
  return githubInstance;
}

export default GitHubProjects;
