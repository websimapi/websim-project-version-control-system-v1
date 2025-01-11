class ProjectV3 extends ProjectV2 {
  constructor() {
    super();
    this.version = 'v3';
  }

  initialize() {
    super.initialize();
    this.enhanceUI();
  }

  enhanceUI() {
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
          case 'l':
            e.preventDefault();
            this.executeCommandByShortcut('!list');
            break;
          case 'h':
            e.preventDefault();
            this.executeCommandByShortcut('!help');
            break;
        }
      }
    });
  }

  executeCommandByShortcut(command) {
    const commandInput = document.getElementById('command-input');
    commandInput.value = command;
    this.executeCommand();
  }

  showHelp() {
    super.showHelp();
    const display = document.getElementById('version-display');
    display.innerHTML += `
      <h4>Keyboard Shortcuts</h4>
      <ul>
        <li>Ctrl/Cmd + L: List versions</li>
        <li>Ctrl/Cmd + H: Show help</li>
      </ul>
    `;
  }
}