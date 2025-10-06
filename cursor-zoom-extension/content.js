// Track the cursor position globally
let cursorPosition = { x: 0, y: 0 };
let lastZoomTime = 0;
let isZoomed = false; // Track if bubble is visible
let initialZoomPosition = null; // Store the initial zoom position
let lastMouseMoveTime = 0; // Track when mouse last moved
const DOUBLE_TAP_DELAY = 400; // milliseconds
const bubbleSize = 350;

// Update cursor position whenever mouse moves
document.addEventListener('mousemove', (e) => {
  cursorPosition.x = e.clientX;
  cursorPosition.y = e.clientY;
  lastMouseMoveTime = Date.now();

  // If bubble is active, update its position to follow cursor
  if (isZoomed) {
    updateBubblePosition(e.clientX, e.clientY);
  }
}, { passive: true });

// Listen for messages from the popup and background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received message:', request);

  if (request.action === 'ping') {
    // Just respond to confirm script is loaded
    sendResponse({ ready: true });
  } else if (request.action === 'getCursorPosition') {
    console.log('Returning cursor position:', cursorPosition);
    sendResponse({ position: cursorPosition });
  } else if (request.action === 'zoomToCursor') {
    console.log('Zooming to cursor:', cursorPosition);
    const wasZoomed = isZoomed;
    zoomToPosition(cursorPosition.x, cursorPosition.y, request.zoomLevel);

    // Show status notification after zoom
    if (!wasZoomed) {
      showStatusNotification('Zoomed at ' + request.zoomLevel.toFixed(1) + 'x');
    }

    sendResponse({ success: true });
  }
  return true;
});

// Function to toggle magnifying bubble at cursor position
function zoomToPosition(x, y, requestedZoomLevel = 2) {
  console.log('Toggling magnifying bubble at cursor:', cursorPosition, 'with zoom level:', requestedZoomLevel);

  const now = Date.now();
  const timeSinceLastZoom = now - lastZoomTime;

  // Check if this is a double-tap OR if already zoomed
  if ((timeSinceLastZoom < DOUBLE_TAP_DELAY && isZoomed) || isZoomed) {
    // Remove bubble
    console.log('Removing bubble');
    isZoomed = false;
    initialZoomPosition = null;
    removeMagnifyingBubble();
    createCursorIndicator(x, y, 'OUT');
  } else {
    // Create bubble at requested zoom level
    console.log('Creating bubble at ' + requestedZoomLevel + 'x zoom');
    isZoomed = true;

    // Save the initial position
    initialZoomPosition = {
      absoluteX: window.scrollX + x,
      absoluteY: window.scrollY + y,
      cursorX: x,
      cursorY: y
    };

    // Create the magnifying bubble at requested zoom level
    createMagnifyingBubble(x, y, requestedZoomLevel);

    // Show indicator with zoom level
    createCursorIndicator(x, y, requestedZoomLevel.toFixed(1) + 'x');
  }

  // Update last zoom time
  lastZoomTime = now;
}

// Create magnifying bubble - zoom the REAL page with a mask
function createMagnifyingBubble(x, y, magnification) {
  // Remove existing bubble if any
  removeMagnifyingBubble();

  // Calculate absolute position on page (accounting for scroll)
  const absoluteX = window.scrollX + x;
  const absoluteY = window.scrollY + y;

  // Create a container that won't be affected by body transform
  const container = document.createElement('div');
  container.id = 'magnifying-container';
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    pointer-events: none;
    z-index: 9999997;
  `;

  // Create a dark overlay that covers everything EXCEPT the bubble
  const overlay = document.createElement('div');
  overlay.id = 'magnifying-overlay';
  overlay.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    background: radial-gradient(
      circle ${bubbleSize/2}px at ${x}px ${y}px,
      transparent 0%,
      transparent ${bubbleSize/2}px,
      rgba(0, 0, 0, 0.85) ${bubbleSize/2}px
    );
  `;
  container.appendChild(overlay);

  // Create the bubble border
  const bubbleBorder = document.createElement('div');
  bubbleBorder.id = 'magnifying-bubble';
  bubbleBorder.style.cssText = `
    position: absolute;
    left: ${x}px;
    top: ${y}px;
    width: ${bubbleSize}px;
    height: ${bubbleSize}px;
    border: 4px solid #e0e0e0;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    box-shadow:
      0 0 0 2px #2a2a2a,
      0 0 30px rgba(224, 224, 224, 0.4),
      0 0 60px rgba(224, 224, 224, 0.2);
  `;
  container.appendChild(bubbleBorder);

  // Append container to documentElement (not body)
  document.documentElement.appendChild(container);

  // Zoom the body
  document.body.style.transformOrigin = `${absoluteX}px ${absoluteY}px`;
  document.body.style.transform = `scale(${magnification})`;

  console.log('Magnifying bubble created - zoom origin:', absoluteX, absoluteY);
}

