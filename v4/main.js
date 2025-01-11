class ProjectV4 extends ProjectV3 {
  constructor() {
    super();
    this.version = 'v4';
    this.dependencies = new Map();
    this.initializeDependencies();
  }

  initializeDependencies() {
    this.dependencies.set('v1', []);
    this.dependencies.set('v2', ['v1']);
    this.dependencies.set('v3', ['v2']);
    this.dependencies.set('v4', ['v3']);
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
    const deps = this.dependencies.get(version);
    if (deps) {
      this.displayMessage(`
        <h3>Dependencies for ${version}</h3>
        <ul>
          ${deps.map(d => `<li>${d}</li>`).join('')}
        </ul>
      `);
    } else {
      this.displayMessage(`Version ${version} not found.`);
    }
  }

  showVersionTree() {
    let tree = '<h3>Version Dependency Tree</h3><div class="version-tree">';
    for (const [version, deps] of this.dependencies) {
      tree += `
        <div class="tree-node">
          <span class="version">${version}</span>
          ${deps.length ? `<span class="deps">← ${deps.join(', ')}</span>` : ''}
        </div>
      `;
    }
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