// Version control system manager
class VersionControl {
  constructor() {
    this.versions = new Map();
    this.initializeVersions();
    this.onMerge = null; // Callback for merge events
  }

  initializeVersions() {
    // We'll set initial timestamps which will be overridden by localStorage if it exists
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day

    let storedTimestamps;
    try {
      storedTimestamps = JSON.parse(localStorage.getItem('versionTimestamps')) || {};
    } catch {
      storedTimestamps = {};
    }

    const getTimestamp = (version) => {
      if (storedTimestamps[version]) {
        return new Date(storedTimestamps[version]);
      }
      const vNum = parseInt(version.replace('v', ''));
      return new Date(now - (oneDay * (24 - vNum)));
    };

    const versions = {
      'v1': {
        description: 'Initial version with basic version display functionality',
        alias: 'version_one',
        features: ['version display', 'basic UI']
      },
      'v2': {
        description: 'Enhanced version with command system and history tracking',
        alias: 'version_two',
        features: ['command system', 'history tracking', 'version comparison']
      },
      'v3': {
        description: 'Added interactive command buttons and UI improvements',
        alias: 'version_three',
        features: ['quick access buttons', 'improved UI', 'command shortcuts']
      },
      'v4': {
        description: 'Enhanced version management with detailed version tracking',
        alias: 'version_four',
        features: ['advanced version tracking', 'version dependencies', 'extended command set']
      },
      'v5': {
        description: 'Smart merging capabilities and conflict resolution',
        alias: 'version_five',
        features: ['smart merging', 'conflict resolution', 'version branching']
      },
      'v6': {
        description: 'Advanced branch management with visual representation',
        alias: 'version_six',
        features: ['branch visualization', 'version switching', 'interactive branch management']
      },
      'v7': {
        description: 'Enhanced visualization and detailed branch metrics',
        alias: 'version_seven',
        features: ['detailed branch visualization', 'merge history tracking', 'branch metrics', 'timeline view']
      },
      'v8': {
        description: 'Advanced dependency tracking and conflict resolution',
        alias: 'version_eight',
        features: ['advanced dependency tracking', 'smart conflict resolution', 'automated merging']
      },
      'v9': {
        description: 'Enhanced visualization with interactive timeline',
        alias: 'version_nine',
        features: ['interactive timeline', 'advanced metrics', 'real-time updates']
      },
      'v10': {
        description: 'Complete version management system with advanced features',
        alias: 'version_ten',
        features: ['complete version management', 'advanced visualization', 'comprehensive metrics']
      },
      'v11': {
        description: 'Enhanced version control with complete history tracking',
        alias: 'version_eleven',
        features: ['complete history tracking', 'advanced branch management', 'comprehensive version control']
      },
      'v12': {
        description: 'Enhanced storage and data persistence',
        alias: 'version_twelve',
        features: ['local storage', 'data backup', 'persistence management']
      },
      'v13': {
        description: 'Advanced storage management with backup/restore',
        alias: 'version_thirteen',
        features: ['storage metrics', 'backup system', 'data restore']
      },
      'v14': {
        description: 'Dynamic version loading/unloading system',
        alias: 'version_fourteen',
        features: ['dynamic loading', 'version switching', 'resource management']
      },
      'v15': {
        description: 'Enhanced version navigation and control',
        alias: 'version_fifteen',
        features: ['interactive navigation', 'visual controls', 'dynamic switching']
      },
      'v16': {
        description: 'Complete version management with UI controls',
        alias: 'version_sixteen',
        features: ['interactive UI', 'version timeline', 'dynamic version management']
      },
      'v17': {
        description: 'Enhanced timestamp management with localStorage persistence',
        alias: 'version_seventeen',
        features: ['persistent timestamps', 'version history tracking', 'dynamic time management']
      },
      'v18': {
        description: 'Improved version comparison with detailed differences',
        alias: 'version_eighteen',
        features: ['detailed comparison', 'version differences', 'improved UI']
      },
      'v19': {
        description: 'Enhanced version filtering and sorting capabilities',
        alias: 'version_nineteen',
        features: ['version filtering', 'sorting capabilities', 'advanced search']
      },
      'v20': {
        description: 'Advanced version merging with conflict resolution',
        alias: 'version_twenty',
        features: ['advanced merging', 'conflict resolution', 'version integration']
      },
      'v21': {
        description: 'Enhanced version control with improved performance',
        alias: 'version_twentyone',
        features: ['improved performance', 'version optimization', 'faster loading']
      },
      'v22': {
        description: 'Improved version management with detailed metrics',
        alias: 'version_twentytwo',
        features: ['detailed metrics', 'version analysis', 'performance monitoring']
      },
      'v23': {
        description: 'Enhanced version switching with real-time updates',
        alias: 'version_twentythree',
        features: ['real-time updates', 'version switching', 'instant feedback']
      }
    };

    // Initialize all versions with proper timestamps
    for (const [version, info] of Object.entries(versions)) {
      this.versions.set(version, {
        version,
        timestamp: getTimestamp(version),
        ...info
      });
    }

    // Add v24 version info
    this.versions.set('v24', {
      version: 'v24',
      description: 'Enhanced version control with improved UI and version switching',
      alias: 'version_twentyfour',
      features: [
        'Clean UI architecture',
        'Improved version switching',
        'Fixed duplicate UI issues',
        'Enhanced timeline visualization',
        'Better version state management'
      ],
      timestamp: getTimestamp('v24')
    });

    // Store initial timestamps if they don't exist
    if (!localStorage.getItem('versionTimestamps')) {
      const timestamps = {};
      this.versions.forEach((info, version) => {
        timestamps[version] = info.timestamp.toISOString();
      });
      localStorage.setItem('versionTimestamps', JSON.stringify(timestamps));
    }
  }

  getCurrentVersion() {
    return 'v24';
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