class ProjectV8 extends ProjectV7 {
  constructor() {
    super();
    this.version = 'v8';
    this.currentActiveVersion = 'v8';
  }

  initializeBranchData() {
    return {
      main: ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8'],
      experimental: ['v4', 'experimental-1', 'experimental-2'],
      hotfix: ['v5', 'hotfix-1'],
      feature: ['v6', 'feature-1', 'feature-2'],
      development: ['v8', 'dev-1', 'dev-2']
    };
  }

  initialize() {
    super.initialize();
  }

  setupBranchCommands() {
    const originalExecuteCommand = this.executeCommand.bind(this);
    this.executeCommand = () => {
      const commandInput = document.getElementById('command-input');
      const command = commandInput.value.trim();
      const args = command.split(' ');
      const cmd = args[0].toLowerCase();

      switch(cmd) {
        case '!branches':
          this.showBranches();
          break;
        case '!switch':
          if (args[1]) this.switchVersion(args[1]);
          break;
        case '!visual':
          this.showVisualBranches();
          break;
        default:
          originalExecuteCommand();
      }
    };
  }

  setupVersionSwitching() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('version-node')) {
        const version = e.target.dataset.version;
        if (version) {
          this.switchVersion(version);
        }
      }
    });
  }

  switchVersion(version) {
    const versionInfo = this.versionControl.getVersionInfo(version);
    if (versionInfo) {
      this.currentActiveVersion = version;
      this.displayMessage(`
        <div class="switch-notification">
          <h3>Switched to ${version}</h3>
          <p>Now running: ${versionInfo.description}</p>
          <div class="active-features">
            ${versionInfo.features.map(f => 
              `<span class="feature-tag">${f}</span>`
            ).join('')}
          </div>
        </div>
      `);
      this.updateBranchVisual();
    } else {
      this.displayMessage(`Version ${version} not found.`);
    }
  }

  showBranches() {
    let output = '<div class="branch-list">';
    for (const [branch, versions] of Object.entries(this.branchData)) {
      output += `
        <div class="branch-item">
          <h4>${branch}</h4>
          <div class="branch-versions">
            ${versions.map(v => 
              `<span class="version-tag ${v === this.currentActiveVersion ? 'active' : ''}">${v}</span>`
            ).join(' → ')}
          </div>
        </div>
      `;
    }
    output += '</div>';
    this.displayMessage(output);
  }

  showVisualBranches() {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    // Draw branch visualization
    this.drawBranches(ctx);
    
    const output = `
      <div class="visual-branch-container">
        <h3>Branch Visualization</h3>
        ${canvas.outerHTML}
        <div class="branch-legend">
          ${Object.keys(this.branchData).map(branch => 
            `<div class="legend-item">
              <span class="legend-color" style="background: ${this.getBranchColor(branch)}"></span>
              <span>${branch}</span>
            </div>`
          ).join('')}
        </div>
      </div>
    `;
    
    this.displayMessage(output);
  }

  drawBranches(ctx) {
    const yOffset = 50;
    const xStart = 50;
    let currentY = yOffset;

    for (const [branch, versions] of Object.entries(this.branchData)) {
      ctx.strokeStyle = this.getBranchColor(branch);
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      ctx.moveTo(xStart, currentY);
      
      versions.forEach((version, index) => {
        const x = xStart + (index * 100);
        ctx.lineTo(x, currentY);
        
        // Draw version node
        ctx.fillStyle = version === this.currentActiveVersion ? '#2ecc71' : '#3498db';
        ctx.beginPath();
        ctx.arc(x, currentY, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw version label
        ctx.fillStyle = '#2c3e50';
        ctx.font = '12px Arial';
        ctx.fillText(version, x - 15, currentY + 20);
      });
      
      ctx.stroke();
      currentY += 70;
    }
  }

  getBranchColor(branch) {
    const colors = {
      main: '#3498db',
      experimental: '#e74c3c',
      hotfix: '#f1c40f',
      development: '#9b59b6'
    };
    return colors[branch] || '#95a5a6';
  }

  updateBranchVisual() {
    // Update branch visual representation when switching versions
  }

  showToast(message, type = 'success') {
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    this.toastTimeout = setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  showLoading() {
    const loader = document.createElement('div');
    loader.className = 'loading-indicator';
    return loader;
  }

  async switchVersion(version) {
    const display = document.getElementById('version-display');
    display.appendChild(this.showLoading());
    
    // Simulate loading for smoother UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const versionInfo = this.versionControl.getVersionInfo(version);
    if (versionInfo) {
      this.currentActiveVersion = version;
      this.showToast(`Successfully switched to ${version}`);
      this.displayMessage(`
        <div class="switch-notification">
          <h3>Switched to ${version}</h3>
          <p>Now running: ${versionInfo.description}</p>
          <div class="active-features">
            ${versionInfo.features.map(f => 
              `<span class="feature-tag">${f}</span>`
            ).join('')}
          </div>
          <div class="version-metrics">
            <p>Total Features: ${versionInfo.features.length}</p>
            <p>Created: ${versionInfo.timestamp.toLocaleDateString()}</p>
          </div>
        </div>
      `);
    } else {
      this.showToast(`Version ${version} not found`, 'error');
    }
  }

  handleMerge(versions) {
    if (versions.length < 2) {
      this.showToast('Merge requires at least 2 versions', 'error');
      return;
    }

    const mergeResult = this.versionControl.mergeVersions(versions);
    if (mergeResult) {
      const mergeId = Date.now();
      this.mergeLogs.push({
        id: mergeId,
        versions: versions,
        timestamp: new Date(),
        features: this.getCombinedFeatures(versions),
        success: true
      });

      this.showToast(`Successfully merged ${versions.join(', ')}`);
      this.displayMergeResult(mergeId);
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch(e.key.toLowerCase()) {
          case 'b':
            e.preventDefault();
            this.executeCommandByShortcut('!branches');
            break;
          case 'd':
            e.preventDefault();
            this.executeCommandByShortcut('!detailed');
            break;
          case 'h':
            e.preventDefault();
            this.executeCommandByShortcut('!help');
            break;
        }
      }
    });
  }

  showHelp() {
    super.showHelp();
    const display = document.getElementById('version-display');
    display.innerHTML += `
      <h4>Keyboard Shortcuts</h4>
      <ul>
        <li>Ctrl/Cmd + B: Show branches</li>
        <li>Ctrl/Cmd + D: Show detailed view</li>
        <li>Ctrl/Cmd + H: Show help</li>
      </ul>
      <h4>Tips</h4>
      <ul>
        <li>Click on version nodes in the visualization to switch versions</li>
        <li>Hover over branch metrics for more details</li>
        <li>Use the command input for custom commands</li>
      </ul>
    `;
  }
}