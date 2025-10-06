# 24/7 Food Shop - FiveM Script

A modern and user-friendly 24/7 convenience store script for FiveM with a beautiful GUI.

## Features

- 🏪 Multiple shop locations across the map (all 24/7 stores in Los Santos)
- 🎨 Modern, animated GUI with smooth transitions
- 🍔 Food items: Sandwich, Burger, Pizza, Hot Dog, Chips, Chocolate, Donut
- 🥤 Drinks: Water, Cola, Energy Drink, Coffee, Orange Juice
- 🛒 Shopping cart system with quantity controls
- 📊 Category filters (All Items, Food, Drinks)
- 🗺️ Blips on the map for all shop locations
- ✨ Interactive markers at shop entrances
- 💰 Framework support: ESX, QBCore, or Standalone
- 🎒 **Full inventory system with GUI**
- 📦 Use and drop items from inventory
- 💜 Beautiful purple-themed inventory interface

## Installation

1. Copy the `fivem_24_7_shop` folder to your FiveM server's `resources` directory

2. Add this line to your `server.cfg`:
   ```
   ensure fivem_24_7_shop
   ```

3. Configure your framework in `server.lua`:
   - For ESX: Uncomment the ESX section
   - For QBCore: Uncomment the QBCore section
   - For Standalone: Leave as is (default)

4. Restart your server

## Configuration

Edit `config.lua` to customize:

- Shop locations
- Item prices and names
- Marker settings
- Interaction distances

## Usage

### For Players

1. Go to any 24/7 store marked on the map (green blip with store icon)
2. Walk into the green marker at the entrance
3. Press **E** to open the shop
4. Browse items, add to cart, and purchase
5. Press **ESC** or click the X button to close the shop

### For Server Owners

The script works with:
- **ESX**: Handles money and inventory automatically
- **QBCore**: Handles money and inventory automatically
- **Standalone**: Logs purchases to console (implement your own money system)

## Items Included

### Food (6 items)
- Sandwich ($5)
- Burger ($8)
- Pizza Slice ($6)
- Hot Dog ($4)
- Chips ($3)
- Chocolate Bar ($3)
- Donut ($2)

### Drinks (5 items)
- Water ($2)
- Cola ($3)
- Energy Drink ($5)
- Coffee ($4)
- Orange Juice ($4)

## Customization

You can easily add more items in `config.lua`:

```lua
{
    name = "Item Name",
    price = 10,
    item = "item_spawn_name",
    description = "Item description",
    image = "icon.png"
}
```

## Controls

### Shop
- **E** - Open shop (when near marker)
- **ESC** - Close shop
- **Mouse** - Navigate and interact with GUI

### Inventory
- **/showinv** - Open inventory
- **Click item** - Select and view details
- **Use button** - Use selected item
- **Drop button** - Drop selected item (with amount prompt)
- **ESC** - Close inventory

## Shop Locations

The script includes 10 default 24/7 store locations:
- Downtown Los Santos
- Sandy Shores
- Paleto Bay
- Grapeseed
- Harmony
- And more...

## Credits

Created by Ben
For FiveM GTA V Roleplay servers

## Support

Make sure you have the correct item names in your framework's item database that match the `item` field in the config.

Enjoy your new 24/7 shop! 🎉
