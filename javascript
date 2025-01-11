if (window.location.search.includes('version=')) {
  const urlParams = new URLSearchParams(window.location.search);
  const version = urlParams.get('version');
  const scripts = JSON.parse(urlParams.get('scripts') || '[]');
  
  // Load required scripts in order
  async function loadScripts() {
    for (const script of scripts) {
      await new Promise((resolve, reject) => {
        const scriptEl = document.createElement('script');
        scriptEl.src = script;
        scriptEl.onload = resolve;
        scriptEl.onerror = reject;
        document.body.appendChild(scriptEl);
      });
    }
    
    // Initialize version
    const versionNumber = parseInt(version.replace('v', ''));
    const VersionClass = window[`ProjectV${versionNumber}`];
    if (VersionClass) {
      window.project = new VersionClass();
      project.initialize();
    }
  }
  
  document.addEventListener('DOMContentLoaded', loadScripts);
}