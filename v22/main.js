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
    this.createVersionUI();
    this.setupEventHandlers();
    this.initializeTimeline();
    this.createMainFrame();
    
    // Set initial version timestamps if not exists
    if (!localStorage.getItem('versionTimestamps')) {
      this.initializeVersionTimestamps();
    }
  }

  initializeVersionTimestamps() {
    const now = new Date();
    const timestamps = {};
    this.branchData.main.forEach(version => {
      timestamps[version] = now.toISOString();
    });
    localStorage.setItem('versionTimestamps', JSON.stringify(timestamps));
  }

  createVersionUI() {
    const container = document.createElement('div');
    container.className = 'version-container';
    container.innerHTML = `
      <h1 class="version-header">Version Control System</h1>
      <div class="version-nav"></div>
      <div id="main-frame-container"></div>
    `;
    document.body.appendChild(container);
  }

  createMainFrame() {
    const container = document.getElementById('main-frame-container');
    this.mainFrame = document.createElement('iframe');
    this.mainFrame.className = 'version-frame';
    container.appendChild(this.mainFrame);
    
    // Load current version
    this.switchVersion(this.currentActiveVersion);
  }

  async switchVersion(version) {
    if (this.loadingVersion) return;
    this.loadingVersion = true;

    const loadingOverlay = this.createLoadingOverlay(version);
    document.body.appendChild(loadingOverlay);

    try {
      // Clear existing frame content
      if (this.mainFrame) {
        this.mainFrame.src = 'about:blank';
        await new Promise(resolve => setTimeout(resolve, 100)); // Brief pause
      }

      // Load new version
      this.mainFrame.src = this.getVersionURL(version);
      
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Version load timeout')), 10000);
        
        const handleLoad = async () => {
          clearTimeout(timeout);
          this.currentActiveVersion = version;
          this.updateUI(version);
          resolve();
        };

        this.mainFrame.onload = handleLoad;
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

  initializeTimeline() {
    const container = document.querySelector('.version-nav');
    const timeline = document.createElement('div');
    timeline.className = 'timeline-container';
    
    const track = document.createElement('div');
    track.className = 'timeline-track';
    
    // Calculate positions for timeline points
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
    
    timeline.appendChild(track);
    container.appendChild(timeline);
  }

  setupEventHandlers() {
    document.addEventListener('click', async (e) => {
      if (e.target.closest('.timeline-point')) {
        const version = e.target.closest('.timeline-point').dataset.version;
        await this.switchVersion(version);
      }
    });
  }

  updateUI(version) {
    // Update timeline points
    document.querySelectorAll('.timeline-point').forEach(point => {
      point.classList.toggle('active', point.dataset.version === version);
    });
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