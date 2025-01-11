class ProjectV22 extends ProjectV21 {
  constructor() {
    super();
    this.version = 'v22';
    this.currentActiveVersion = 'v22';
    this.loadingVersion = false;
  }

  initialize() {
    // Create main UI first
    this.createMainUI();
    
    // Then setup frame and events
    this.setupMainFrame();
    this.setupEventListeners();
    
    // Finally, load initial version
    this.loadInitialVersion();
  }

  createMainUI() {
    const container = document.createElement('div');
    container.className = 'version-container';
    container.innerHTML = `
      <h1 class="version-header">Version Control System</h1>
      <div class="version-nav"></div>
      <div class="frame-container">
        <div class="frame-toolbar">
          <div class="frame-status">
            <span class="current-version">Current: ${this.currentActiveVersion}</span>
            <span class="frame-state">Ready</span>
          </div>
          <button class="refresh-btn">Refresh</button>
        </div>
        <div id="main-frame-container"></div>
      </div>
    `;
    
    // Clear existing content and add new UI
    document.body.innerHTML = '';
    document.body.appendChild(container);
    
    // Create timeline
    this.createTimeline();
  }

  createTimeline() {
    const navContainer = document.querySelector('.version-nav');
    if (!navContainer) return;

    const timestamps = JSON.parse(localStorage.getItem('versionTimestamps') || '{}');
    const timeline = document.createElement('div');
    timeline.className = 'timeline-container';
    
    const track = document.createElement('div');
    track.className = 'timeline-track';
    
    // Calculate positions
    const versions = this.branchData.main;
    versions.forEach((version, index) => {
      const point = document.createElement('div');
      point.className = `timeline-point ${version === this.currentActiveVersion ? 'active' : ''}`;
      point.style.left = `${(index / (versions.length - 1)) * 100}%`;
      point.dataset.version = version;
      
      point.innerHTML = `
        <div class="timeline-label">${version}</div>
        <div class="timeline-date">${new Date(timestamps[version] || Date.now()).toLocaleDateString()}</div>
      `;
      
      track.appendChild(point);
    });
    
    timeline.appendChild(track);
    navContainer.appendChild(timeline);
  }

  setupMainFrame() {
    const container = document.getElementById('main-frame-container');
    if (!container) return;

    this.mainFrame = document.createElement('iframe');
    this.mainFrame.className = 'version-frame';
    container.appendChild(this.mainFrame);
  }

  setupEventListeners() {
    // Timeline point clicks
    document.addEventListener('click', async (e) => {
      const point = e.target.closest('.timeline-point');
      if (point) {
        const version = point.dataset.version;
        await this.switchVersion(version);
      }
    });

    // Refresh button
    const refreshBtn = document.querySelector('.refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refreshFrame());
    }
  }

  loadInitialVersion() {
    this.switchVersion(this.currentActiveVersion);
  }

  async switchVersion(version) {
    if (this.loadingVersion || !this.mainFrame) return;
    this.loadingVersion = true;

    const overlay = this.createLoadingOverlay(version);
    document.body.appendChild(overlay);

    try {
      // Clear current frame
      this.mainFrame.src = 'about:blank';
      await new Promise(resolve => setTimeout(resolve, 100));

      // Load new version
      this.mainFrame.src = this.getVersionURL(version);
      
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Version load timeout')), 10000);
        
        this.mainFrame.onload = () => {
          clearTimeout(timeout);
          this.currentActiveVersion = version;
          this.updateUI(version);
          resolve();
        };
      });

    } catch (error) {
      console.error('Version switch error:', error);
      this.showError(`Failed to load version ${version}: ${error.message}`);
    } finally {
      overlay.remove();
      this.loadingVersion = false;
    }
  }

  updateUI(version) {
    const points = document.querySelectorAll('.timeline-point');
    points.forEach(point => {
      point.classList.toggle('active', point.dataset.version === version);
    });

    const currentVersionEl = document.querySelector('.current-version');
    if (currentVersionEl) {
      currentVersionEl.textContent = `Current: ${version}`;
    }

    const frameState = document.querySelector('.frame-state');
    if (frameState) {
      frameState.textContent = `Running ${version}`;
    }
  }

  createLoadingOverlay(version) {
    const overlay = document.createElement('div');
    overlay.className = 'version-loading';
    overlay.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <p>Loading version ${version}...</p>
      </div>
    `;
    return overlay;
  }

  getVersionURL(version) {
    const url = new URL(window.location.href);
    url.searchParams.set('version', version);
    url.searchParams.set('t', Date.now()); // Cache busting
    return url.toString();
  }

  showError(message) {
    const error = document.createElement('div');
    error.className = 'version-error';
    error.textContent = message;
    document.querySelector('.version-container').appendChild(error);
    
    setTimeout(() => error.remove(), 5000);
  }

  refreshFrame() {
    if (this.mainFrame) {
      this.mainFrame.src = this.mainFrame.src;
    }
  }

  initializeBranchData() {
    return {
      main: ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10', 'v11', 
             'v12', 'v13', 'v14', 'v15', 'v16', 'v17', 'v19', 'v20', 'v21', 'v22'],
      experimental: ['v4', 'experimental-1', 'experimental-2'],
      hotfix: ['v5', 'hotfix-1'],
      feature: ['v6', 'feature-1', 'feature-2'],
      development: ['v8', 'dev-1', 'dev-2'],
      release: ['v9', 'release-1', 'release-2']
    };
  }

  initializeVersionTimestamps() {
    const now = new Date();
    const timestamps = {};
    this.branchData.main.forEach(version => {
      timestamps[version] = now.toISOString();
    });
    localStorage.setItem('versionTimestamps', JSON.stringify(timestamps));
  }

  // Initialize based on context
  isInIframe() {
    return window !== window.parent;
  }

}

// Initialize based on context
if (!window.location.search.includes('version=')) {
  document.addEventListener('DOMContentLoaded', () => {
    window.project = new ProjectV22();
    project.initialize();
  });
} else {
  document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const version = urlParams.get('version');
    const versionNumber = parseInt(version.replace('v', ''));
    
    const VersionClass = window[`ProjectV${versionNumber}`];
    if (VersionClass) {
      window.project = new VersionClass();
      project.initialize();
    }
  });
}