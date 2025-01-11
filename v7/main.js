class ProjectV7 extends ProjectV6 {
  constructor() {
    super();
    this.version = 'v7';
    this.currentActiveVersion = 'v7';
    this.branchData = this.initializeBranchData();
    this.mergeLogs = [];
    this.toastTimeout = null;
  }

  initializeBranchData() {
    return {
      main: ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7'],
      experimental: ['v4', 'experimental-1', 'experimental-2'],
      hotfix: ['v5', 'hotfix-1'],
      feature: ['v6', 'feature-1', 'feature-2']
    };
  }

  initialize() {
    super.initialize();
    this.setupKeyboardShortcuts();
    this.showToast('Version control system initialized');
    this.enhanceBranchVisualization();
    this.setupAdvancedMerging();
  }

  enhanceBranchVisualization() {
    const originalExecuteCommand = this.executeCommand.bind(this);
    this.executeCommand = () => {
      const commandInput = document.getElementById('command-input');
      const command = commandInput.value.trim();
      const args = command.split(' ');
      const cmd = args[0].toLowerCase();

      switch(cmd) {
        case '!detailed':
          this.showDetailedBranchView();
          break;
        case '!history':
          this.showMergeHistory();
          break;
        default:
          originalExecuteCommand();
      }
    };
  }

  setupAdvancedMerging() {
    this.versionControl.onMerge = (versions, result) => {
      this.mergeLogs.push({
        timestamp: new Date(),
        versions: versions,
        result: result,
        features: this.getCombinedFeatures(versions)
      });
    };
  }

  getCombinedFeatures(versions) {
    const features = new Set();
    versions.forEach(version => {
      const vInfo = this.versionControl.getVersionInfo(version);
      if (vInfo && vInfo.features) {
        vInfo.features.forEach(f => features.add(f));
      }
    });
    return Array.from(features);
  }

  showDetailedBranchView() {
    const container = document.createElement('div');
    container.className = 'detailed-branch-view';
    
    // Create canvas for branch visualization
    const canvas = document.createElement('canvas');
    canvas.width = 1000;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    this.drawEnhancedBranches(ctx);
    
    // Add interactive elements
    const controls = this.createBranchControls();
    
    container.innerHTML = `
      <h3>Detailed Branch Visualization</h3>
      <div class="branch-visualization">
        ${canvas.outerHTML}
        ${controls}
      </div>
      <div class="branch-metrics">
        ${this.generateBranchMetrics()}
      </div>
    `;
    
    this.displayMessage(container.outerHTML);
    this.setupBranchInteractions();
  }

  drawEnhancedBranches(ctx) {
    // Add grid lines
    ctx.strokeStyle = '#f0f2f5';
    ctx.lineWidth = 1;
    for (let i = 0; i < ctx.canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, ctx.canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < ctx.canvas.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(ctx.canvas.width, i);
      ctx.stroke();
    }

    const yOffset = 80;
    const xStart = 80;
    let currentY = yOffset;

    // Draw time scale
    this.drawTimeScale(ctx, xStart);

    for (const [branch, versions] of Object.entries(this.branchData)) {
      ctx.strokeStyle = this.getBranchColor(branch);
      ctx.lineWidth = 3;
      
      ctx.beginPath();
      ctx.moveTo(xStart, currentY);
      
      versions.forEach((version, index) => {
        const x = xStart + (index * 120);
        ctx.lineTo(x, currentY);
        
        // Draw version node with shadow
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        ctx.fillStyle = version === this.currentActiveVersion ? '#2ecc71' : '#3498db';
        ctx.beginPath();
        ctx.arc(x, currentY, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Draw version label
        ctx.fillStyle = '#2c3e50';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(version, x - 20, currentY + 25);
        
        // Draw feature count
        const vInfo = this.versionControl.getVersionInfo(version);
        if (vInfo && vInfo.features) {
          ctx.font = '12px Arial';
          ctx.fillText(`${vInfo.features.length} features`, x - 25, currentY + 40);
        }
      });
      
      ctx.stroke();
      currentY += 100;
    }
  }

  drawTimeScale(ctx, xStart) {
    const versions = this.versionControl.getAllVersions();
    versions.sort((a, b) => a.timestamp - b.timestamp);
    
    ctx.strokeStyle = '#95a5a6';
    ctx.fillStyle = '#7f8c8d';
    ctx.font = '12px Arial';
    
    versions.forEach((version, index) => {
      const x = xStart + (index * 120);
      ctx.beginPath();
      ctx.moveTo(x, 40);
      ctx.lineTo(x, 50);
      ctx.stroke();
      
      const date = version.timestamp.toLocaleDateString();
      ctx.fillText(date, x - 30, 30);
    });
  }

  createBranchControls() {
    return `
      <div class="branch-controls">
        <div class="branch-actions">
          ${Object.keys(this.branchData).map(branch => `
            <button class="branch-btn" data-branch="${branch}">
              ${branch.charAt(0).toUpperCase() + branch.slice(1)}
            </button>
          `).join('')}
        </div>
        <div class="branch-legend">
          ${Object.keys(this.branchData).map(branch => `
            <div class="legend-item">
              <span class="legend-color" style="background: ${this.getBranchColor(branch)}"></span>
              <span>${branch}</span>
              <span class="version-count">${this.branchData[branch].length} versions</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  generateBranchMetrics() {
    let metrics = '<div class="metrics-container">';
    
    for (const [branch, versions] of Object.entries(this.branchData)) {
      const featureCount = versions.reduce((count, version) => {
        const vInfo = this.versionControl.getVersionInfo(version);
        return count + (vInfo?.features?.length || 0);
      }, 0);
      
      metrics += `
        <div class="branch-metric">
          <h4>${branch}</h4>
          <div class="metric-details">
            <p>Versions: ${versions.length}</p>
            <p>Total Features: ${featureCount}</p>
            <p>Latest: ${versions[versions.length - 1]}</p>
          </div>
        </div>
      `;
    }
    
    metrics += '</div>';
    return metrics;
  }

  showMergeHistory() {
    let history = '<div class="merge-history">';
    history += '<h3>Merge History</h3>';
    
    this.mergeLogs.forEach(log => {
      history += `
        <div class="merge-entry">
          <div class="merge-header">
            <span class="merge-timestamp">${log.timestamp.toLocaleString()}</span>
            <span class="merge-versions">${log.versions.join(' + ')}</span>
          </div>
          <div class="merge-features">
            <h4>Combined Features:</h4>
            <div class="feature-tags">
              ${log.features.map(f => `<span class="feature-tag">${f}</span>`).join('')}
            </div>
          </div>
        </div>
      `;
    });
    
    history += '</div>';
    this.displayMessage(history);
  }

  setupBranchInteractions() {
    document.querySelectorAll('.branch-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const branch = e.target.dataset.branch;
        this.highlightBranch(branch);
      });
    });
  }

  highlightBranch(branch) {
    const versions = this.branchData[branch];
    this.displayMessage(`
      <div class="branch-detail">
        <h3>${branch} Branch Details</h3>
        <div class="version-timeline">
          ${versions.map(version => {
            const vInfo = this.versionControl.getVersionInfo(version);
            return `
              <div class="version-detail">
                <h4>${version}</h4>
                <p>${vInfo?.description || 'No description available'}</p>
                <div class="version-features">
                  ${vInfo?.features?.map(f => `<span class="feature-tag">${f}</span>`).join('') || ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `);
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