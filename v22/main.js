class ProjectV22 extends ProjectV21 {
  constructor() {
    super();
    this.version = 'v22';
    this.currentActiveVersion = 'v22';
    this.loadingVersion = false;
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

  initialize() {
    if (this.isInIframe()) {
      // Initialize as iframe content
      super.initialize();
    } else {
      // Initialize as main window
      this.initializeMainWindow();
    }
  }

  isInIframe() {
    return window !== window.parent;
  }

  initializeMainWindow() {
    // Create the UI structure first
    this.createVersionUI();
    
    // Then initialize other components in order
    this.initializeTimeline();
    this.createMainFrame();
    
    // Set initial version timestamps if not exists
    if (!localStorage.getItem('versionTimestamps')) {
      this.initializeVersionTimestamps();
    }
    
    // Setup event handlers last after DOM is ready
    this.setupEventHandlers();
  }

  createVersionUI() {
    // Clear any existing content
    document.body.innerHTML = '';
    
    const container = document.createElement('div');
    container.className = 'version-container';
    container.innerHTML = `
      <h1 class="version-header">Version Control System</h1>
      <div class="version-nav"></div>
      <div id="main-frame-container"></div>
    `;
    document.body.appendChild(container);
    
    // Create navigation UI
    this.createNavigation();
  }

  createNavigation() {
    const nav = document.querySelector('.version-nav');
    if (nav) {
      nav.innerHTML = this.branchData.main.map(version => `
        <button class="nav-button ${version === this.currentActiveVersion ? 'active' : ''}"
                data-version="${version}">
          ${version}
        </button>
      `).join('');
    }
  }

  createMainFrame() {
    const container = document.getElementById('main-frame-container');
    if (!container) return;

    this.mainFrame = document.createElement('iframe');
    this.mainFrame.className = 'version-frame';
    container.appendChild(this.mainFrame);
    
    // Load initial version
    this.switchVersion(this.currentActiveVersion);
  }

  initializeVersionTimestamps() {
    const now = new Date();
    const timestamps = {};
    this.branchData.main.forEach(version => {
      timestamps[version] = now.toISOString();
    });
    localStorage.setItem('versionTimestamps', JSON.stringify(timestamps));
  }

  setupEventHandlers() {
    // Listen for navigation clicks
    document.querySelector('.version-nav')?.addEventListener('click', async (e) => {
      if (e.target.matches('.nav-button')) {
        const version = e.target.dataset.version;
        await this.switchVersion(version);
      }
    });

    // Listen for timeline clicks
    document.querySelector('.timeline-container')?.addEventListener('click', async (e) => {
      const point = e.target.closest('.timeline-point');
      if (point) {
        const version = point.dataset.version;
        await this.switchVersion(version);
      }
    });
  }

  async switchVersion(version) {
    if (this.loadingVersion) return;
    this.loadingVersion = true;

    const loadingOverlay = this.createLoadingOverlay(version);
    document.body.appendChild(loadingOverlay);

    try {
      // Clear existing frame content
      const frame = this.mainFrame;
      if (frame) {
        frame.src = 'about:blank';
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Load new version
      frame.src = this.getVersionURL(version);
      
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Version load timeout')), 10000);
        
        const handleLoad = () => {
          clearTimeout(timeout);
          this.currentActiveVersion = version;
          this.updateUI(version);
          resolve();
        };

        frame.onload = handleLoad;
      });

    } catch (error) {
      console.error('Version switch error:', error);
      this.showError(`Failed to load version ${version}: ${error.message}`);
    } finally {
      loadingOverlay.remove();
      this.loadingVersion = false;
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

  showError(message) {
    const error = document.createElement('div');
    error.className = 'version-error';
    error.textContent = message;
    
    document.body.appendChild(error);
    setTimeout(() => error.remove(), 5000);
  }

  getVersionURL(version) {
    const url = new URL(window.location.href);
    url.searchParams.set('version', version);
    url.searchParams.set('t', Date.now());
    
    // Add required scripts for this version
    const vNum = parseInt(version.replace('v', ''));
    const requiredScripts = [];
    for (let i = 1; i <= vNum; i++) {
      // Skip v18 as it failed
      if (i !== 18) {
        requiredScripts.push(`v${i}/main.js`);
      }
    }
    url.searchParams.set('scripts', JSON.stringify(requiredScripts));
    
    return url.toString();
  }

  initializeTimeline() {
    const nav = document.querySelector('.version-nav');
    if (!nav) return;
    
    const timelineContainer = document.createElement('div');
    timelineContainer.className = 'timeline-container';
    
    const track = document.createElement('div');
    track.className = 'timeline-track';
    
    const versions = this.branchData.main;
    const timestamps = JSON.parse(localStorage.getItem('versionTimestamps') || '{}');
    const trackWidth = versions.length * 100; // 100px per version
    track.style.width = `${trackWidth}px`;
    
    versions.forEach((version, index) => {
      const point = document.createElement('div');
      point.className = `timeline-point ${version === this.currentActiveVersion ? 'active' : ''}`;
      point.style.left = `${(index / (versions.length - 1)) * 100}%`;
      point.dataset.version = version;
      
      const label = document.createElement('div');
      label.className = 'timeline-label';
      label.textContent = version;
      point.appendChild(label);
      
      const date = document.createElement('div');
      date.className = 'timeline-date';
      date.textContent = new Date(timestamps[version]).toLocaleDateString();
      point.appendChild(date);
      
      track.appendChild(point);
    });
    
    timelineContainer.appendChild(track);
    nav.appendChild(timelineContainer);
  }

  updateUI(version) {
    // Update navigation buttons
    document.querySelectorAll('.nav-button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.version === version);
    });
    
    // Update timeline points
    document.querySelectorAll('.timeline-point').forEach(point => {
      point.classList.toggle('active', point.dataset.version === version);
    });
  }

}

// Initialize based on context
if (!window.location.search.includes('version=')) {
  // Main window initialization
  document.addEventListener('DOMContentLoaded', () => {
    window.project = new ProjectV22();
    project.initialize();
  });
} else {
  // Iframe initialization
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