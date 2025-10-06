# Update Instructions - YouTube & All Websites Fix

## What Was Fixed:
- Extension now works on **ALL websites** including YouTube
- Added automatic script injection for sites that need it
- Better error handling

## How to Update:

### Step 1: Reload the Extension
1. Go to `chrome://extensions/`
2. Find "Cursor Zoom"
3. Click the **reload icon** (circular arrow)

### Step 2: Accept New Permissions
- Chrome will ask you to approve new permissions
- Click **"Accept"** or **"Allow"**
- These permissions let the extension work on all sites

### Step 3: Test on YouTube
1. Go to **youtube.com**
2. Open any video
3. Move your cursor to any part of the video or page
4. Press **Ctrl+Shift+Z** (Mac: Cmd+Shift+Z)
5. The page should zoom in 2x at your cursor!
6. Press again to zoom out

## Troubleshooting:

### If it still doesn't work on YouTube:
1. **Refresh the YouTube page** (F5)
2. Try the shortcut again
3. Check the service worker console:
   - Go to `chrome://extensions/`
   - Click "service worker" link
   - Look for "Content script not found, injecting..." message

### Sites where it won't work:
- `chrome://` pages (Chrome's internal pages)
- Chrome Web Store
- Some banking websites (security restriction)

### Everything else should work!
- YouTube ✅
- Google ✅
- Reddit ✅
- Twitter/X ✅
- Facebook ✅
- Wikipedia ✅
- All regular websites ✅

## How It Works Now:
1. The extension tries to use the pre-loaded script
2. If that fails, it automatically injects the script on-demand
3. This ensures it works even on complex sites like YouTube

Enjoy zooming on every website, Ben! 🎯
