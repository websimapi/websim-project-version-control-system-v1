class ProjectV19 extends ProjectV17 {
  constructor() {
    super();
    this.version = 'v19';
    this.currentActiveVersion = 'v19';
    this.frames = new Map();
  }

  initializeBranchData() {
    return {
      main: ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10', 'v11', 'v12', 'v13', 'v14', 'v15', 'v16', 'v17', 'v19'],
      experimental: ['v4', 'experimental-1', 'experimental-2'],
      hotfix: ['v5', 'hotfix-1'],
      feature: ['v6', 'feature-1', 'feature-2'],
      development: ['v8', 'dev-1', 'dev-2'],
      release: ['v9', 'release-1', 'release-2']
    };
  }

  initialize() {
    super.initialize();
    this.setupIframeSystem();
  }

  setupIframeSystem() {
    const container = document.createElement('div');
    container.className = 'version-frame-container';
    container.innerHTML = this.createFrameContainerHTML();
    document.querySelector('.version-container').appendChild(container);

    this.setupFrameEvents();
  }

  createFrameContainerHTML() {
    return `
      <div class="frame-toolbar">
        <div class="frame-status">
          <span class="frame-version">Current: ${this.currentActiveVersion}</span>
          <span class="frame-separator">|</span>
          <span class="frame-loaded-versions"></span>
        </div>
        <div class="frame-controls">
          <button class="frame-refresh" onclick="project.refreshCurrentFrame()">
            Refresh Frame
          </button>
        </div>
      </div>
      <div id="version-frame-content"></div>
    `;
  }

  setupFrameEvents() {
    window.addEventListener('message', (event) => {
      if (event.data.type === 'VERSION_LOADED') {
        this.handleFrameLoad(event.data.version);
      }
    });
  }

  async switchVersion(version) {
    const versionInfo = this.versionControl.getVersionInfo(version);
    if (!versionInfo) {
      this.showToast(`Version ${version} not found`, 'error');
      return;
    }

    try {
      await this.loadVersionInFrame(version);
      this.currentActiveVersion = version;
      this.showToast(`Successfully switched to ${version}`);
      this.updateUI(version);
    } catch (error) {
      this.showToast(`Error switching to version ${version}: ${error.message}`, 'error');
    }
  }

  async loadVersionInFrame(version) {
    const frameContainer = document.getElementById('version-frame-content');
    const loadingEl = this.createLoadingElement();
    frameContainer.appendChild(loadingEl);

    try {
      if (!this.frames.has(version)) {
        const frame = await this.createVersionFrame(version);
        this.frames.set(version, frame);
      }

      frameContainer.innerHTML = '';
      frameContainer.appendChild(this.frames.get(version));

      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Frame load timeout')), 10000);
        this.frames.get(version).onload = () => {
          clearTimeout(timeout);
          resolve();
        };
      });

    } finally {
      loadingEl.remove();
    }
  }

  createVersionFrame(version) {
    return new Promise((resolve, reject) => {
      const frame = document.createElement('iframe');
      frame.className = 'version-frame';
      frame.src = this.getVersionURL(version);

      frame.onload = () => {
        this.initializeFrame(frame, version);
        resolve(frame);
      };

      frame.onerror = () => reject(new Error('Failed to load version frame'));
    });
  }

  getVersionURL(version) {
    const url = new URL(window.location.href);
    url.searchParams.set('version', version);
    return url.toString();
  }

  initializeFrame(frame, version) {
    frame.contentWindow.postMessage({
      type: 'INIT_VERSION',
      version: version,
      data: this.versionControl.getVersionInfo(version)
    }, '*');

    this.setupFrameCommunication(frame, version);
  }

  setupFrameCommunication(frame, version) {
    window.addEventListener('message', (event) => {
      if (event.source !== frame.contentWindow) return;

      switch (event.data.type) {
        case 'FRAME_READY':
          this.handleFrameReady(version);
          break;
        case 'FRAME_ERROR':
          this.handleFrameError(version, event.data.error);
          break;
      }
    });
  }

  handleFrameReady(version) {
    this.updateLoadedVersions();
    this.showToast(`Version ${version} frame ready`);
  }

  handleFrameError(version, error) {
    this.showToast(`Error in version ${version}: ${error}`, 'error');
  }

  handleFrameLoad(version) {
    this.updateLoadedVersions();
    this.showToast(`Version ${version} loaded successfully`);
  }

  updateLoadedVersions() {
    const loadedVersions = Array.from(this.frames.keys()).join(', ');
    document.querySelector('.frame-loaded-versions').textContent = 
      `Loaded: ${loadedVersions || 'none'}`;
  }

  refreshCurrentFrame() {
    const frame = this.frames.get(this.currentActiveVersion);
    if (frame) {
      frame.src = frame.src;
    }
  }

  createLoadingElement() {
    const loading = document.createElement('div');
    loading.className = 'frame-loading';
    loading.innerHTML = `
      <div class="frame-loading-spinner"></div>
    `;
    return loading;
  }

  updateUI(version) {
    const buttons = document.querySelectorAll('.version-nav-btn');
    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.version === version);
    });

    document.querySelector('.frame-version').textContent = `Current: ${version}`;
    
    this.updateTimelineUI();
  }

  showHelp() {
    super.showHelp();
    const display = document.getElementById('version-display');
    display.innerHTML += `
      <h4>Iframe Version System</h4>
      <ul>
        <li>Each version runs in its own isolated iframe</li>
        <li>Use the refresh button to reload the current version</li>
        <li>Version switching maintains state independence</li>
        <li>Monitor loaded versions in the frame toolbar</li>
      </ul>
    `;
  }
}

window.addEventListener('message', (event) => {
  if (event.data.type === 'INIT_VERSION') {
    const { version, data } = event.data;
    try {
      const VersionClass = window[`ProjectV${version.replace('v', '')}`];
      if (VersionClass) {
        window.project = new VersionClass();
        project.initialize();
        window.parent.postMessage({ type: 'VERSION_LOADED', version }, '*');
      }
    } catch (error) {
      window.parent.postMessage({ 
        type: 'FRAME_ERROR', 
        version, 
        error: error.message 
      }, '*');
    }
  }
});