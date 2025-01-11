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
    await this.initializeVersionData();
    this.createUI();
    this.setupEventListeners();
    
    // Load initial version
    await this.switchVersion(this.currentVersion);
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
      // Fetch project data using project ID
      const response = await fetch(`/api/v1/projects/${this.projectId}`);
      const data = await response.json();
      this.projectData = data;
    } catch (error) {
      console.error('Error fetching project data:', error);
    }
  }

  createUI() {
    document.body.innerHTML = `
      <div class="app-container">
        <header class="header">
          <h1>Version Control System</h1>
        </header>
        
        <div class="timeline-container">
          <div class="timeline">
            ${this.createTimelineHTML()}
          </div>
        </div>
        
        <div class="frame-container">
          <div class="frame-header">
            <div class="frame-status">
              <span>Current Version: <strong>${this.currentVersion}</strong></span>
              <span class="frame-state">Ready</span>
            </div>
            <button onclick="project.refreshFrame()">Refresh</button>
          </div>
          <div id="frame-content"></div>
        </div>
      </div>
    `;

    // Initialize main frame
    this.initializeFrame();
  }

  createTimelineHTML() {
    const timestamps = JSON.parse(localStorage.getItem('versionTimestamps'));
    let html = '<div class="timeline-track">';
    
    // Calculate positions for each version
    const totalVersions = Object.keys(timestamps).length;
    let index = 0;
    
    Object.entries(timestamps).forEach(([version, timestamp]) => {
      const position = (index / (totalVersions - 1)) * 100;
      html += `
        <div class="version-point ${version === this.currentVersion ? 'active' : ''}"
             style="left: ${position}%"
             data-version="${version}">
          <div class="version-label">${version}</div>
          <div class="version-date">${new Date(timestamp).toLocaleDateString()}</div>
        </div>
      `;
      index++;
    });
    
    html += '</div>';
    return html;
  }

  initializeFrame() {
    const container = document.getElementById('frame-content');
    this.mainFrame = document.createElement('iframe');
    this.mainFrame.className = 'version-frame';
    container.appendChild(this.mainFrame);
  }

  setupEventListeners() {
    document.addEventListener('click', async (e) => {
      if (e.target.closest('.version-point')) {
        const version = e.target.closest('.version-point').dataset.version;
        await this.switchVersion(version);
      }
    });
  }

  async switchVersion(version) {
    if (this.isLoading) return;
    this.isLoading = true;

    const overlay = this.createLoadingOverlay(version);
    document.body.appendChild(overlay);

    try {
      // Clear current frame
      this.mainFrame.src = 'about:blank';
      await new Promise(resolve => setTimeout(resolve, 100));

      // Update frame source with version parameter
      this.mainFrame.src = this.getVersionURL(version);
      
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Version load timeout')), 10000);
        
        this.mainFrame.onload = () => {
          clearTimeout(timeout);
          this.currentVersion = version;
          this.updateUI(version);
          resolve();
        };
      });

      this.showToast(`Successfully switched to ${version}`);
    } catch (error) {
      console.error('Version switch error:', error);
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

    // Update frame status
    document.querySelector('.frame-state').textContent = `Running ${version}`;
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