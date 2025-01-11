class ProjectV21 extends ProjectV20 {
  constructor() {
    super();
    this.version = 'v21';
    this.currentActiveVersion = 'v21';
    this.mainFrame = null;
    this.isInitialLoad = true;
  }

  initializeBranchData() {
    return {
      main: ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10', 'v11', 'v12', 'v13', 'v14', 'v15', 'v16', 'v17', 'v19', 'v20', 'v21'],
      experimental: ['v4', 'experimental-1', 'experimental-2'],
      hotfix: ['v5', 'hotfix-1'],
      feature: ['v6', 'feature-1', 'feature-2'],
      development: ['v8', 'dev-1', 'dev-2'],
      release: ['v9', 'release-1', 'release-2']
    };
  }

  initialize() {
    super.initialize();
    this.setupSingleIframeSystem();

    // Handle messages from child frames
    window.addEventListener('message', this.handleFrameMessage.bind(this));
  }

  handleFrameMessage(event) {
    const { type, version } = event.data;
    switch (type) {
      case 'VERSION_LOADED':
        this.handleVersionLoaded(version);
        break;
      case 'VERSION_ERROR':
        this.handleVersionError(version, event.data.error);
        break;
      case 'FRAME_READY':
        this.handleFrameReady(version);
        break;
    }
  }

  setupSingleIframeSystem() {
    // Remove old frame container if exists
    const oldContainer = document.querySelector('.version-frame-container');
    if (oldContainer) {
      oldContainer.remove();
    }

    // Create new single frame container
    const container = document.createElement('div');
    container.className = 'version-frame-container';
    container.innerHTML = this.createFrameContainerHTML();
    document.querySelector('.version-container').appendChild(container);

    // Initialize the main frame
    this.initializeMainFrame();
  }

  createFrameContainerHTML() {
    return `
      <div class="frame-toolbar">
        <div class="frame-status">
          <span class="frame-version">Current: ${this.currentActiveVersion}</span>
          <span class="frame-separator">|</span>
          <span class="frame-load-status">Ready</span>
        </div>
        <div class="frame-controls">
          <button class="frame-refresh" onclick="project.refreshFrame()">
            Refresh Frame
          </button>
        </div>
      </div>
      <div id="main-frame-container"></div>
    `;
  }

  initializeMainFrame() {
    const container = document.getElementById('main-frame-container');
    if (!this.mainFrame) {
      this.mainFrame = document.createElement('iframe');
      this.mainFrame.className = 'version-frame';
      
      // Set initial version if this is the first load
      if (this.isInitialLoad) {
        this.mainFrame.src = this.getVersionURL(this.currentActiveVersion);
        this.isInitialLoad = false;
      }
      
      container.appendChild(this.mainFrame);
    }
  }

  async switchVersion(version) {
    const versionInfo = this.versionControl.getVersionInfo(version);
    if (!versionInfo) {
      this.showToast(`Version ${version} not found`, 'error');
      return;
    }

    const loadingOverlay = this.createLoadingOverlay();
    document.body.appendChild(loadingOverlay);

    try {
      await this.loadVersionInFrame(version);
      this.currentActiveVersion = version;
      this.showToast(`Successfully switched to ${version}`);
      this.updateUI(version);
    } catch (error) {
      this.showToast(`Error switching to version ${version}: ${error.message}`, 'error');
      console.error('Version switch error:', error);
      this.handleVersionError(version, error);
    } finally {
      loadingOverlay.remove();
    }
  }

  async loadVersionInFrame(version) {
    const frame = this.mainFrame;
    const statusEl = document.querySelector('.frame-load-status');
    statusEl.textContent = `Loading ${version}...`;

    try {
      await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Frame load timeout'));
        }, 10000);

        const handleLoad = () => {
          clearTimeout(timeoutId);
          resolve();
        };

        // Set up message handler for this specific load
        const handleMessage = (event) => {
          if (event.source === frame.contentWindow && event.data.type === 'VERSION_LOADED') {
            window.removeEventListener('message', handleMessage);
            clearTimeout(timeoutId);
            resolve();
          }
        };

        window.addEventListener('message', handleMessage);

        // Set the source of the frame
        frame.onload = handleLoad;
        frame.src = this.getVersionURL(version);
      });

      statusEl.textContent = `Running ${version}`;
      
    } catch (error) {
      statusEl.textContent = 'Error';
      throw error;
    }
  }

  getVersionURL(version) {
    const url = new URL(window.location.href);
    url.searchParams.set('version', version);
    // Add a timestamp to prevent caching
    url.searchParams.set('t', Date.now());
    return url.toString();
  }

  handleVersionLoaded(version) {
    const statusEl = document.querySelector('.frame-load-status');
    statusEl.textContent = `Running ${version}`;
    this.showToast(`Version ${version} loaded successfully`);
  }

  handleVersionError(version, error) {
    const statusEl = document.querySelector('.frame-load-status');
    statusEl.textContent = 'Error';
    console.error(`Error in version ${version}:`, error);
    this.showError(`Failed to load version ${version}: ${error}`);
  }

  handleFrameReady(version) {
    console.log(`Frame ready for version ${version}`);
  }

  refreshFrame() {
    if (this.mainFrame) {
      this.mainFrame.src = this.getVersionURL(this.currentActiveVersion);
    }
  }

  showError(message) {
    const container = document.getElementById('main-frame-container');
    const errorEl = document.createElement('div');
    errorEl.className = 'frame-error';
    errorEl.textContent = message;
    container.appendChild(errorEl);

    setTimeout(() => {
      errorEl.remove();
    }, 5000);
  }

  createLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'timeline-overlay';
    overlay.innerHTML = `
      <div class="version-timeline-status">
        <div class="timeline-loading"></div>
        <span>Switching to new version...</span>
      </div>
    `;
    return overlay;
  }
}

// Initialize version control system for non-iframe context
if (!window.location.search.includes('version=')) {
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      window.project = new ProjectV21();
      await project.initialize();
      console.log('Version control system initialized successfully');
    } catch (error) {
      console.error('Error initializing version control system:', error);
      document.getElementById('version-display').innerHTML = `
        <div class="error-message">
          Error initializing version control system: ${error.message}
        </div>
      `;
    }
  });
}

// Handle iframe initialization
if (window.location.search.includes('version=')) {
  const urlParams = new URLSearchParams(window.location.search);
  const version = urlParams.get('version');
  const versionNumber = parseInt(version.replace('v', ''));
  
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      const VersionClass = window[`ProjectV${versionNumber}`];
      if (VersionClass) {
        window.project = new VersionClass();
        await project.initialize();
        window.parent.postMessage({ type: 'VERSION_LOADED', version }, '*');
      } else {
        throw new Error(`Version class not found: ProjectV${versionNumber}`);
      }
    } catch (error) {
      window.parent.postMessage({ 
        type: 'VERSION_ERROR', 
        version,
        error: error.message 
      }, '*');
    }
  });
}