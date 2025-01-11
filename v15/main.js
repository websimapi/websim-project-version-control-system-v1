class ProjectV15 extends ProjectV14 {
  constructor() {
    super();
    this.version = 'v15';
    this.currentActiveVersion = 'v15';
  }

  initializeBranchData() {
    return {
      main: ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10', 'v11', 'v12', 'v13', 'v14', 'v15'],
      experimental: ['v4', 'experimental-1', 'experimental-2'],
      hotfix: ['v5', 'hotfix-1'],
      feature: ['v6', 'feature-1', 'feature-2'],
      development: ['v8', 'dev-1', 'dev-2'],
      release: ['v9', 'release-1', 'release-2']
    };
  }

  initialize() {
    super.initialize();
    this.setupInteractiveUI();
  }

  setupInteractiveUI() {
    this.createVersionNav();
    this.setupVersionClickHandlers();
  }

  createVersionNav() {
    const nav = document.createElement('div');
    nav.className = 'version-navigation';
    const versions = this.versionControl.getAllVersions();
    
    nav.innerHTML = `
      <h3>Version Navigation</h3>
      <div class="version-nav-container">
        ${versions.map(v => this.createVersionButton(v)).join('')}
      </div>
    `;

    document.querySelector('.version-container').insertBefore(
      nav,
      document.querySelector('.command-quick-access')
    );
  }

  createVersionButton(version) {
    return `
      <button class="version-nav-btn ${version.version === this.currentActiveVersion ? 'active' : ''}"
              data-version="${version.version}">
        <span class="version-label">${version.version}</span>
        <span class="version-tooltip">
          ${version.description}<br>
          Features: ${version.features.join(', ')}
        </span>
      </button>
    `;
  }

  setupVersionClickHandlers() {
    document.addEventListener('click', async (e) => {
      if (e.target.closest('.version-nav-btn')) {
        const btn = e.target.closest('.version-nav-btn');
        const version = btn.dataset.version;
        await this.switchVersion(version);
        this.updateVersionNav();
      }
    });
  }

  updateVersionNav() {
    const buttons = document.querySelectorAll('.version-nav-btn');
    buttons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.version === this.currentActiveVersion);
    });
  }
}