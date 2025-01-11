class ProjectV23 {
  constructor() {
    this.version = 'v23';
    this.projectId = 'v0q5o8d1q1s8r48ojqq1';
    this.currentVersion = 'v23';
    this.isLoading = false;
    this.versions = new Map();
    this.mainFrame = null;
  }

  async initialize() {
    // Create initial UI structure
    this.createInitialUI();
    
    // Initialize data
    await this.initializeVersionData();
    
    // Setup timeline after data is loaded
    this.createTimeline();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Create main frame
    await this.initializeFrame();
  }

  createInitialUI() {
    document.body.innerHTML = `
      <div class="app-container">
        <header class="header">
          <h1>Version Control System</h1>
        </header>
        <div class="timeline-container">
          <div id="timeline"></div>
        </div>
        <div class="frame-container">
          <div class="frame-header">
            <div class="frame-status">
              <span class="current-version">Current: ${this.currentVersion}</span>
              <span class="frame-state">Ready</span>
            </div>
            <button class="refresh-button">Refresh</button>
          </div>
          <div id="frame-content"></div>
        </div>
      </div>
    `;
  }

  async initializeVersionData() {
    // Initialize version timestamps if needed
    if (!localStorage.getItem('versionTimestamps')) {
      const timestamps = {};
      const now = new Date();
      for (let i = 1; i <= 23; i++) {
        if (i !== 18) { // Skip failed version
          timestamps[`v${i}`] = now.toISOString();
        }
      }
      localStorage.setItem('versionTimestamps', JSON.stringify(timestamps));
    }

    try {
      const response = await fetch(`/api/v1/projects/${this.projectId}`);
      if (!response.ok) throw new Error('Failed to fetch project data');
      const data = await response.json();
      this.projectData = data;
    } catch (error) {
      console.error('Error fetching project data:', error);
      // Continue with local data if API fails
    }
  }

  createTimeline() {
    const timeline = document.getElementById('timeline');
    if (!timeline) return;

    const timestamps = JSON.parse(localStorage.getItem('versionTimestamps'));
    const versions = Object.keys(timestamps).sort((a, b) => {
      return parseInt(a.slice(1)) - parseInt(b.slice(1));
    });

    const track = document.createElement('div');
    track.className = 'timeline-track';

    versions.forEach((version, index) => {
      const point = document.createElement('div');
      point.className = `version-point ${version === this.currentVersion ? 'active' : ''}`;
      point.dataset.version = version;
      point.style.left = `${(index / (versions.length - 1)) * 100}%`;

      point.innerHTML = `
        <div class="version-label">${version}</div>
        <div class="version-date">${new Date(timestamps[version]).toLocaleDateString()}</div>
      `;

      track.appendChild(point);
    });

    timeline.appendChild(track);
  }

  async initializeFrame() {
    const container = document.getElementById('frame-content');
    if (!container) return;

    this.mainFrame = document.createElement('iframe');
    this.mainFrame.className = 'version-frame';
    this.mainFrame.src = this.getVersionURL(this.currentVersion);
    container.appendChild(this.mainFrame);
  }

  setupEventListeners() {
    // Version point clicks
    document.addEventListener('click', async (e) => {
      const point = e.target.closest('.version-point');
      if (point) {
        const version = point.dataset.version;
        await this.switchVersion(version);
      }

      // Refresh button
      if (e.target.closest('.refresh-button')) {
        this.refreshFrame();
      }
    });
  }

  async switchVersion(version) {
    if (this.isLoading) return;
    this.isLoading = true;

    const overlay = this.createLoadingOverlay(version);
    document.body.appendChild(overlay);

    try {
      if (this.mainFrame) {
        this.mainFrame.src = this.getVersionURL(version);
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Load timeout')), 10000);
          this.mainFrame.onload = () => {
            clearTimeout(timeout);
            resolve();
          };
        });
      }

      this.currentVersion = version;
      this.updateUI(version);
      this.showToast(`Switched to ${version}`);
    } catch (error) {
      this.showToast(`Failed to load ${version}: ${error.message}`, 'error');
    } finally {
      overlay.remove();
      this.isLoading = false;
    }
  }

  getVersionURL(version) {
    const url = new URL(window.location.href);
    url.searchParams.set('version', version);
    url.searchParams.set('t', Date.now());
    return url.toString();
  }

  updateUI(version) {
    // Update version points
    document.querySelectorAll('.version-point').forEach(point => {
      point.classList.toggle('active', point.dataset.version === version);
    });

    // Update status
    const currentVersion = document.querySelector('.current-version');
    if (currentVersion) currentVersion.textContent = `Current: ${version}`;

    const frameState = document.querySelector('.frame-state');
    if (frameState) frameState.textContent = `Running ${version}`;
  }

  refreshFrame() {
    if (this.mainFrame) {
      this.mainFrame.src = this.getVersionURL(this.currentVersion);
    }
  }

  createLoadingOverlay(version) {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p>Loading version ${version}...</p>
      </div>
    `;
    return overlay;
  }

  showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
}

// Initialize based on context
if (!window.location.search.includes('version=')) {
  // Main window initialization
  document.addEventListener('DOMContentLoaded', () => {
    window.project = new ProjectV23();
    project.initialize();
  });
} else {
  // Iframe initialization
  const urlParams = new URLSearchParams(window.location.search);
  const version = urlParams.get('version');
  const versionNumber = parseInt(version.replace('v', ''));
  
  document.addEventListener('DOMContentLoaded', () => {
    const VersionClass = window[`ProjectV${versionNumber}`];
    if (VersionClass) {
      window.project = new VersionClass();
      project.initialize();
    }
  });
}