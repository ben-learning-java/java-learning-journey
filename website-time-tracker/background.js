// Background service worker for tracking time spent on websites

let currentTabId = null;
let currentWebsite = null;
let startTime = null;

// Initialize storage on install
chrome.runtime.onInstalled.addListener(async () => {
  const result = await chrome.storage.local.get(['websiteStats', 'totalTime']);

  if (!result.websiteStats) {
    await chrome.storage.local.set({ websiteStats: {} });
  }

  if (!result.totalTime) {
    await chrome.storage.local.set({ totalTime: 0 });
  }

  // Create an alarm to save data every minute
  chrome.alarms.create('saveTimeAlarm', { periodInMinutes: 1 });
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
    // Browser lost focus - save current session
    await saveCurrentSession();
    currentTabId = null;
    currentWebsite = null;
    startTime = null;
  } else {
    // Browser gained focus - start tracking active tab
    const [tab] = await chrome.tabs.query({ active: true, windowId: windowId });
    if (tab) {
      startTracking(tab);
    }
  }
});

// Start tracking a tab
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

    console.log('Started tracking:', currentWebsite);
  } catch (error) {
    console.error('Error parsing URL:', error);
  }
}

// Save current session time
async function saveCurrentSession() {
  if (!currentWebsite || !startTime) return;

  const endTime = Date.now();
  const timeSpent = Math.floor((endTime - startTime) / 1000); // in seconds

  if (timeSpent < 1) return; // Ignore very short visits

  console.log(`Saving ${timeSpent} seconds for ${currentWebsite}`);

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

  console.log('Session saved successfully');
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
