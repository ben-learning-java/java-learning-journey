// Background service worker for tracking time spent on websites

let currentTabId = null;
let currentWebsite = null;
let startTime = null;
let isSaving = false; // Prevent concurrent saves

// Initialize storage on install
chrome.runtime.onInstalled.addListener(async () => {
  const result = await chrome.storage.local.get(['websiteStats', 'totalTime']);

  if (!result.websiteStats) {
    await chrome.storage.local.set({ websiteStats: {} });
  }

  if (!result.totalTime) {
    await chrome.storage.local.set({ totalTime: 0 });
  }

  // Create an alarm to save data every 2 minutes (reduced frequency)
  chrome.alarms.create('saveTimeAlarm', { periodInMinutes: 2 });
});

// Listen for alarms
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'saveTimeAlarm') {
    saveCurrentSession();
  }
});

// Track when user switches tabs
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  // Save time for previous tab
  await saveCurrentSession();

  // Get new tab info
  const tab = await chrome.tabs.get(activeInfo.tabId);
  startTracking(tab);
});

// Track when tab URL changes
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only track when URL changes and it's the active tab
  if (changeInfo.url && tab.active) {
    await saveCurrentSession();
    startTracking(tab);
  }
});

// Track when window focus changes
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Browser lost focus - keep tracking (don't stop)
    // Just save the current session but continue tracking
    await saveCurrentSession();
    // Restart tracking with the same website
    if (currentWebsite) {
      startTime = Date.now();
    }
  } else {
    // Browser gained focus - check if we need to switch to a different tab
    const [tab] = await chrome.tabs.query({ active: true, windowId: windowId });
    if (tab && tab.url) {
      const url = new URL(tab.url);
      const hostname = url.hostname;

      // Only restart tracking if we're on a different website
      if (hostname !== currentWebsite) {
        await saveCurrentSession();
        startTracking(tab);
      }
    }
  }
});

// Start tracking a tab (optimized - less logging)
function startTracking(tab) {
  if (!tab || !tab.url) return;

  try {
    const url = new URL(tab.url);

    // Ignore chrome:// and extension pages
    if (url.protocol === 'chrome:' || url.protocol === 'chrome-extension:') {
      return;
    }

    currentTabId = tab.id;
    currentWebsite = url.hostname;
    startTime = Date.now();
  } catch (error) {
    // Silent fail - reduce console usage
  }
}

// Save current session time (optimized to prevent concurrent saves)
async function saveCurrentSession() {
  if (!currentWebsite || !startTime || isSaving) return;

  const endTime = Date.now();
  const timeSpent = Math.floor((endTime - startTime) / 1000); // in seconds

  if (timeSpent < 1) return; // Ignore very short visits

  isSaving = true; // Lock to prevent concurrent saves

  try {
    // Get current stats
    const result = await chrome.storage.local.get(['websiteStats', 'totalTime']);
    const websiteStats = result.websiteStats || {};
    const totalTime = result.totalTime || 0;

    // Update website stats
    if (!websiteStats[currentWebsite]) {
      websiteStats[currentWebsite] = {
        totalTime: 0,
        visits: 0,
        lastVisit: Date.now()
      };
    }

    websiteStats[currentWebsite].totalTime += timeSpent;
    websiteStats[currentWebsite].visits += 1;
    websiteStats[currentWebsite].lastVisit = Date.now();

    // Update total time
    const newTotalTime = totalTime + timeSpent;

    // Save to storage
    await chrome.storage.local.set({
      websiteStats: websiteStats,
      totalTime: newTotalTime
    });
  } catch (error) {
    console.error('Error saving session:', error);
  } finally {
    isSaving = false; // Unlock
  }
}

// Handle extension icon click
chrome.action.onClicked.addListener(() => {
  // Save current session when popup opens
  saveCurrentSession();
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStats') {
    chrome.storage.local.get(['websiteStats', 'totalTime']).then((result) => {
      sendResponse({
        websiteStats: result.websiteStats || {},
        totalTime: result.totalTime || 0
      });
    });
    return true;
  } else if (request.action === 'resetStats') {
    chrome.storage.local.set({
      websiteStats: {},
      totalTime: 0
    }).then(() => {
      // Reset current tracking
      currentTabId = null;
      currentWebsite = null;
      startTime = null;
      sendResponse({ success: true });
    });
    return true;
  } else if (request.action === 'deleteWebsite') {
    chrome.storage.local.get(['websiteStats', 'totalTime']).then((result) => {
      const websiteStats = result.websiteStats || {};
      const totalTime = result.totalTime || 0;
      const website = request.website;

      if (websiteStats[website]) {
        const timeToSubtract = websiteStats[website].totalTime;
        delete websiteStats[website];

        chrome.storage.local.set({
          websiteStats: websiteStats,
          totalTime: Math.max(0, totalTime - timeToSubtract)
        }).then(() => {
          sendResponse({ success: true });
        });
      } else {
        sendResponse({ success: false });
      }
    });
    return true;
  }
});

// Initialize tracking when service worker starts
chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
  if (tabs[0]) {
    startTracking(tabs[0]);
  }
});
