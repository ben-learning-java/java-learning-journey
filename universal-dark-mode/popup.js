// Popup script for Universal Dark Mode

let currentHostname = '';
let enabledSites = {};
let globalEnabled = false;
let currentScheme = 'classic';

// Initialize popup
async function initialize() {
  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab && tab.url) {
    const url = new URL(tab.url);
    currentHostname = url.hostname;

    // Display current site
    document.getElementById('currentSite').innerHTML = `Current site: <strong>${currentHostname}</strong>`;
  }

  // Load saved settings
  const result = await chrome.storage.local.get(['enabledSites', 'globalEnabled', 'colorScheme']);
  enabledSites = result.enabledSites || {};
  globalEnabled = result.globalEnabled || false;
  currentScheme = result.colorScheme || 'classic';

  // Update UI
  updateUI();
}

// Update UI based on current state
function updateUI() {
  // Update site toggle
  const siteToggle = document.getElementById('siteToggle');
  const isSiteEnabled = enabledSites[currentHostname] !== undefined ? enabledSites[currentHostname] : globalEnabled;
  siteToggle.checked = isSiteEnabled;

  // Update global toggle
  const globalToggle = document.getElementById('globalToggle');
  globalToggle.checked = globalEnabled;

  // Update active color scheme
  document.querySelectorAll('.scheme-option').forEach(option => {
    option.classList.remove('active');
    if (option.dataset.scheme === currentScheme) {
      option.classList.add('active');
    }
  });
}

// Toggle dark mode for current site
async function toggleSite(enabled) {
  enabledSites[currentHostname] = enabled;

  await chrome.storage.local.set({ enabledSites });

  // Send message to content script
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'toggleDarkMode',
      enabled: enabled,
      scheme: currentScheme
    }).catch(err => {
      // Tab might not be ready, reload it
      chrome.tabs.reload(tab.id);
    });
  }

  updateUI();
}

// Toggle global dark mode
async function toggleGlobal(enabled) {
  globalEnabled = enabled;

  await chrome.storage.local.set({ globalEnabled });

  // If site doesn't have specific setting, apply global setting
  if (enabledSites[currentHostname] === undefined) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'toggleDarkMode',
        enabled: enabled,
        scheme: currentScheme
      }).catch(err => {
        chrome.tabs.reload(tab.id);
      });
    }
  }

  updateUI();
}

// Change color scheme
async function changeScheme(scheme) {
  currentScheme = scheme;

  await chrome.storage.local.set({ colorScheme: scheme });

  // Apply to current tab if dark mode is enabled
  const isSiteEnabled = enabledSites[currentHostname] !== undefined ? enabledSites[currentHostname] : globalEnabled;

  if (isSiteEnabled) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'changeScheme',
        scheme: scheme
      }).catch(err => {
        chrome.tabs.reload(tab.id);
      });
    }
  }

  updateUI();
}

// Reset all settings
async function resetSettings() {
  if (confirm('Are you sure you want to reset all settings? This will disable dark mode on all sites.')) {
    await chrome.storage.local.clear();

    enabledSites = {};
    globalEnabled = false;
    currentScheme = 'classic';

    // Reload current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.reload(tab.id);
    }

    updateUI();
  }
}

// Event listeners
document.getElementById('siteToggle').addEventListener('change', (e) => {
  toggleSite(e.target.checked);
});

document.getElementById('globalToggle').addEventListener('change', (e) => {
  toggleGlobal(e.target.checked);
});

document.querySelectorAll('.scheme-option').forEach(option => {
  option.addEventListener('click', () => {
    changeScheme(option.dataset.scheme);
  });
});

document.getElementById('resetBtn').addEventListener('click', resetSettings);

// Initialize on load
initialize();
