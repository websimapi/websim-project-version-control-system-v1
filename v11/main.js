class ProjectV11 extends ProjectV7 {
  constructor() {
    super();
    this.version = 'v11';
    this.currentActiveVersion = 'v11';
    this.branchData = this.initializeBranchData();
  }

  initializeBranchData() {
    return {
      main: ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10', 'v11'],
      experimental: ['v4', 'experimental-1', 'experimental-2'],
      hotfix: ['v5', 'hotfix-1'],
      feature: ['v6', 'feature-1', 'feature-2'],
      development: ['v8', 'dev-1', 'dev-2'],
      release: ['v9', 'release-1', 'release-2']
    };
  }

  initialize() {
    super.initialize();
    this.setupEnhancedVisualization();
  }

  setupEnhancedVisualization() {
    const originalExecuteCommand = this.executeCommand.bind(this);
    this.executeCommand = () => {
      const commandInput = document.getElementById('command-input');
      const command = commandInput.value.trim();
      const args = command.split(' ');
      const cmd = args[0].toLowerCase();

      switch(cmd) {
        case '!timeline':
          this.showVersionTimeline();
          break;
        case '!metrics':
          this.showVersionMetrics();
          break;
        default:
          originalExecuteCommand();
      }
    };
  }

  showVersionTimeline() {
    const versions = this.versionControl.getAllVersions();
    let timeline = '<div class="version-timeline-view">';
    timeline += '<h3>Version Timeline</h3>';
    timeline += '<div class="timeline-container">';

    versions.forEach(version => {
      timeline += `
        <div class="timeline-item">
          <div class="timeline-version ${version.version === this.currentActiveVersion ? 'active' : ''}">
            <h4>${version.version}</h4>
            <span class="timeline-date">${version.timestamp.toLocaleDateString()}</span>
          </div>
          <div class="timeline-content">
            <p>${version.description}</p>
            <div class="timeline-features">
              ${version.features.map(f => `<span class="feature-tag">${f}</span>`).join('')}
            </div>
          </div>
        </div>
      `;
    });

    timeline += '</div></div>';
    this.displayMessage(timeline);
  }

  showVersionMetrics() {
    const versions = this.versionControl.getAllVersions();
    let metrics = '<div class="version-metrics-view">';
    metrics += '<h3>Version Metrics</h3>';

    // Feature growth over time
    const featureGrowth = versions.map(v => ({
      version: v.version,
      featureCount: v.features.length
    }));

    metrics += `
      <div class="metrics-section">
        <h4>Feature Growth</h4>
        <div class="feature-graph">
          ${this.generateFeatureGraph(featureGrowth)}
        </div>
      </div>
      <div class="metrics-section">
        <h4>Version Statistics</h4>
        <div class="version-stats">
          <div class="stat-item">
            <span class="stat-label">Total Versions</span>
            <span class="stat-value">${versions.length}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total Features</span>
            <span class="stat-value">${this.calculateTotalFeatures(versions)}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Average Features per Version</span>
            <span class="stat-value">${this.calculateAverageFeatures(versions)}</span>
          </div>
        </div>
      </div>
    `;

    metrics += '</div>';
    this.displayMessage(metrics);
  }

  generateFeatureGraph(featureGrowth) {
    const maxFeatures = Math.max(...featureGrowth.map(v => v.featureCount));
    const graphHeight = 200;
    
    return `
      <div class="feature-graph-container">
        ${featureGrowth.map(v => `
          <div class="graph-bar">
            <div class="bar" style="height: ${(v.featureCount / maxFeatures) * graphHeight}px"></div>
            <span class="bar-label">${v.version}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  calculateTotalFeatures(versions) {
    const uniqueFeatures = new Set();
    versions.forEach(v => {
      v.features.forEach(f => uniqueFeatures.add(f));
    });
    return uniqueFeatures.size;
  }

  calculateAverageFeatures(versions) {
    const total = versions.reduce((sum, v) => sum + v.features.length, 0);
    return (total / versions.length).toFixed(1);
  }

  showHelp() {
    super.showHelp();
    const display = document.getElementById('version-display');
    display.innerHTML += `
      <h4>Enhanced Commands</h4>
      <ul>
        <li>!timeline - Show interactive version timeline</li>
        <li>!metrics - Display comprehensive version metrics</li>
      </ul>
    `;
  }
}