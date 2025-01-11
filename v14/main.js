class ProjectV14 extends ProjectV13 {
  constructor() {
    super();
    this.version = 'v14';
    this.currentActiveVersion = 'v14';
    this.loadedScripts = new Set();
    this.loadedStyles = new Set();
  }

  initializeBranchData() {
    return {
      main: ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10', 'v11', 'v12', 'v13', 'v14'],
      experimental: ['v4', 'experimental-1', 'experimental-2'],
      hotfix: ['v5', 'hotfix-1'],
      feature: ['v6', 'feature-1', 'feature-2'],
      development: ['v8', 'dev-1', 'dev-2'],
      release: ['v9', 'release-1', 'release-2']
    };
  }

  initialize() {
    super.initialize();
    this.setupVersionManager();
  }

  setupVersionManager() {
    // Track initially loaded scripts and styles
    document.querySelectorAll('script').forEach(script => {
      if (script.src.includes('/v')) {
        this.loadedScripts.add(script.src);
      }
    });

    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
      if (link.href.includes('/v')) {
        this.loadedStyles.add(link.href);
      }
    });
  }

  async switchVersion(version) {
    const versionInfo = this.versionControl.getVersionInfo(version);
    if (!versionInfo) {
      this.showToast(`Version ${version} not found`, 'error');
      return;
    }

    const display = document.getElementById('version-display');
    display.appendChild(this.showLoading());

    try {
      // Get version number
      const vNum = parseInt(version.replace('v', ''));
      
      // Unload higher version scripts and styles
      await this.unloadHigherVersions(vNum);
      
      // Load required version scripts and styles
      await this.loadRequiredVersions(vNum);

      this.currentActiveVersion = version;
      this.showToast(`Successfully switched to ${version}`);
      
      // Initialize the specific version
      const VersionClass = window[`ProjectV${vNum}`];
      if (VersionClass) {
        window.project = new VersionClass();
        project.initialize();
      }

      this.displayMessage(`
        <div class="switch-notification">
          <h3>Switched to ${version}</h3>
          <p>Now running: ${versionInfo.description}</p>
          <div class="version-state">
            <h4>Active Components:</h4>
            <div class="active-scripts">
              ${Array.from(this.loadedScripts).map(script => 
                `<div class="component-item">${this.getFileNameFromPath(script)}</div>`
              ).join('')}
            </div>
            <div class="active-styles">
              ${Array.from(this.loadedStyles).map(style => 
                `<div class="component-item">${this.getFileNameFromPath(style)}</div>`
              ).join('')}
            </div>
          </div>
          <div class="active-features">
            ${versionInfo.features.map(f => 
              `<span class="feature-tag">${f}</span>`
            ).join('')}
          </div>
        </div>
      `);
    } catch (error) {
      this.showToast(`Error switching versions: ${error.message}`, 'error');
    }
  }

  async unloadHigherVersions(targetVersion) {
    // Remove scripts
    const scripts = document.querySelectorAll('script');
    for (let script of scripts) {
      if (script.src.includes('/v')) {
        const version = this.extractVersionNumber(script.src);
        if (version > targetVersion) {
          script.remove();
          this.loadedScripts.delete(script.src);
        }
      }
    }

    // Remove styles
    const styles = document.querySelectorAll('link[rel="stylesheet"]');
    for (let style of styles) {
      if (style.href.includes('/v')) {
        const version = this.extractVersionNumber(style.href);
        if (version > targetVersion) {
          style.remove();
          this.loadedStyles.delete(style.href);
        }
      }
    }
  }

  async loadRequiredVersions(targetVersion) {
    for (let i = 1; i <= targetVersion; i++) {
      // Load script if not already loaded
      const scriptPath = `/v${i}/main.js`;
      if (!this.loadedScripts.has(scriptPath)) {
        await this.loadScript(scriptPath);
        this.loadedScripts.add(scriptPath);
      }

      // Load style if not already loaded
      const stylePath = `/v${i}/styles.css`;
      if (!this.loadedStyles.has(stylePath)) {
        await this.loadStyle(stylePath);
        this.loadedStyles.add(stylePath);
      }
    }
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  loadStyle(href) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  extractVersionNumber(path) {
    const match = path.match(/\/v(\d+)\//);
    return match ? parseInt(match[1]) : 0;
  }

  getFileNameFromPath(path) {
    return path.split('/').slice(-2).join('/');
  }

  showHelp() {
    super.showHelp();
    const display = document.getElementById('version-display');
    display.innerHTML += `
      <h4>Version Control Commands</h4>
      <ul>
        <li>!switch [version] - Switch to specific version (will unload higher versions)</li>
        <li>!loaded - Show currently loaded version files</li>
      </ul>
    `;
  }
}