class ProjectV21 extends ProjectV20 {
  constructor() {
    super();
    this.version = 'v21';
    this.currentActiveVersion = 'v21';
    this.mainFrame = null;
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
    if (!this.mainFrame) {
      this.mainFrame = document.createElement('iframe');
      this.mainFrame.className = 'version-frame';
      document.getElementById('main-frame-container').appendChild(this.mainFrame);
    }
  }

  async switchVersion(version) {
    const versionInfo = this.versionControl.getVersionInfo(version);
    if (!versionInfo) {
      this.showToast(`Version ${version} not found`, 'error');
      return;
    }

    const loadingOverlay = this.createLoadingOverlay();
    document.querySelector('.version-container').appendChild(loadingOverlay);

    try {
      await this.loadVersionInFrame(version);
      this.currentActiveVersion = version;
      this.showToast(`Successfully switched to ${version}`);
      this.updateUI(version);
    } catch (error) {
      this.showToast(`Error switching to version ${version}: ${error.message}`, 'error');
      console.error('Version switch error:', error);
    } finally {
      loadingOverlay.remove();
    }
  }

  async loadVersionInFrame(version) {
    const frame = this.mainFrame;
    const statusEl = document.querySelector('.frame-load-status');
    statusEl.textContent = `Loading ${version}...`;

    try {
      // Set frame src with version parameter
      frame.src = this.getVersionURL(version);

      // Wait for frame to load
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Frame load timeout')), 10000);

        const handleMessage = (event) => {
          if (event.source === frame.contentWindow && event.data.type === 'VERSION_LOADED') {
            clearTimeout(timeout);
            window.removeEventListener('message', handleMessage);
            resolve();
          }
        };

        window.addEventListener('message', handleMessage);

        frame.onerror = () => {
          clearTimeout(timeout);
          window.removeEventListener('message', handleMessage);
          reject(new Error('Frame failed to load'));
        };
      });

      statusEl.textContent = `Running ${version}`;

    } catch (error) {
      statusEl.textContent = 'Error';
      throw error;
    }
  }

  refreshFrame() {
    if (this.mainFrame) {
      this.mainFrame.src = this.mainFrame.src;
    }
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

  showHelp() {
    super.showHelp();
    const display = document.getElementById('version-display');
    display.innerHTML += `
      <h4>Version 21 Improvements</h4>
      <ul>
        <li>Single iframe system for better version isolation</li>
        <li>Improved version switching reliability</li>
        <li>Enhanced loading states and error handling</li>
        <li>Streamlined frame management</li>
      </ul>
    `;
  }
}

// Initialize version control system
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