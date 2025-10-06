# ⏱️ Website Time Tracker

A clean Chrome extension that automatically tracks time spent on every website with detailed statistics and insights.

## Features

✨ **Automatic Tracking** - Tracks time spent on every website automatically
📊 **Detailed Statistics** - See total time, number of visits, and last visit for each site
🔍 **Search & Filter** - Search through your browsing history
📈 **Multiple Sort Options** - Sort by time, visits, recency, or alphabetically
💾 **Export Data** - Export your statistics to CSV for further analysis
🎯 **Visual Progress Bars** - See which sites take most of your time at a glance
🧹 **Easy Management** - Delete individual sites or reset all data
⚡ **Real-time Updates** - Stats update every second while popup is open
🎨 **Clean Design** - Modern, minimal white/grey design that's easy on the eyes

## How It Works

The extension automatically:
- Tracks time when you switch tabs
- Records time when you change websites
- Saves data when you switch windows
- Updates every minute in the background
- Continues tracking even when popup is closed

## Installation

### For Mac Users

1. **Generate Icons First**
   - Open `icons/create-icons.html` in Chrome
   - The icons will automatically download
   - Move the downloaded `icon16.png`, `icon48.png`, and `icon128.png` files into the `icons` folder

2. **Load the Extension**
   - Open Chrome and go to `chrome://extensions/`
   - Enable **Developer mode** (toggle in top-right corner)
   - Click **Load unpacked**
   - Select the `website-time-tracker` folder
   - The extension should now appear in your extensions list

3. **Pin the Extension** (Recommended)
   - Click the puzzle piece icon in Chrome's toolbar
   - Find "Website Time Tracker" and click the pin icon
   - The extension icon will now appear in your toolbar for easy access

## Usage

### Viewing Your Stats

1. Click the extension icon in your toolbar
2. See your total browsing time at the top
3. Browse through the list of websites you've visited
4. Each website shows:
   - Total time spent
   - Number of visits
   - Visual progress bar
   - Delete option

### Searching Websites

- Use the search box to filter websites by name
- Type any part of the website name to find it quickly

### Sorting Options

Click the dropdown menu to sort by:
- **Most Time** - Sites where you spent the most time (default)
- **Most Visits** - Sites you visited most frequently
- **Most Recent** - Sites you visited most recently
- **A-Z** - Alphabetical order

### Exporting Data

1. Click the "Export Data" button
2. A CSV file will be downloaded with all your statistics
3. Open in Excel, Google Sheets, or any spreadsheet app
4. Analyze your browsing patterns over time

### Managing Data

**Delete Individual Sites:**
- Click the "Delete" button next to any website
- Confirm the deletion
- That site's data will be removed

**Reset All Data:**
- Click the "Reset All" button at the bottom
- Confirm the reset
- All tracking data will be cleared

## Privacy

🔒 **Your data stays local** - All tracking data is stored locally on your computer
🚫 **No external servers** - Nothing is sent to any external servers
👁️ **No tracking** - We don't track what you do or what sites you visit
💾 **You own your data** - Export or delete your data anytime

## Understanding the Stats

- **Total Time Today** - Sum of all time spent browsing (shown at top)
- **Website Time** - Time spent on that specific domain
- **Visits** - Number of times you switched to that website
- **Progress Bar** - Visual representation relative to your most-visited site

## Tips

💡 **Real-time Tracking** - The extension tracks time as long as Chrome is running
💡 **Tab Switching** - Switching tabs pauses tracking on the old site and starts on the new one
💡 **Window Focus** - Tracking pauses when Chrome loses focus (you switch to another app)
💡 **Updates** - Stats refresh every 2 seconds when the popup is open
💡 **Background Saving** - Data is automatically saved every minute

## Troubleshooting

**Stats not updating:**
- Refresh the extension popup
- Make sure you're browsing actual websites (not chrome:// pages)
- Check that the extension is enabled in `chrome://extensions/`

**Missing time:**
- Very short visits (less than 1 second) are not tracked
- Chrome internal pages and extension pages are excluded

**Extension not loading:**
- Make sure icons are in the `icons` folder
- Reload the extension in `chrome://extensions/`

## Technical Details

- **Manifest Version:** 3
- **Storage:** Chrome Local Storage API
- **Updates:** Every 1 minute via Chrome Alarms API
- **Tracking:** Tab and Window events

## Keyboard Shortcuts (Mac)

- **⌘ + Shift + X** - Open extensions menu

## Development

Built with:
- Chrome Extension Manifest V3
- Vanilla JavaScript
- Chrome Storage API
- Chrome Alarms API
- CSS with modern gradients

## License

Created by Ben for personal use. Feel free to modify and enhance!

## Support

For issues or questions, contact benabutbul1980@gmail.com

---

**Enjoy tracking your browsing time! 📊**
