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

  zoomButton.addEventListener('click', async () => {
    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      // Ensure content script is loaded
      const scriptReady = await ensureContentScript(tab.id);

      if (!scriptReady) {
        statusText.textContent = 'Error: Cannot run on this page';
        statusText.style.color = '#f44336';
        return;
      }

      // Send message to content script to zoom to cursor
      chrome.tabs.sendMessage(tab.id, { action: 'zoomToCursor', zoomLevel: 2 }, (response) => {
        if (chrome.runtime.lastError) {
          statusText.textContent = 'Error: Please try again';
          statusText.style.color = '#f44336';
          return;
        }

        if (response && response.success) {
          statusText.textContent = 'Zoomed!';
          statusText.style.color = '#17408b';

          // Reset status after 2 seconds
          setTimeout(() => {
            statusText.textContent = '';
          }, 2000);
        }
      });
    } catch (error) {
      statusText.textContent = 'Error: ' + error.message;
      statusText.style.color = '#f44336';
    }
  });

  // Display current cursor position (optional feature)
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getCursorPosition' }, (response) => {
        if (chrome.runtime.lastError) {
          // Silently ignore errors on pages where extension can't run
          return;
        }
        if (response && response.position) {
          const positionDisplay = document.getElementById('position');
          if (positionDisplay) {
            positionDisplay.textContent = `X: ${response.position.x}, Y: ${response.position.y}`;
          }
        }
      });
    }
  });
});
