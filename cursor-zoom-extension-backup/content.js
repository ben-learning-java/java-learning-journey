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
    zoomToPosition(cursorPosition.x, cursorPosition.y, request.zoomLevel);
    sendResponse({ success: true });
  }
  return true;
});

// Function to toggle magnifying bubble at cursor position
function zoomToPosition(x, y, requestedZoomLevel = 2) {
  console.log('Toggling magnifying bubble at cursor:', cursorPosition);

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
    // Create bubble at 2x zoom
    console.log('Creating 2x bubble');
    isZoomed = true;

    // Save the initial position
    initialZoomPosition = {
      absoluteX: window.scrollX + x,
      absoluteY: window.scrollY + y,
      cursorX: x,
      cursorY: y
    };

    // Create the magnifying bubble at 2x
    createMagnifyingBubble(x, y, 2);

    // Show indicator
    createCursorIndicator(x, y, '2x');
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
    border: 6px solid #c8102e;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    box-shadow:
      0 0 40px rgba(200, 16, 46, 1),
      0 0 80px rgba(200, 16, 46, 0.6);
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
    border: 3px solid #c8102e;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    pointer-events: none;
    z-index: 9999999;
    animation: cursorPulse 1s ease-out;
    box-shadow: 0 0 20px rgba(200, 16, 46, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(200, 16, 46, 0.9);
    font-family: Arial, sans-serif;
    font-size: 18px;
    font-weight: bold;
    color: white;
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
