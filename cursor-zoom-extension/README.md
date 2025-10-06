# 🎯 Cursor Zoom - Chrome Extension

A simple and user-friendly Chrome extension that zooms to your cursor position with a single button click!

## ✨ Features

- **Instant Zoom**: Click the button to smoothly scroll to where your cursor is
- **Visual Indicator**: See a green pulse effect showing exactly where you zoomed to
- **Clean UI**: Beautiful, modern interface with gradient design
- **Lightweight**: Minimal performance impact on your browsing

## 📥 Installation Instructions

### Step 1: Prepare the Extension
All files are already created in this folder!

### Step 2: Load Extension in Chrome

1. **Open Chrome Extensions Page**
   - Open Google Chrome
   - Type `chrome://extensions/` in the address bar and press Enter
   - OR click the three dots menu → More Tools → Extensions

2. **Enable Developer Mode**
   - Look for the toggle switch labeled "Developer mode" in the top-right corner
   - Turn it ON (it should turn blue)

3. **Load Your Extension**
   - Click the "Load unpacked" button (appears after enabling Developer mode)
   - Navigate to and select this folder:
     `/Users/benabutbul/Documents/claude projects/cursor-zoom-extension`
   - Click "Select" or "Open"

4. **Pin the Extension** (Optional but recommended)
   - Click the puzzle piece icon in Chrome's toolbar
   - Find "Cursor Zoom" in the list
   - Click the pin icon next to it

## 🚀 How to Use

1. **Move your cursor** to any position on a webpage where you want to zoom
2. **Click the extension icon** (the purple target icon) in your Chrome toolbar
3. **Press the "🔍 Zoom to Cursor" button** in the popup
4. **Watch** as the page smoothly scrolls to center your cursor position with a visual indicator!

## 🛠️ Files Overview

- **manifest.json** - Extension configuration and permissions
- **popup.html** - The user interface you see when clicking the extension
- **popup.js** - Handles button clicks and communication
- **content.js** - Tracks cursor position and performs the zoom
- **icon16.png, icon48.png, icon128.png** - Extension icons

## 🎨 How It Works

1. **content.js** continuously tracks your mouse position on any webpage
2. When you click the zoom button, **popup.js** sends a message to **content.js**
3. **content.js** calculates where to scroll to center your cursor
4. The page smoothly scrolls to that position
5. A green pulsing circle appears at your cursor location for visual feedback

## 📝 Notes

- If you get an error message, try refreshing the webpage first
- The extension works on most websites (some sites like chrome:// pages have restrictions)
- The visual indicator appears for 1 second then fades away

## 🐛 Troubleshooting

**"Error: Please refresh the page first"**
- This happens when the extension loads after the page
- Simply refresh (F5 or Cmd+R) the webpage and try again

**Extension icon not showing**
- Make sure you pinned the extension (see Installation Step 4)
- Click the puzzle piece icon to see all extensions

**Zoom not working on some pages**
- Some pages (like Chrome settings, Chrome Web Store) don't allow extensions to run
- This is a Chrome security feature

## 👨‍💻 Made By

Ben Abutbul
Email: benabutbul1980@gmail.com

## 📄 License

Free to use and modify!

---

Enjoy your new cursor zoom extension! 🎉
