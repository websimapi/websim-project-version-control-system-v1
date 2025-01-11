class ProjectV13 extends ProjectV12 {
  constructor() {
    super();
    this.version = 'v13';
    this.currentActiveVersion = 'v13';
    this.initializeLocalStorage();
  }

  initializeBranchData() {
    return {
      main: ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10', 'v11', 'v12', 'v13'],
      experimental: ['v4', 'experimental-1', 'experimental-2'],
      hotfix: ['v5', 'hotfix-1'],
      feature: ['v6', 'feature-1', 'feature-2'],
      development: ['v8', 'dev-1', 'dev-2'],
      release: ['v9', 'release-1', 'release-2']
    };
  }

  initializeLocalStorage() {
    // Initialize version timestamps if not exists
    if (!localStorage.getItem('versionTimestamps')) {
      const timestamps = {};
      const now = new Date();
      const oneDay = 24 * 60 * 60 * 1000; // milliseconds in a day
      
      for (let i = 1; i <= 13; i++) {
        timestamps[`v${i}`] = new Date(now - (oneDay * (13 - i))).toISOString();
      }
      
      localStorage.setItem('versionTimestamps', JSON.stringify(timestamps));
    }

    // Initialize user preferences if not exists
    if (!localStorage.getItem('userPreferences')) {
      localStorage.setItem('userPreferences', JSON.stringify({
        theme: 'light',
        showTimestamps: true,
        detailedView: false
      }));
    }
  }

  initialize() {
    super.initialize();
    this.setupStorageCommands();
    this.setupLocalStorageUI();
  }

  setupStorageCommands() {
    const originalExecuteCommand = this.executeCommand.bind(this);
    this.executeCommand = () => {
      const commandInput = document.getElementById('command-input');
      const command = commandInput.value.trim();
      const args = command.split(' ');
      const cmd = args[0].toLowerCase();

      switch(cmd) {
        case '!storage':
          this.showStorageStatus();
          break;
        case '!clear':
          this.clearStorageData();
          break;
        case '!backup':
          this.backupData();
          break;
        case '!restore':
          if (args[1]) this.restoreData(args[1]);
          break;
        default:
          originalExecuteCommand();
      }
    };
  }

  setupLocalStorageUI() {
    const container = document.querySelector('.version-container');
    const storageInfo = document.createElement('div');
    storageInfo.className = 'storage-info';
    storageInfo.innerHTML = this.getStorageInfoHTML();
    container.appendChild(storageInfo);
  }

  getStorageInfoHTML() {
    const storageAvailable = this.isStorageAvailable();
    const lastUpdate = localStorage.getItem('versionControlData') 
      ? JSON.parse(localStorage.getItem('versionControlData')).lastUpdated 
      : null;

    return `
      <h4>Local Storage Status</h4>
      <div class="storage-status">
        <span class="storage-indicator ${storageAvailable ? 'active' : 'inactive'}"></span>
        <span>${storageAvailable ? 'Storage Available' : 'Storage Unavailable'}</span>
      </div>
      ${lastUpdate ? `<p>Last Updated: ${new Date(lastUpdate).toLocaleString()}</p>` : ''}
      <div class="data-persistence">
        <h4>Data Persistence</h4>
        <div class="persistence-controls">
          <button class="persistence-btn backup" onclick="project.backupData()">Backup Data</button>
          <button class="persistence-btn clear" onclick="project.clearStorageData()">Clear Data</button>
        </div>
      </div>
    `;
  }

  isStorageAvailable() {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch(e) {
      return false;
    }
  }

  showStorageStatus() {
    const storageUsage = this.calculateStorageUsage();
    this.displayMessage(`
      <div class="storage-info">
        <h3>Local Storage Status</h3>
        <div class="storage-details">
          <p>Storage Available: ${this.isStorageAvailable() ? 'Yes' : 'No'}</p>
          <p>Used Space: ${storageUsage.used}KB</p>
          <p>Available Space: ${storageUsage.available}KB</p>
          <p>Usage: ${storageUsage.percentage}%</p>
        </div>
        <div class="storage-data">
          <h4>Stored Data:</h4>
          <ul>
            ${this.getStoredDataList()}
          </ul>
        </div>
      </div>
    `);
  }

  calculateStorageUsage() {
    const total = 5 * 1024; // 5MB in KB
    let used = 0;
    
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length * 2 / 1024; // Convert to KB
      }
    }

    return {
      used: used.toFixed(2),
      available: (total - used).toFixed(2),
      percentage: ((used / total) * 100).toFixed(1)
    };
  }

  getStoredDataList() {
    let list = '';
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        list += `<li>${key}: ${(localStorage[key].length * 2 / 1024).toFixed(2)}KB</li>`;
      }
    }
    return list;
  }

  backupData() {
    const backup = {
      timestamps: JSON.parse(localStorage.getItem('versionTimestamps')),
      versionControl: JSON.parse(localStorage.getItem('versionControlData')),
      preferences: JSON.parse(localStorage.getItem('userPreferences')),
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `version-control-backup-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showToast('Backup created successfully');
  }

  clearStorageData() {
    if (confirm('Are you sure you want to clear all stored data? This action cannot be undone.')) {
      localStorage.clear();
      this.initializeLocalStorage();
      this.showToast('Storage data cleared');
      location.reload();
    }
  }

  restoreData(backupData) {
    try {
      const data = JSON.parse(backupData);
      localStorage.setItem('versionTimestamps', JSON.stringify(data.timestamps));
      localStorage.setItem('versionControlData', JSON.stringify(data.versionControl));
      localStorage.setItem('userPreferences', JSON.stringify(data.preferences));
      this.showToast('Data restored successfully');
      location.reload();
    } catch (e) {
      this.showToast('Error restoring data', 'error');
    }
  }

  showHelp() {
    super.showHelp();
    const display = document.getElementById('version-display');
    display.innerHTML += `
      <h4>Storage Commands</h4>
      <ul>
        <li>!storage - Show storage status and usage</li>
        <li>!backup - Create a backup of all stored data</li>
        <li>!clear - Clear all stored data</li>
        <li>!restore [data] - Restore from backup data</li>
      </ul>
    `;
  }
}