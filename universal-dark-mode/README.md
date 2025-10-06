# 🌙 Universal Dark Mode

A beautiful Chrome extension that applies customizable dark mode to any website.

## Features

✨ **Smart Dark Mode** - Automatically inverts colors and applies dark themes to any website
🎨 **4 Color Schemes** - Choose from Classic, Warm, Cool, or OLED themes
⚡ **Per-Site Control** - Enable/disable dark mode for specific websites
🌍 **Global Toggle** - Apply dark mode to all websites at once
💾 **Persistent Settings** - Your preferences are saved and synced
🎯 **User-Friendly UI** - Beautiful, intuitive popup interface

## Color Schemes

- **Classic** - Traditional dark gray with blue accents
- **Warm** - Sepia-toned dark mode, easy on the eyes
- **Cool** - Deep blue-black theme inspired by GitHub Dark
- **OLED** - Pure black for OLED screens, saves battery

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
   - Select the `universal-dark-mode` folder
   - The extension should now appear in your extensions list

3. **Pin the Extension** (Optional)
   - Click the puzzle piece icon in Chrome's toolbar
   - Find "Universal Dark Mode" and click the pin icon
   - The extension icon will now appear in your toolbar

## Usage

### Basic Usage

1. Click the extension icon in your toolbar
2. Toggle "Enable for this site" to apply dark mode to the current website
3. Use "Enable globally" to apply dark mode to all websites by default

### Changing Color Schemes

1. Click the extension icon
2. Select one of the four color scheme options:
   - Classic
   - Warm
   - Cool
   - OLED
3. The change applies immediately

### Managing Settings

- **Per-Site Settings**: Override the global setting for specific sites using the site toggle
- **Reset All Settings**: Click "Reset All Settings" in the popup to clear all preferences

## Keyboard Shortcuts (Mac)

While the extension is active, you can use these Chrome shortcuts:

- **⌘ + Shift + X** - Open extensions menu
- Click the extension icon to access settings

## How It Works

The extension uses three main components:

1. **Content Script** (`content.js`) - Injects CSS to apply dark mode styles
2. **Background Worker** (`background.js`) - Manages state and persistence
3. **Popup Interface** (`popup.html/js/css`) - User interface for controls

## Troubleshooting

**Dark mode isn't applying:**
- Refresh the page after toggling dark mode
- Some sites with strict Content Security Policies may not work
- Check that the extension is enabled in `chrome://extensions/`

**Colors look wrong:**
- Try a different color scheme
- Some websites override styles aggressively - this is a limitation

**Extension icon not showing:**
- The icons must be generated first using `icons/create-icons.html`
- Make sure the icon files are in the `icons` folder

## Development

Built with:
- Chrome Extension Manifest V3
- Vanilla JavaScript
- CSS with backdrop-filter effects
- Chrome Storage API

## License

Created by Ben for personal use. Feel free to modify and enhance!

## Support

For issues or questions, contact benabutbul1980@gmail.com
