# Troubleshooting Guide

## How to Check for Errors:

### 1. Check Extension Errors:
1. Go to `chrome://extensions/`
2. Make sure "Developer mode" is ON (top-right)
3. Find "Cursor Zoom" extension
4. Look for a red "Errors" button - click it if you see one
5. Check the console for any error messages

### 2. Check Background Script Errors:
1. Go to `chrome://extensions/`
2. Find "Cursor Zoom"
3. Click "service worker" (it's a blue link under the extension name)
4. This opens the background script console - check for errors here

### 3. Check Content Script Errors:
1. Go to any webpage
2. Press F12 (or right-click → Inspect)
3. Click the "Console" tab
4. Look for any red error messages from the extension

### 4. Check Popup Errors:
1. Click the extension icon
2. Right-click on the popup window
3. Select "Inspect"
4. Check the console for errors

## How to Change Keyboard Shortcut:

1. Type `chrome://extensions/shortcuts` in the address bar
2. Find "Cursor Zoom" in the list
3. Click the pencil icon (✏️) next to "Zoom to cursor position"
4. Press your desired key combination
5. Click "OK"

## Common Issues:

### Shortcut Not Working:
- Make sure the extension is loaded (check chrome://extensions/)
- Reload the extension after making changes
- Refresh the webpage you're testing on
- Check if another extension is using the same shortcut
- Try a different shortcut at chrome://extensions/shortcuts

### "Please refresh the page first" Error:
- Simply refresh (F5) the webpage and try again
- This happens when the page loaded before the extension

### Extension Not Loading:
- Make sure all files are in the correct folder
- Check for errors at chrome://extensions/
- Try removing and re-loading the extension

## Need More Help?
Check the console errors and send them to Ben at benabutbul1980@gmail.com
