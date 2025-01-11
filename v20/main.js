class ProjectV20 extends ProjectV19 {
  constructor() {
    super();
    this.version = 'v20';
    this.currentActiveVersion = 'v20';
    this.initializeTimestamps();
  }

  initializeBranchData() {
    return {
      main: ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10', 'v11', 'v12', 'v13', 'v14', 'v15', 'v16', 'v17', 'v19', 'v20'],
      experimental: ['v4', 'experimental-1', 'experimental-2'],
      hotfix: ['v5', 'hotfix-1'],
      feature: ['v6', 'feature-1', 'feature-2'],
      development: ['v8', 'dev-1', 'dev-2'],
      release: ['v9', 'release-1', 'release-2']
    };
  }

  initialize() {
    super.initialize();
    this.setupEnhancedVersionSwitching();
  }

  initializeTimestamps() {
    const timestamps = localStorage.getItem('versionTimestamps');
    if (!timestamps) {
      const now = new Date();
      const newTimestamps = {};
      // Set all existing versions to current time
      for (let i = 1; i <= 20; i++) {
        if (i !== 18) { // Skip v18 as it failed
          newTimestamps[`v${i}`] = now.toISOString();
        }
      }
      localStorage.setItem('versionTimestamps', JSON.stringify(newTimestamps));
    }
  }

  setupEnhancedVersionSwitching() {
    // Override frame communication to be more robust
    this.frameCommunicationTimeout = 5000; // 5 seconds timeout
    this.frameRetryAttempts = 3;
  }

  async loadVersionInFrame(version, attempt = 1) {
    const frameContainer = document.getElementById('version-frame-content');
    const loadingEl = this.createLoadingElement();
    frameContainer.appendChild(loadingEl);

    try {
      const frame = await this.createVersionFrame(version);
      
      // Clear existing frame if any
      frameContainer.innerHTML = '';
      frameContainer.appendChild(frame);

      // Wait for frame to load with timeout
      await this.waitForFrameLoad(frame);

      this.frames.set(version, frame);
      this.updateLoadedVersions();

    } catch (error) {
      if (attempt < this.frameRetryAttempts) {
        console.warn(`Retrying version ${version} load, attempt ${attempt + 1}`);
        await this.loadVersionInFrame(version, attempt + 1);
      } else {
        throw new Error(`Failed to load version ${version} after ${this.frameRetryAttempts} attempts`);
      }
    } finally {
      loadingEl.remove();
    }
  }

  waitForFrameLoad(frame) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Frame load timeout'));
      }, this.frameCommunicationTimeout);

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

  createLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'timeline-overlay';
    overlay.innerHTML = `
      <div class="version-timeline-status">
        <div class="timeline-loading"></div>
        <span>Switching version...</span>
      </div>
    `;
    return overlay;
  }

  updateUI(version) {
    super.updateUI(version);
    
    // Update timeline points
    const timelinePoints = document.querySelectorAll('.timeline-point');
    timelinePoints.forEach(point => {
      const pointVersion = point.dataset.version;
      point.classList.toggle('active', pointVersion === version);
      
      // Update timestamp display
      const timestamps = JSON.parse(localStorage.getItem('versionTimestamps'));
      const timestamp = timestamps[pointVersion];
      if (timestamp) {
        const date = new Date(timestamp);
        const tooltipEl = point.querySelector('.timestamp-tooltip');
        if (tooltipEl) {
          tooltipEl.textContent = date.toLocaleString();
        }
      }
    });
  }

  showVersionTimeline() {
    const timestamps = JSON.parse(localStorage.getItem('versionTimestamps'));
    let timeline = '<div class="version-timeline-view">';
    timeline += '<h3>Version Timeline</h3>';
    timeline += '<div class="timeline-container">';

    Object.entries(timestamps)
      .sort(([v1], [v2]) => {
        const num1 = parseInt(v1.replace('v', ''));
        const num2 = parseInt(v2.replace('v', ''));
        return num1 - num2;
      })
      .forEach(([version, timestamp]) => {
        const versionInfo = this.versionControl.getVersionInfo(version);
        if (versionInfo) {
          timeline += `
            <div class="timeline-item">
              <div class="timeline-version ${version === this.currentActiveVersion ? 'active' : ''}">
                <h4>${version}</h4>
                <span class="timestamp-tooltip">${new Date(timestamp).toLocaleString()}</span>
              </div>
              <div class="timeline-content">
                <p>${versionInfo.description}</p>
                <div class="timeline-features">
                  ${versionInfo.features.map(f => `<span class="feature-tag">${f}</span>`).join('')}
                </div>
              </div>
            </div>
          `;
        }
      });

    timeline += '</div></div>';
    this.displayMessage(timeline);
  }

  showHelp() {
    super.showHelp();
    const display = document.getElementById('version-display');
    display.innerHTML += `
      <h4>Version 20 Improvements</h4>
      <ul>
        <li>Enhanced version switching with retry mechanism</li>
        <li>Improved timeline accuracy with localStorage timestamps</li>
        <li>Better loading states and error handling</li>
        <li>Synchronized version timestamps across all views</li>
      </ul>
    `;
  }
}

// Update version control initialization
if (!window.location.search.includes('version=')) {
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      window.project = new ProjectV20();
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