// Popup script for Website Time Tracker

let websiteStats = {};
let totalTime = 0;
let currentSort = 'time';
let searchQuery = '';

// Initialize popup
async function initialize() {
  // Load stats from background
  chrome.runtime.sendMessage({ action: 'getStats' }, (response) => {
    if (response) {
      websiteStats = response.websiteStats || {};
      totalTime = response.totalTime || 0;

      updateUI();
    }
  });
}

// Update the UI
function updateUI() {
  updateTotalTime();
  updateWebsitesList();
}

// Update total time display
function updateTotalTime() {
  const totalTimeElement = document.getElementById('totalTime');
  totalTimeElement.textContent = formatTime(totalTime);
}

// Format seconds to readable time
function formatTime(seconds) {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
}

// Update websites list
function updateWebsitesList() {
  const listElement = document.getElementById('websitesList');

  // Filter websites by search query
  let websites = Object.keys(websiteStats);

  if (searchQuery) {
    websites = websites.filter(site =>
      site.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Sort websites
  websites.sort((a, b) => {
    const statsA = websiteStats[a];
    const statsB = websiteStats[b];

    switch (currentSort) {
      case 'time':
        return statsB.totalTime - statsA.totalTime;
      case 'visits':
        return statsB.visits - statsA.visits;
      case 'recent':
        return statsB.lastVisit - statsA.lastVisit;
      case 'alphabetical':
        return a.localeCompare(b);
      default:
        return statsB.totalTime - statsA.totalTime;
    }
  });

  // Clear list
  listElement.innerHTML = '';

  // Show empty state if no websites
  if (websites.length === 0) {
    listElement.innerHTML = `
      <div class="empty-state">
        <p>${searchQuery ? 'No websites found' : 'No data yet. Start browsing to track your time!'}</p>
      </div>
    `;
    return;
  }

  // Find max time for progress bar calculation
  const maxTime = Math.max(...websites.map(site => websiteStats[site].totalTime));

  // Create website items
  websites.forEach(website => {
    const stats = websiteStats[website];
    const percentage = maxTime > 0 ? (stats.totalTime / maxTime) * 100 : 0;

    const item = document.createElement('div');
    item.className = 'website-item';
    item.innerHTML = `
      <div class="website-header">
        <span class="website-name" title="${website}">${website}</span>
        <span class="website-time">${formatTime(stats.totalTime)}</span>
      </div>
      <div class="website-details">
        <span class="website-visits">
          <span>📊 ${stats.visits} visits</span>
        </span>
        <div class="website-actions">
          <button class="btn-delete" data-website="${website}">Delete</button>
        </div>
      </div>
      <div class="time-bar">
        <div class="time-bar-fill" style="width: ${percentage}%"></div>
      </div>
    `;

    listElement.appendChild(item);
  });

  // Add delete button listeners
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteWebsite(btn.dataset.website);
    });
  });
}

// Delete a website's data
function deleteWebsite(website) {
  if (confirm(`Delete all data for ${website}?`)) {
    chrome.runtime.sendMessage(
      { action: 'deleteWebsite', website: website },
      (response) => {
        if (response && response.success) {
          delete websiteStats[website];
          updateUI();
        }
      }
    );
  }
}

// Reset all stats
function resetAllStats() {
  if (confirm('Reset all time tracking data? This cannot be undone.')) {
    chrome.runtime.sendMessage({ action: 'resetStats' }, (response) => {
      if (response && response.success) {
        websiteStats = {};
        totalTime = 0;
        updateUI();
      }
    });
  }
}

// Export data as CSV
function exportData() {
  let csv = 'Website,Total Time (seconds),Visits,Last Visit\n';

  Object.keys(websiteStats).forEach(website => {
    const stats = websiteStats[website];
    const lastVisit = new Date(stats.lastVisit).toISOString();
    csv += `"${website}",${stats.totalTime},${stats.visits},"${lastVisit}"\n`;
  });

  // Add total row
  csv += `\nTotal,${totalTime},-,-\n`;

  // Create download link
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `website-time-tracker-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Event listeners
document.getElementById('sortBy').addEventListener('change', (e) => {
  currentSort = e.target.value;
  updateUI();
});

document.getElementById('searchInput').addEventListener('input', (e) => {
  searchQuery = e.target.value;
  updateUI();
});

document.getElementById('resetBtn').addEventListener('click', resetAllStats);
document.getElementById('exportBtn').addEventListener('click', exportData);

// Initialize on load
initialize();

// Refresh data every 5 seconds while popup is open (optimized with lazy loading)
let refreshInterval = setInterval(initialize, 5000);

// Clean up interval when popup closes (reduces memory usage)
window.addEventListener('unload', () => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
});
