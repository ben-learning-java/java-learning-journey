// Function to ensure content script is loaded
async function ensureContentScript(tabId) {
  try {
    // Try to ping the content script
    await chrome.tabs.sendMessage(tabId, { action: 'ping' });
    return true;
  } catch (error) {
    // Content script not loaded, inject it
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

// Handle the zoom button click
document.addEventListener('DOMContentLoaded', () => {
  const zoomButton = document.getElementById('zoomButton');
  const statusText = document.getElementById('status');
  const zoomSlider = document.getElementById('zoomSlider');
  const zoomValue = document.getElementById('zoomValue');

  // Load saved zoom level
  chrome.storage.local.get(['zoomLevel'], (result) => {
    const savedZoom = result.zoomLevel || 2;
    zoomSlider.value = savedZoom;
    zoomValue.textContent = savedZoom.toFixed(1) + 'x';
  });

  // Update zoom level display when slider changes
  zoomSlider.addEventListener('input', (e) => {
    const level = parseFloat(e.target.value);
    zoomValue.textContent = level.toFixed(1) + 'x';

    // Save zoom level
    chrome.storage.local.set({ zoomLevel: level });
  });

  zoomButton.addEventListener('click', async () => {
    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Ensure content script is loaded
      const scriptReady = await ensureContentScript(tab.id);

      if (!scriptReady) {
        statusText.textContent = 'Error: Cannot run on this page';
        statusText.style.color = '#ff6b6b';
        return;
      }

      // Get current zoom level from slider
      const zoomLevel = parseFloat(zoomSlider.value);

      // Send message to content script to zoom to cursor
      chrome.tabs.sendMessage(tab.id, { action: 'zoomToCursor', zoomLevel: zoomLevel }, (response) => {
        if (chrome.runtime.lastError) {
          statusText.textContent = 'Error: Please try again';
          statusText.style.color = '#ff6b6b';
          return;
        }

        if (response && response.success) {
          statusText.textContent = 'Zoomed at ' + zoomLevel.toFixed(1) + 'x';
          statusText.style.color = '#90ee90';

          // Reset status after 2 seconds
          setTimeout(() => {
            statusText.textContent = '';
          }, 2000);
        }
      });
    } catch (error) {
      statusText.textContent = 'Error: ' + error.message;
      statusText.style.color = '#ff6b6b';
    }
  });
});
