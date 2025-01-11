class ProjectV2 {
  constructor() {
    this.version = 'v2';
    this.versionControl = new VersionControl();
    this.commandHistory = [];
  }

  initialize() {
    console.log(`Initializing Project Version: ${this.version}`);
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Execute command button
    document.getElementById('execute-command').addEventListener('click', () => {
      this.executeCommand();
    });

    // Command input enter key
    document.getElementById('command-input').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.executeCommand();
      }
    });

    // Quick access command buttons
    document.querySelectorAll('.command-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const command = e.target.dataset.command;
        const commandInput = document.getElementById('command-input');
        commandInput.value = command;
        this.executeCommand();
      });
    });
  }

  executeCommand() {
    const commandInput = document.getElementById('command-input');
    const command = commandInput.value.trim();
    
    if (!command) return;

    this.addToHistory(command);
    
    const args = command.split(' ');
    const cmd = args[0].toLowerCase();

    switch(cmd) {
      case '!list':
        this.listVersions();
        break;
      case '!info':
        if (args[1]) this.showVersionInfo(args[1]);
        break;
      case '!diff':
        if (args[1] && args[2]) this.showDiff(args[1], args[2]);
        break;
      case '!help':
        this.showHelp();
        break;
      case '!merge':
        if (args.length > 2) {
          const versions = args.slice(1);
          this.versionControl.mergeVersions(versions);
        }
        break;
      default:
        this.displayMessage('Unknown command. Type !help for available commands.');
    }

    commandInput.value = '';
  }

  addToHistory(command) {
    this.commandHistory.push(command);
    const historyList = document.getElementById('history-list');
    const li = document.createElement('li');
    li.textContent = `$ ${command}`;
    historyList.insertBefore(li, historyList.firstChild);
    if (this.commandHistory.length > 10) {
      historyList.removeChild(historyList.lastChild);
    }
  }

  listVersions() {
    const versions = this.versionControl.getAllVersions();
    let output = '<h3>Available Versions</h3><ul>';
    versions.forEach(v => {
      output += `<li>${v.version} (${v.alias}) - ${v.timestamp.toLocaleString()}</li>`;
    });
    output += '</ul>';
    this.displayMessage(output);
  }

  showVersionInfo(version) {
    const info = this.versionControl.getVersionInfo(version);
    if (info) {
      this.displayMessage(`
        <h3>Version: ${version}</h3>
        <p>Alias: ${info.alias}</p>
        <p>Created: ${info.timestamp.toLocaleString()}</p>
        <p>Description: ${info.description}</p>
      `);
    } else {
      this.displayMessage(`Version ${version} not found.`);
    }
  }

  showDiff(v1, v2) {
    const diff = this.versionControl.compareVersions(v1, v2);
    if (diff) {
      this.displayMessage(`
        <h3>Differences between ${v1} and ${v2}</h3>
        <div class="diff-display">
          ${diff}
        </div>
      `);
    } else {
      this.displayMessage(`Unable to compare versions ${v1} and ${v2}.`);
    }
  }

  showHelp() {
    this.displayMessage(`
      <h3>Available Commands</h3>
      <ul>
        <li>!list - Show all available versions</li>
        <li>!info [version] - Show detailed information about a specific version</li>
        <li>!diff [v1] [v2] - Compare two versions</li>
        <li>!merge [v1] [v2] ... - Merge multiple versions</li>
        <li>!help - Show this help message</li>
      </ul>
    `);
  }

  displayMessage(message) {
    const display = document.getElementById('version-display');
    display.innerHTML = message;
  }
}