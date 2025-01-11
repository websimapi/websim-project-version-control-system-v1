// Version control system manager
class VersionControl {
  constructor() {
    this.versions = new Map();
    this.initializeVersions();
    this.onMerge = null; // Callback for merge events
  }

  initializeVersions() {
    this.versions.set('v1', {
      version: 'v1',
      timestamp: new Date('2024-01-01'),
      description: 'Initial version with basic version display functionality',
      alias: 'version_one',
      features: ['version display', 'basic UI']
    });

    this.versions.set('v2', {
      version: 'v2',
      timestamp: new Date('2024-01-02'),
      description: 'Enhanced version with command system and history tracking',
      alias: 'version_two',
      features: ['command system', 'history tracking', 'version comparison']
    });

    this.versions.set('v3', {
      version: 'v3',
      timestamp: new Date('2024-01-03'),
      description: 'Added interactive command buttons and UI improvements',
      alias: 'version_three',
      features: ['quick access buttons', 'improved UI', 'command shortcuts']
    });

    this.versions.set('v4', {
      version: 'v4',
      timestamp: new Date('2024-01-04'),
      description: 'Enhanced version management with detailed version tracking',
      alias: 'version_four',
      features: ['advanced version tracking', 'version dependencies', 'extended command set']
    });

    this.versions.set('v5', {
      version: 'v5',
      timestamp: new Date('2024-01-05'),
      description: 'Smart merging capabilities and conflict resolution',
      alias: 'version_five',
      features: ['smart merging', 'conflict resolution', 'version branching']
    });

    this.versions.set('v6', {
      version: 'v6',
      timestamp: new Date('2024-01-06'),
      description: 'Advanced branch management with visual representation',
      alias: 'version_six',
      features: ['branch visualization', 'version switching', 'interactive branch management']
    });

    this.versions.set('v7', {
      version: 'v7',
      timestamp: new Date('2024-01-07'),
      description: 'Enhanced visualization and detailed branch metrics',
      alias: 'version_seven',
      features: ['detailed branch visualization', 'merge history tracking', 'branch metrics', 'timeline view']
    });
  }

  getCurrentVersion() {
    return 'v7';
  }

  getAllVersions() {
    return Array.from(this.versions.values());
  }

  getVersionInfo(version) {
    return this.versions.get(version);
  }

  compareVersions(v1, v2) {
    const version1 = this.versions.get(v1);
    const version2 = this.versions.get(v2);
    
    if (!version1 || !version2) return null;

    let diff = '<h4>Feature Comparison:</h4>';
    
    const allFeatures = new Set([
      ...version1.features,
      ...version2.features
    ]);

    allFeatures.forEach(feature => {
      const inV1 = version1.features.includes(feature);
      const inV2 = version2.features.includes(feature);
      
      if (inV1 && !inV2) {
        diff += `<div class="diff-removed">- ${feature}</div>`;
      } else if (!inV1 && inV2) {
        diff += `<div class="diff-added">+ ${feature}</div>`;
      } else {
        diff += `<div>${feature}</div>`;
      }
    });

    return diff;
  }

  mergeVersions(versions) {
    const mergeResult = versions.map(v => this.getVersionInfo(v));
    if (this.onMerge) {
      this.onMerge(versions, mergeResult);
    }
    return mergeResult;
  }
}

// Make VersionControl available globally
window.VersionControl = VersionControl;