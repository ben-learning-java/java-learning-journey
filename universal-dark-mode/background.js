// Background service worker for Universal Dark Mode

// Initialize default settings on install
chrome.runtime.onInstalled.addListener(async () => {
  const result = await chrome.storage.local.get(['colorScheme', 'globalEnabled', 'enabledSites']);

  // Set defaults if not already set
  if (!result.colorScheme) {
    await chrome.storage.local.set({ colorScheme: 'classic' });
  }

  if (result.globalEnabled === undefined) {
    await chrome.storage.local.set({ globalEnabled: false });
  }

  if (!result.enabledSites) {
    await chrome.storage.local.set({ enabledSites: {} });
  }
});

// Listen for tab updates to reapply dark mode if needed
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only proceed when page is fully loaded
  if (changeInfo.status === 'complete' && tab.url) {
    try {
      const url = new URL(tab.url);
      const hostname = url.hostname;

      // Get settings
      const result = await chrome.storage.local.get(['enabledSites', 'globalEnabled', 'colorScheme']);
      const enabledSites = result.enabledSites || {};
      const globalEnabled = result.globalEnabled || false;
      const colorScheme = result.colorScheme || 'classic';

      // Check if dark mode should be enabled
      const isDarkModeEnabled = enabledSites[hostname] !== undefined ? enabledSites[hostname] : globalEnabled;

      // Send message to content script
      if (isDarkModeEnabled) {
        chrome.tabs.sendMessage(tabId, {
          action: 'toggleDarkMode',
          enabled: true,
          scheme: colorScheme
        }).catch(err => {
          // Content script might not be ready yet, that's ok
          console.log('Could not send message to tab:', err);
        });
      }
    } catch (error) {
      // Invalid URL or other error, ignore
      console.log('Error processing tab update:', error);
    }
  }
});

// Handle keyboard shortcuts if needed (can be extended later)
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-dark-mode') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab && tab.url) {
      const url = new URL(tab.url);
      const hostname = url.hostname;

      const result = await chrome.storage.local.get(['enabledSites', 'globalEnabled', 'colorScheme']);
      const enabledSites = result.enabledSites || {};
      const globalEnabled = result.globalEnabled || false;
      const colorScheme = result.colorScheme || 'classic';

      // Toggle for current site
      const currentlyEnabled = enabledSites[hostname] !== undefined ? enabledSites[hostname] : globalEnabled;
      enabledSites[hostname] = !currentlyEnabled;

      await chrome.storage.local.set({ enabledSites });

      // Send message to content script
      chrome.tabs.sendMessage(tab.id, {
        action: 'toggleDarkMode',
        enabled: !currentlyEnabled,
        scheme: colorScheme
      }).catch(err => {
        chrome.tabs.reload(tab.id);
      });
    }
  }
});
