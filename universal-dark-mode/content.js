// Content script that applies dark mode to the page

// Color schemes
const colorSchemes = {
  classic: {
    background: '#1a1a1a',
    text: '#e0e0e0',
    link: '#6db3f2',
    border: '#404040'
  },
  warm: {
    background: '#1c1510',
    text: '#e8d5c4',
    link: '#e8a87c',
    border: '#3d3229'
  },
  cool: {
    background: '#0d1117',
    text: '#c9d1d9',
    link: '#58a6ff',
    border: '#30363d'
  },
  oled: {
    background: '#000000',
    text: '#ffffff',
    link: '#5ea3ff',
    border: '#1a1a1a'
  }
};

let currentScheme = 'classic';
let darkModeEnabled = false;

// Check if dark mode should be enabled for this site
async function checkDarkModeStatus() {
  const hostname = window.location.hostname;

  try {
    const result = await chrome.storage.local.get(['enabledSites', 'colorScheme', 'globalEnabled']);
    const enabledSites = result.enabledSites || {};
    currentScheme = result.colorScheme || 'classic';
    const globalEnabled = result.globalEnabled !== undefined ? result.globalEnabled : false;

    // Check if this specific site has dark mode enabled
    darkModeEnabled = enabledSites[hostname] !== undefined ? enabledSites[hostname] : globalEnabled;

    if (darkModeEnabled) {
      applyDarkMode();
    } else {
      removeDarkMode();
    }
  } catch (error) {
    console.error('Error checking dark mode status:', error);
  }
}

// Apply dark mode styles
function applyDarkMode() {
  const scheme = colorSchemes[currentScheme];

  // Remove existing dark mode style if it exists
  const existingStyle = document.getElementById('universal-dark-mode-style');
  if (existingStyle) {
    existingStyle.remove();
  }

  // Create and inject dark mode CSS
  const style = document.createElement('style');
  style.id = 'universal-dark-mode-style';
  style.textContent = `
    /* Universal Dark Mode - Root overrides */
    html {
      background-color: ${scheme.background} !important;
      color: ${scheme.text} !important;
      filter: contrast(0.95) brightness(0.95);
    }

    body {
      background-color: ${scheme.background} !important;
      color: ${scheme.text} !important;
    }

    /* Exclude other extension elements */
    #magnifying-container,
    #magnifying-bubble,
    #magnifying-overlay,
    #cursor-zoom-indicator,
    #cursor-zoom-notification,
    #magnifying-zoom-layer {
      background-color: initial !important;
      color: initial !important;
      border-color: initial !important;
      filter: none !important;
    }

    /* Text elements */
    h1, h2, h3, h4, h5, h6, p, span, div, li, td, th, label, a {
      color: ${scheme.text} !important;
    }

    /* Links */
    a {
      color: ${scheme.link} !important;
    }

    a:visited {
      color: ${scheme.link} !important;
      opacity: 0.8;
    }

    /* Backgrounds */
    div:not(#magnifying-container):not(#magnifying-bubble):not(#magnifying-overlay):not(#cursor-zoom-indicator):not(#cursor-zoom-notification),
    section, article, aside, nav, header, footer, main {
      background-color: ${scheme.background} !important;
      border-color: ${scheme.border} !important;
    }

    /* Input elements */
    input, textarea, select, button {
      background-color: ${scheme.background} !important;
      color: ${scheme.text} !important;
      border-color: ${scheme.border} !important;
    }

    input::placeholder, textarea::placeholder {
      color: ${scheme.text} !important;
      opacity: 0.5;
    }

    /* Tables */
    table, tr, td, th {
      background-color: ${scheme.background} !important;
      color: ${scheme.text} !important;
      border-color: ${scheme.border} !important;
    }

    /* Cards and panels */
    .card, .panel, .box, .container {
      background-color: ${scheme.background} !important;
      color: ${scheme.text} !important;
      border-color: ${scheme.border} !important;
    }

    /* Images - invert but preserve photos */
    img:not([src*=".jpg"]):not([src*=".jpeg"]):not([src*=".png"]):not([src*=".gif"]) {
      filter: brightness(0.8) contrast(1.2);
    }

    /* Code blocks */
    pre, code {
      background-color: #0a0a0a !important;
      color: ${scheme.text} !important;
      border-color: ${scheme.border} !important;
    }

    /* Scrollbars (Webkit) */
    ::-webkit-scrollbar {
      background-color: ${scheme.background} !important;
    }

    ::-webkit-scrollbar-thumb {
      background-color: ${scheme.border} !important;
    }

    ::-webkit-scrollbar-thumb:hover {
      background-color: #606060 !important;
    }
  `;

  // Insert at the beginning of head or body
  const target = document.head || document.documentElement;
  target.insertBefore(style, target.firstChild);
}

// Remove dark mode styles
function removeDarkMode() {
  const existingStyle = document.getElementById('universal-dark-mode-style');
  if (existingStyle) {
    existingStyle.remove();
  }
}

// Listen for messages from popup/background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleDarkMode') {
    darkModeEnabled = message.enabled;
    currentScheme = message.scheme || currentScheme;

    if (darkModeEnabled) {
      applyDarkMode();
    } else {
      removeDarkMode();
    }

    sendResponse({ success: true });
  } else if (message.action === 'changeScheme') {
    currentScheme = message.scheme;
    if (darkModeEnabled) {
      applyDarkMode();
    }
    sendResponse({ success: true });
  }

  return true;
});

// Initialize on page load
checkDarkModeStatus();

// Re-check when navigating with pushState/replaceState
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    checkDarkModeStatus();
  }
}).observe(document, { subtree: true, childList: true });
