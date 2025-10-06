// Function to inject content script if needed
async function ensureContentScript(tabId) {
  try {
    // Try to ping the content script
    await chrome.tabs.sendMessage(tabId, { action: 'ping' });
    return true;
  } catch (error) {
    // Content script not loaded, inject it
    console.log('Content script not found, injecting...');
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      });
      // Wait a bit for the script to initialize
      await new Promise(resolve => setTimeout(resolve, 100));
      return true;
    } catch (injectError) {
      console.error('Failed to inject content script:', injectError);
      return false;
    }
  }
}

// Listen for keyboard shortcut commands
chrome.commands.onCommand.addListener(async (command) => {
  console.log('Command received:', command);

  if (command === 'zoom-to-cursor') {
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      console.log('Active tabs:', tabs);

      if (tabs[0]) {
        const tabId = tabs[0].id;
        console.log('Processing tab:', tabId);

        // Ensure content script is loaded
        const scriptReady = await ensureContentScript(tabId);

        if (!scriptReady) {
          console.error('Cannot inject content script on this page');
          return;
        }

        console.log('Sending message to tab:', tabId);

        // Send message to content script to zoom to cursor
        chrome.tabs.sendMessage(tabId, {
          action: 'zoomToCursor',
          zoomLevel: 2
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.log('Error:', chrome.runtime.lastError.message);
          } else {
            console.log('Response from content script:', response);
          }
        });
      }
    });
  }
});
