class ProjectV17 extends ProjectV16 {
  constructor() {
    super();
    this.version = 'v17';
    this.currentActiveVersion = 'v17';
    this.initializeVersionTimestamps();
  }

  initializeBranchData() {
    return {
      main: ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10', 'v11', 'v12', 'v13', 'v14', 'v15', 'v16', 'v17'],
      experimental: ['v4', 'experimental-1', 'experimental-2'],
      hotfix: ['v5', 'hotfix-1'],
      feature: ['v6', 'feature-1', 'feature-2'],
      development: ['v8', 'dev-1', 'dev-2'],
      release: ['v9', 'release-1', 'release-2']
    };
  }

  initialize() {
    super.initialize();
    this.setupVersionTimestamps();
  }

  initializeVersionTimestamps() {
    // Check if timestamps already exist in localStorage
    if (!localStorage.getItem('versionTimestamps')) {
      const timestamps = {};
      const now = new Date();
      const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
      
      // Set timestamps for all versions
      for (let i = 1; i <= 17; i++) {
        timestamps[`v${i}`] = new Date(now - (oneDay * (17 - i))).toISOString();
      }
      
      localStorage.setItem('versionTimestamps', JSON.stringify(timestamps));
    }
  }

  setupVersionTimestamps() {
    // Update the VersionControl instance with stored timestamps
    const timestamps = JSON.parse(localStorage.getItem('versionTimestamps'));
    for (const [version, timestamp] of Object.entries(timestamps)) {
      const versionInfo = this.versionControl.getVersionInfo(version);
      if (versionInfo) {
        versionInfo.timestamp = new Date(timestamp);
      }
    }
  }

  // When switching versions, also update the timestamps
  updateVersionInfo(version, info) {
    this.versionControl.versions.set(version, info);
    // Update timestamp in localStorage
    const timestamps = JSON.parse(localStorage.getItem('versionTimestamps'));
    timestamps[version] = info.timestamp.toISOString();
    localStorage.setItem('versionTimestamps', JSON.stringify(timestamps));
  }

  showHelp() {
    super.showHelp();
    const display = document.getElementById('version-display');
    display.innerHTML += `
      <h4>Version Timestamps</h4>
      <ul>
        <li>Timestamps are now stored in localStorage for each version</li>
        <li>Version timestamps are updated when switching versions</li>
      </ul>
    `;
  }
}