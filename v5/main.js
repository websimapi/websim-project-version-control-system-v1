// Since there is no ProjectV4 provided, I will assume ProjectV5 extends ProjectV2.
// If ProjectV4 exists, you should replace ProjectV2 with ProjectV4.

class ProjectV5 extends ProjectV2 {
  constructor() {
    super();
    this.version = 'v5';
    this.mergeHistory = [];
  }

  initialize() {
    super.initialize();
    this.setupMergeHandling();
  }

  setupMergeHandling() {
    const originalExecuteCommand = this.executeCommand.bind(this);
    this.executeCommand = () => {
      const commandInput = document.getElementById('command-input');
      const command = commandInput.value.trim();
      const args = command.split(' ');
      const cmd = args[0].toLowerCase();

      if (cmd === '!merge') {
        const versions = args.slice(1);
        this.handleMerge(versions);
      } else {
        originalExecuteCommand();
      }
    };
  }

  handleMerge(versions) {
    if (versions.length < 2) {
      this.displayMessage('Merge requires at least 2 versions.');
      return;
    }

    const mergeResult = this.versionControl.mergeVersions(versions);
    if (mergeResult) {
      const mergeId = Date.now();
      this.mergeHistory.push({
        id: mergeId,
        versions: versions,
        timestamp: new Date(),
        features: this.combineFeaturesFromVersions(mergeResult)
      });

      this.displayMergeResult(mergeId);
    }
  }

  combineFeaturesFromVersions(versions) {
    const features = new Set();
    versions.forEach(version => {
      version.features.forEach(feature => features.add(feature));
    });
    return Array.from(features);
  }

  displayMergeResult(mergeId) {
    const merge = this.mergeHistory.find(m => m.id === mergeId);
    if (!merge) return;

    this.displayMessage(`
      <h3>Merge Complete</h3>
      <div class="merge-result">
        <p>Merged Versions: ${merge.versions.join(', ')}</p>
        <p>Timestamp: ${merge.timestamp.toLocaleString()}</p>
        <h4>Combined Features:</h4>
        <ul>
          ${merge.features.map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>
    `);
  }

  showHelp() {
    super.showHelp();
    const display = document.getElementById('version-display');
    const currentContent = display.innerHTML;
    display.innerHTML = currentContent + `
      <h4>Merge Commands</h4>
      <ul>
        <li>!merge [v1] [v2] ... - Merge multiple versions with smart conflict resolution</li>
      </ul>
    `;
  }
}