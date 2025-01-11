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
  }

  getCurrentVersion() {
    return 'v2';
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
    
    // Compare features
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
    // This will be implemented when merging is needed
    // Format: !merge v1 v2 v3 etc
    console.log('Merging versions:', versions);
    return null;
  }
}

// Make VersionControl available globally
window.VersionControl = VersionControl;