class ProjectV16 extends ProjectV15 {
  constructor() {
    super();
    this.version = 'v16';
    this.currentActiveVersion = 'v16';
  }

  initializeBranchData() {
    return {
      main: ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10', 'v11', 'v12', 'v13', 'v14', 'v15', 'v16'],
      experimental: ['v4', 'experimental-1', 'experimental-2'],
      hotfix: ['v5', 'hotfix-1'],
      feature: ['v6', 'feature-1', 'feature-2'],
      development: ['v8', 'dev-1', 'dev-2'],
      release: ['v9', 'release-1', 'release-2']
    };
  }

  initialize() {
    super.initialize();
    this.setupEnhancedUI();
  }

  setupEnhancedUI() {
    this.createTimelineNav();
    this.setupInteractiveTimeline();
    this.enhanceVersionSwitching();
  }

  createTimelineNav() {
    const versions = this.versionControl.getAllVersions();
    const timeline = document.createElement('div');
    timeline.className = 'interactive-timeline';
    
    timeline.innerHTML = `
      <h3>Interactive Version Timeline</h3>
      <div class="timeline-wrapper">
        <div class="timeline-track">
          ${versions.map(v => this.createTimelinePoint(v)).join('')}
        </div>
        <div class="timeline-dates">
          ${versions.map(v => `
            <span class="timeline-date">${v.timestamp.toLocaleDateString()}</span>
          `).join('')}
        </div>
      </div>
    `;

    document.querySelector('.version-navigation').appendChild(timeline);
  }

  createTimelinePoint(version) {
    return `
      <div class="timeline-point ${version.version === this.currentActiveVersion ? 'active' : ''}"
           data-version="${version.version}">
        <div class="point-label">${version.version}</div>
        <div class="point-info">
          <h4>${version.version} (${version.alias})</h4>
          <p>${version.description}</p>
          <div class="point-features">
            ${version.features.map(f => `<span class="feature-tag">${f}</span>`).join('')}
          </div>
          <button class="switch-version-btn" data-version="${version.version}">
            Switch to this version
          </button>
        </div>
      </div>
    `;
  }

  setupInteractiveTimeline() {
    document.addEventListener('click', async (e) => {
      if (e.target.classList.contains('switch-version-btn')) {
        const version = e.target.dataset.version;
        await this.switchVersion(version);
        this.updateTimelineUI();
      }
      
      if (e.target.closest('.timeline-point')) {
        const points = document.querySelectorAll('.timeline-point');
        points.forEach(p => p.classList.remove('show-info'));
        e.target.closest('.timeline-point').classList.add('show-info');
      }
    });
  }

  enhanceVersionSwitching() {
    // Add loading progress indicator
    const progressBar = document.querySelector('.progress-bar');
    
    const originalSwitch = this.switchVersion.bind(this);
    this.switchVersion = async (version) => {
      progressBar.style.width = '0%';
      
      try {
        // Update progress as files are loaded/unloaded
        const totalSteps = this.calculateLoadSteps(version);
        let currentStep = 0;
        
        const updateProgress = () => {
          currentStep++;
          progressBar.style.width = `${(currentStep / totalSteps) * 100}%`;
        };

        // Hook into file loading events
        const originalLoadScript = this.loadScript.bind(this);
        this.loadScript = async (src) => {
          await originalLoadScript(src);
          updateProgress();
        };

        const originalLoadStyle = this.loadStyle.bind(this);
        this.loadStyle = async (href) => {
          await originalLoadStyle(href);
          updateProgress();
        };

        await originalSwitch(version);
        
        // Reset progress bar
        setTimeout(() => {
          progressBar.style.width = '0%';
        }, 500);
        
      } catch (error) {
        progressBar.style.width = '0%';
        throw error;
      }
    };
  }

  calculateLoadSteps(targetVersion) {
    const targetNum = parseInt(targetVersion.replace('v', ''));
    const currentNum = parseInt(this.currentActiveVersion.replace('v', ''));
    
    // Count scripts and styles that need to be loaded/unloaded
    let steps = 0;
    
    // Unloading steps
    if (currentNum > targetNum) {
      steps += (currentNum - targetNum) * 2; // Both JS and CSS
    }
    
    // Loading steps
    if (targetNum > currentNum) {
      steps += (targetNum - currentNum) * 2; // Both JS and CSS
    }
    
    return steps;
  }

  updateTimelineUI() {
    const points = document.querySelectorAll('.timeline-point');
    points.forEach(point => {
      point.classList.toggle('active', point.dataset.version === this.currentActiveVersion);
    });

    // Update version navigation buttons
    this.updateVersionNav();
  }

  showHelp() {
    super.showHelp();
    const display = document.getElementById('version-display');
    display.innerHTML += `
      <h4>Interactive Controls</h4>
      <ul>
        <li>Click version points on the timeline to view details</li>
        <li>Use the version navigation buttons for quick switching</li>
        <li>Watch the progress bar for version switching status</li>
      </ul>
    `;
  }
}