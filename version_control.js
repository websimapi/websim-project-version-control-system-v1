// Version control system manager
class VersionControl {
  constructor() {
    this.versions = new Map();
    this.initializeVersions();
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
      description: 'Latest version with advanced merging capabilities',
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
  }

  getCurrentVersion() {
    return 'v6';
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
    console.log('Merging versions:', versions);
    return versions.map(v => this.getVersionInfo(v));
  }
}

// Make VersionControl available globally
window.VersionControl = VersionControl;