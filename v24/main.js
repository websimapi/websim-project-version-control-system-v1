class ProjectV24 extends ProjectV22 {
  constructor() {
    super();
    this.version = 'v24';
    this.currentActiveVersion = 'v24';
    this.isLoading = false;
  }

  initializeBranchData() {
    return {
      main: [
        'v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10',
        'v11', 'v12', 'v13', 'v14', 'v15', 'v16', 'v17', 'v19', 'v20',
        'v21', 'v22', 'v24'
      ],
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
      this.initializeIframeContent();
    } else {
      // Initialize as main window
      this.initializeMainWindow();
    }
  }

  isInIframe() {
    return window !== window.parent;
  }

  initializeMainWindow() {
    // Clear any existing content
    document.body.innerHTML = '';
    
    // Create clean UI structure
    this.createVersionUI();
    this.setupEventHandlers();
    this.initializeTimeline();
    this.createMainFrame();
    this.initializeVersionTimestamps();
  }

  initializeIframeContent() {
    // Only initialize version-specific content
    const urlParams = new URLSearchParams(window.location.search);
    const version = urlParams.get('version');
    
    if (version) {
      // Clean initialization for iframe content
      document.body.innerHTML = `
        <div class="version-container">
          <h1 class="version-header">Version ${version}</h1>
          <div id="version-content"></div>
        </div>
      `;
    }
  }

  createVersionUI() {
    const container = document.createElement('div');
    container.className = 'version-navigation';
    container.innerHTML = `
      <div class="version-controls">
        <div class="version-info">
          Current Version: <span class="current-version">${this.currentActiveVersion}</span>
        </div>
        <div class="version-nav">
          ${this.branchData.main.map(v => `
            <button class="nav-button ${v === this.currentActiveVersion ? 'active' : ''}"
                    data-version="${v}">
              ${v}
            </button>
          `).join('')}
        </div>
      </div>
      <div class="timeline-container"></div>
    `;
    document.body.appendChild(container);

    // Create frame container
    const frameContainer = document.createElement('div');
    frameContainer.className = 'version-frame-container';
    frameContainer.innerHTML = '<div id="main-frame-container"></div>';
    document.body.appendChild(frameContainer);
  }

  createMainFrame() {
    const container = document.getElementById('main-frame-container');
    if (!container) return;

    container.innerHTML = ''; // Clear existing content
    
    this.mainFrame = document.createElement('iframe');
    this.mainFrame.className = 'version-frame clean-frame';
    container.appendChild(this.mainFrame);
    
    // Load initial version
    this.switchVersion(this.currentActiveVersion);
  }

  async switchVersion(version) {
    if (this.isLoading || version === this.currentActiveVersion) return;
    this.isLoading = true;

    const loadingOverlay = this.createLoadingOverlay(version);
    document.body.appendChild(loadingOverlay);

    try {
      await this.loadVersionInFrame(version);
      this.currentActiveVersion = version;
      this.updateUI(version);
      this.updateVersionTimestamp(version);
    } catch (error) {
      console.error('Version switch error:', error);
      this.showError(`Failed to load version ${version}: ${error.message}`);
    } finally {
      loadingOverlay.remove();
      this.isLoading = false;
    }
  }

  updateVersionTimestamp(version) {
    const timestamps = JSON.parse(localStorage.getItem('versionTimestamps') || '{}');
    timestamps[version] = new Date().toISOString();
    localStorage.setItem('versionTimestamps', JSON.stringify(timestamps));
  }

  async loadVersionInFrame(version) {
    return new Promise((resolve, reject) => {
      if (!this.mainFrame) {
        reject(new Error('Frame not initialized'));
        return;
      }

      const handleLoad = () => {
        this.mainFrame.removeEventListener('load', handleLoad);
        resolve();
      };

      const handleError = (error) => {
        this.mainFrame.removeEventListener('load', handleLoad);
        reject(error);
      };

      this.mainFrame.addEventListener('load', handleLoad);
      this.mainFrame.addEventListener('error', handleError);
      
      // Set frame source
      this.mainFrame.src = this.getVersionURL(version);
    });
  }

  updateUI(version) {
    // Update navigation buttons
    document.querySelectorAll('.nav-button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.version === version);
    });

    // Update version info
    document.querySelector('.current-version').textContent = version;
    
    // Update timeline points
    document.querySelectorAll('.timeline-point').forEach(point => {
      point.classList.toggle('active', point.dataset.version === version);
    });
  }

  setupEventHandlers() {
    // Handle version navigation clicks
    document.addEventListener('click', async (e) => {
      if (e.target.matches('.nav-button')) {
        const version = e.target.dataset.version;
        await this.switchVersion(version);
      }
      
      if (e.target.closest('.timeline-point')) {
        const version = e.target.closest('.timeline-point').dataset.version;
        await this.switchVersion(version);
      }
    });
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
    return url.toString();
  }

  initializeTimeline() {
    const timelineContainer = document.querySelector('.timeline-container');
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

  initializeVersionTimestamps() {
    if (!localStorage.getItem('versionTimestamps')) {
      const now = new Date();
      const timestamps = {};
      this.branchData.main.forEach(version => {
        timestamps[version] = now.toISOString();
      });
      localStorage.setItem('versionTimestamps', JSON.stringify(timestamps));
    }
  }
}

// Initialize based on context
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeProject);
} else {
  initializeProject();
}

function initializeProject() {
  if (window.location.search.includes('version=')) {
    // Iframe initialization
    const urlParams = new URLSearchParams(window.location.search);
    const version = urlParams.get('version');
    const versionNumber = parseInt(version.replace('v', ''));
    
    const VersionClass = window[`ProjectV${versionNumber}`];
    if (VersionClass) {
      window.project = new VersionClass();
      project.initialize();
    }
  } else {
    // Main window initialization
    window.project = new ProjectV24();
    project.initialize();
  }
}