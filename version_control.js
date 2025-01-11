// Version control system manager
class VersionControl {
  constructor() {
    this.versions = new Map();
    this.initializeVersions();
    this.onMerge = null; // Callback for merge events
  }

  initializeVersions() {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day

    this.versions.set('v1', {
      version: 'v1',
      timestamp: new Date(now - (oneDay * 11)),
      description: 'Initial version with basic version display functionality',
      alias: 'version_one',
      features: ['version display', 'basic UI']
    });

    this.versions.set('v2', {
      version: 'v2',
      timestamp: new Date(now - (oneDay * 10)),
      description: 'Enhanced version with command system and history tracking',
      alias: 'version_two',
      features: ['command system', 'history tracking', 'version comparison']
    });

    this.versions.set('v3', {
      version: 'v3',
      timestamp: new Date(now - (oneDay * 9)),
      description: 'Added interactive command buttons and UI improvements',
      alias: 'version_three',
      features: ['quick access buttons', 'improved UI', 'command shortcuts']
    });

    this.versions.set('v4', {
      version: 'v4',
      timestamp: new Date(now - (oneDay * 8)),
      description: 'Enhanced version management with detailed version tracking',
      alias: 'version_four',
      features: ['advanced version tracking', 'version dependencies', 'extended command set']
    });

    this.versions.set('v5', {
      version: 'v5',
      timestamp: new Date(now - (oneDay * 7)),
      description: 'Smart merging capabilities and conflict resolution',
      alias: 'version_five',
      features: ['smart merging', 'conflict resolution', 'version branching']
    });

    this.versions.set('v6', {
      version: 'v6',
      timestamp: new Date(now - (oneDay * 6)),
      description: 'Advanced branch management with visual representation',
      alias: 'version_six',
      features: ['branch visualization', 'version switching', 'interactive branch management']
    });

    this.versions.set('v7', {
      version: 'v7',
      timestamp: new Date(now - (oneDay * 5)),
      description: 'Enhanced visualization and detailed branch metrics',
      alias: 'version_seven',
      features: ['detailed branch visualization', 'merge history tracking', 'branch metrics', 'timeline view']
    });

    this.versions.set('v8', {
      version: 'v8',
      timestamp: new Date(now - (oneDay * 4)),
      description: 'Advanced dependency tracking and conflict resolution',
      alias: 'version_eight',
      features: ['advanced dependency tracking', 'smart conflict resolution', 'automated merging']
    });

    this.versions.set('v9', {
      version: 'v9',
      timestamp: new Date(now - (oneDay * 3)),
      description: 'Enhanced visualization with interactive timeline',
      alias: 'version_nine',
      features: ['interactive timeline', 'advanced metrics', 'real-time updates']
    });

    this.versions.set('v10', {
      version: 'v10',
      timestamp: new Date(now - (oneDay * 2)),
      description: 'Complete version management system with advanced features',
      alias: 'version_ten',
      features: ['complete version management', 'advanced visualization', 'comprehensive metrics']
    });

    this.versions.set('v11', {
      version: 'v11',
      timestamp: new Date(now - (oneDay * 1)),
      description: 'Enhanced version control with complete history tracking',
      alias: 'version_eleven',
      features: ['complete history tracking', 'advanced branch management', 'comprehensive version control']
    });
  }

  getCurrentVersion() {
    return 'v11';
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