// Main implementation for version 1
class ProjectV1 {
  constructor() {
    this.version = 'v1';
    this.versionControl = new VersionControl();
  }

  initialize() {
    console.log(`Initializing Project Version: ${this.version}`);
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.getElementById('version-info').addEventListener('click', () => {
      this.displayVersionInfo();
    });
  }

  displayVersionInfo() {
    const versionInfo = this.versionControl.getVersionInfo(this.version);
    const infoDisplay = document.getElementById('version-display');
    infoDisplay.innerHTML = `
      <h3>Version: ${this.version}</h3>
      <p>Alias: ${versionInfo.alias}</p>
      <p>Created: ${versionInfo.timestamp.toLocaleString()}</p>
      <p>Description: ${versionInfo.description}</p>
    `;
  }
}