// Update bubble position as mouse moves
function updateBubblePosition(x, y) {
  const bubble = document.getElementById('magnifying-bubble');
  const overlay = document.getElementById('magnifying-overlay');

  if (bubble && overlay) {
    // Update bubble border position
    bubble.style.left = `${x}px`;
    bubble.style.top = `${y}px`;

    // Update overlay gradient to follow cursor
    overlay.style.background = `radial-gradient(
      circle ${bubbleSize/2}px at ${x}px ${y}px,
      transparent 0%,
      transparent ${bubbleSize/2}px,
      rgba(0, 0, 0, 0.85) ${bubbleSize/2}px
    )`;

    // Update zoom transform origin to follow cursor (absolute page position)
    const absoluteX = window.scrollX + x;
    const absoluteY = window.scrollY + y;
    document.body.style.transformOrigin = `${absoluteX}px ${absoluteY}px`;
  }
}

// Handle scroll - keep bubble and zoom updated
window.addEventListener('scroll', () => {
  if (isZoomed) {
    // Check if bubble still exists, recreate if missing
    const bubble = document.getElementById('magnifying-bubble');
    const overlay = document.getElementById('magnifying-overlay');

    if (!bubble || !overlay) {
      console.log('Bubble missing during scroll, recreating...');
      createMagnifyingBubble(cursorPosition.x, cursorPosition.y, 2);
    } else {
      // Update bubble to current cursor position
      updateBubblePosition(cursorPosition.x, cursorPosition.y);
    }
  }
}, { passive: true });

// Remove the magnifying bubble
function removeMagnifyingBubble() {
  const container = document.getElementById('magnifying-container');
  if (container) {
    container.remove();
  }
  const bubble = document.getElementById('magnifying-bubble');
  if (bubble) {
    bubble.remove();
  }
  const overlay = document.getElementById('magnifying-overlay');
  if (overlay) {
    overlay.remove();
  }
  const zoomLayer = document.getElementById('magnifying-zoom-layer');
  if (zoomLayer) {
    zoomLayer.remove();
  }

  // Reset the page zoom
  document.body.style.transform = '';
  document.body.style.transformOrigin = '';
}

// Create a visual indicator at the cursor position
function createCursorIndicator(x, y, text = '') {
  // Remove existing indicator
  const existingIndicator = document.getElementById('cursor-zoom-indicator');
  if (existingIndicator) {
    existingIndicator.remove();
  }

  // Create new indicator
  const indicator = document.createElement('div');
  indicator.id = 'cursor-zoom-indicator';
  indicator.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    width: 60px;
    height: 60px;
    border: 3px solid #e0e0e0;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 9999999;
    animation: cursorPulse 1s ease-out;
    box-shadow: 0 0 20px rgba(224, 224, 224, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(42, 42, 42, 0.95);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: #e0e0e0;
  `;

  // Add text if provided
  if (text) {
    indicator.textContent = text;
  }

  // Add animation
  if (!document.getElementById('cursor-zoom-style')) {
    const style = document.createElement('style');
    style.id = 'cursor-zoom-style';
    style.textContent = `
      @keyframes cursorPulse {
        0% {
          transform: translate(-50%, -50%) scale(0.5);
          opacity: 1;
        }
        50% {
          transform: translate(-50%, -50%) scale(1.2);
          opacity: 0.9;
        }
        100% {
          transform: translate(-50%, -50%) scale(1);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(indicator);

  // Remove indicator after animation
  setTimeout(() => {
    indicator.remove();
  }, 1000);
}

// Show status notification at top right corner
function showStatusNotification(message) {
  // Remove existing notification
  const existingNotification = document.getElementById('cursor-zoom-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification
  const notification = document.createElement('div');
  notification.id = 'cursor-zoom-notification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background: rgba(42, 42, 42, 0.95);
    color: #90ee90;
    border: 1px solid #4a4a4a;
    border-radius: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    z-index: 9999999;
    animation: slideIn 0.3s ease-out;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  `;
  notification.textContent = message;

  // Add animation
  if (!document.getElementById('cursor-zoom-notification-style')) {
    const style = document.createElement('style');
    style.id = 'cursor-zoom-notification-style';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(notification);

  // Remove notification after 2 seconds
  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 2000);
}
