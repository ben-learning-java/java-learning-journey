# Simple Player Inventory - FiveM

A standalone inventory system for FiveM with MySQL persistence. Saves automatically to database and persists through server restarts and player reconnects.

## Features

- 💾 **MySQL Database** - Inventory persists through server restarts
- 🔄 **Player persistence** - Inventory saved to database when players disconnect
- 🎨 **Modern blue-themed GUI** with smooth animations
- ⚖️ **Weight & slot system** (30 slots, 100kg max by default)
- 🎮 **Easy to use** - Press `I` key to open inventory
- 📦 **Item management** - Use and drop items
- 🛠️ **Admin commands** for testing and management
- 🚀 **Fast and reliable** - Uses oxmysql

## Installation

### Requirements
- **oxmysql** - MySQL resource for FiveM
- **MySQL Database** - MariaDB 10.3+ or MySQL 5.7+

### Steps

1. Make sure you have `oxmysql` installed and configured in your server
2. Import the database schema:
   - Open `inventory.sql` in your SQL editor (HeidiSQL, phpMyAdmin, etc.)
   - Run the SQL script to create the `player_inventory` table
   - Or the table will be created automatically on first start
3. Copy the `fivem_inventory` folder to your server's `resources` directory
4. Add this to your `server.cfg`:
   ```
   ensure oxmysql
   ensure fivem_inventory
   ```
5. Restart your server

## Usage

### For Players

- **Press `I`** or type `/inventory` or `/inv` to open inventory
- **Click an item** to view details
- **Use button** - Use the selected item (restores health, etc.)
- **Drop button** - Drop items (prompts for amount)
- **ESC** - Close inventory

### Test Commands (For Players)

- `/testitem` - Adds 5 water bottles to your inventory
- `/testfood` - Adds 3 burgers to your inventory

### Admin Commands (Console Only)

- `giveitem <player_id> <item_name> <amount>`
  - Example: `giveitem 1 water 10`

- `clearinventory <player_id>`
  - Example: `clearinventory 1`

- `viewinventory <player_id>`
  - View a player's inventory from database
  - Example: `viewinventory 1`

## Item Effects

When items are used:

- **Water** - Restores 20 health
- **Food** (burger, sandwich, pizza) - Restores 30 health
- **Energy Drink** - Speed boost for 10 seconds

## Data Persistence

- **Auto-saves to MySQL:**
  - When items are added/removed/used
  - When a player disconnects
  - Real-time database updates

- **Database table:** `player_inventory`

- **Player identification:** Uses Rockstar License

## Customization

### Change Max Slots/Weight

Edit `server.lua`, find:

```lua
PlayerInventories[identifier] = {
    items = {},
    maxSlots = 30,  -- Change this
    maxWeight = 100.0  -- Change this
}
```

### Add New Items

Use the server event:

```lua
TriggerServerEvent('inventory:addItem', itemName, amount, {
    label = 'Display Name',
    weight = 0.5,
    description = 'Item description',
    usable = true
})
```

### Add Item Effects

Edit `client.lua`, find the `inventory:itemUsed` event handler and add your item:

```lua
elseif itemName == 'youritem' then
    -- Your custom effect here
end
```

## Integration Example

To give items from other scripts:

```lua
-- Server-side
TriggerEvent('inventory:addItem', source, 'water', 5, {
    label = 'Water Bottle',
    weight = 0.5,
    description = 'Refreshing water',
    usable = true
})
```

## File Structure

```
fivem_inventory/
├── fxmanifest.lua
├── server.lua          # Server-side logic & persistence
├── client.lua          # Client-side logic & controls
├── html/
│   ├── ui.html         # Inventory UI
│   ├── style.css       # Styling
│   └── script.js       # UI logic
├── inventories.json    # Auto-generated player data
└── README.md
```

## Notes

- The inventory data is stored in MySQL database
- Make sure `oxmysql` is properly configured with your database credentials
- Player inventories are identified by Rockstar License
- The system is standalone and doesn't require ESX or QBCore
- Database table is created automatically on first start

## Credits

Created by Ben
For FiveM GTA V Roleplay servers

Enjoy your persistent inventory system! 🎒
