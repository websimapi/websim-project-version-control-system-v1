class ProjectV4 extends ProjectV3 {
  constructor() {
    super();
    this.version = 'v4';
    this.dependencies = new Map();
    this.initializeDependencies();
  }

  initializeDependencies() {
    // Enhanced dependencies map with more detail
    this.dependencies.set('v1', {
      deps: [],
      features: ['version display', 'basic UI']
    });
    this.dependencies.set('v2', {
      deps: ['v1'],
      features: ['command system', 'history tracking', 'version comparison']
    });
    this.dependencies.set('v3', {
      deps: ['v2'],
      features: ['quick access buttons', 'improved UI', 'command shortcuts']
    });
    this.dependencies.set('v4', {
      deps: ['v3'],
      features: ['advanced version tracking', 'version dependencies', 'tree visualization']
    });
  }

  initialize() {
    super.initialize();
    this.addExtendedCommands();
  }

  addExtendedCommands() {
    const originalExecuteCommand = this.executeCommand.bind(this);
    this.executeCommand = () => {
      const commandInput = document.getElementById('command-input');
      const command = commandInput.value.trim();
      const args = command.split(' ');
      const cmd = args[0].toLowerCase();

      switch(cmd) {
        case '!deps':
          if (args[1]) this.showDependencies(args[1]);
          break;
        case '!tree':
          this.showVersionTree();
          break;
        default:
          originalExecuteCommand();
      }
    };
  }

  showDependencies(version) {
    const versionData = this.dependencies.get(version);
    if (versionData) {
      this.displayMessage(`
        <h3>Dependencies for ${version}</h3>
        <ul>
          ${versionData.deps.map(d => `<li>${d}</li>`).join('')}
        </ul>
        <h4>Features:</h4>
        <ul>
          ${versionData.features.map(f => `<li>${f}</li>`).join('')}
        </ul>
      `);
    } else {
      this.displayMessage(`Version ${version} not found.`);
    }
  }

  showVersionTree() {
    let tree = '<h3>Version Dependency Tree</h3><div class="version-tree">';
    const renderNode = (version) => {
      const versionData = this.dependencies.get(version);
      if (!versionData) return '';

      const versionInfo = this.versionControl.getVersionInfo(version);
      return `
        <div class="tree-node">
          <div class="version-info">
            <span class="version">${version}</span>
            <span class="version-alias">(${versionInfo.alias})</span>
          </div>
          ${versionData.deps.length ? `
            <div class="deps">
              Dependencies: ${versionData.deps.join(', ')}
            </div>
          ` : ''}
          <div class="features">
            ${versionData.features.map(f => `<span class="feature-tag">${f}</span>`).join('')}
          </div>
        </div>
      `;
    };

    // Render tree in version order
    ['v1', 'v2', 'v3', 'v4'].forEach(version => {
      tree += renderNode(version);
    });
    
    tree += '</div>';
    this.displayMessage(tree);
  }

  showHelp() {
    super.showHelp();
    const display = document.getElementById('version-display');
    const currentContent = display.innerHTML;
    display.innerHTML = currentContent + `
      <h4>Extended Commands</h4>
      <ul>
        <li>!deps [version] - Show version dependencies</li>
        <li>!tree - Display version dependency tree</li>
      </ul>
    `;
  }
}