-- Simple Inventory System with MySQL persistence
local PlayerInventories = {}

-- Initialize database
CreateThread(function()
    Wait(1000) -- Wait for oxmysql to load

    -- Check if table exists, create if not
    MySQL.query([[
        CREATE TABLE IF NOT EXISTS `player_inventory` (
          `id` int(11) NOT NULL AUTO_INCREMENT,
          `identifier` varchar(60) NOT NULL,
          `items` longtext DEFAULT '[]',
          `max_slots` int(11) DEFAULT 30,
          `max_weight` float DEFAULT 100.0,
          `last_updated` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
          PRIMARY KEY (`id`),
          UNIQUE KEY `identifier` (`identifier`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ]], {}, function(result)
        print('[Inventory] Database table initialized')
    end)
end)

-- Get player identifier
function GetPlayerIdentifier(source)
    local identifiers = GetPlayerIdentifiers(source)
    for _, id in pairs(identifiers) do
        if string.match(id, 'license:') then
            return id
        end
    end
    return nil
end

-- Load inventory from database
function LoadInventory(identifier, callback)
    MySQL.query('SELECT items, max_slots, max_weight FROM player_inventory WHERE identifier = ?', {identifier}, function(result)
        if result and result[1] then
            local inventory = {
                items = json.decode(result[1].items) or {},
                maxSlots = result[1].max_slots or 30,
                maxWeight = result[1].max_weight or 100.0
            }
            callback(inventory)
        else
            -- Create new inventory
            local newInventory = {
                items = {},
                maxSlots = 30,
                maxWeight = 100.0
            }

            MySQL.insert('INSERT INTO player_inventory (identifier, items, max_slots, max_weight) VALUES (?, ?, ?, ?)',
                {identifier, json.encode(newInventory.items), newInventory.maxSlots, newInventory.maxWeight},
                function(id)
                    print('[Inventory] Created new inventory for ' .. identifier)
                    callback(newInventory)
                end
            )
        end
    end)
end

-- Save inventory to database
function SaveInventory(identifier, inventory)
    if not inventory then return end

    MySQL.update('UPDATE player_inventory SET items = ?, max_slots = ?, max_weight = ? WHERE identifier = ?',
        {json.encode(inventory.items), inventory.maxSlots, inventory.maxWeight, identifier},
        function(affectedRows)
            if affectedRows > 0 then
                print('[Inventory] Saved inventory for ' .. identifier)
            end
        end
    )
end

-- Get inventory
RegisterServerEvent('inventory:getInventory')
AddEventHandler('inventory:getInventory', function()
    local src = source
    local identifier = GetPlayerIdentifier(src)

    if identifier then
        LoadInventory(identifier, function(inventory)
            PlayerInventories[identifier] = inventory
            TriggerClientEvent('inventory:receiveInventory', src, inventory)
        end)
    end
end)

-- Add item to inventory
RegisterServerEvent('inventory:addItem')
AddEventHandler('inventory:addItem', function(itemName, amount, itemData)
    local src = source
    local identifier = GetPlayerIdentifier(src)

    if not identifier then return end

    LoadInventory(identifier, function(inventory)
        -- Check if item already exists
        local itemFound = false
        for k, item in pairs(inventory.items) do
            if item.name == itemName then
                item.count = item.count + amount
                itemFound = true
                break
            end
        end

        -- Add new item if not found
        if not itemFound then
            table.insert(inventory.items, {
                name = itemName,
                label = itemData.label or itemName,
                count = amount,
                weight = itemData.weight or 0.5,
                description = itemData.description or 'No description',
                usable = itemData.usable or false
            })
        end

        PlayerInventories[identifier] = inventory
        SaveInventory(identifier, inventory)
        TriggerClientEvent('inventory:receiveInventory', src, inventory)
        TriggerClientEvent('inventory:notify', src, 'Added ' .. amount .. 'x ' .. (itemData.label or itemName), 'success')
    end)
end)

-- Remove item from inventory
RegisterServerEvent('inventory:removeItem')
AddEventHandler('inventory:removeItem', function(itemName, amount)
    local src = source
    local identifier = GetPlayerIdentifier(src)

    if not identifier then return end

    LoadInventory(identifier, function(inventory)
        for k, item in pairs(inventory.items) do
            if item.name == itemName then
                item.count = item.count - amount

                if item.count <= 0 then
                    table.remove(inventory.items, k)
                end

                PlayerInventories[identifier] = inventory
                SaveInventory(identifier, inventory)
                TriggerClientEvent('inventory:receiveInventory', src, inventory)
                TriggerClientEvent('inventory:notify', src, 'Removed ' .. amount .. 'x ' .. item.label, 'success')
                return
            end
        end
    end)
end)

-- Use item
RegisterServerEvent('inventory:useItem')
AddEventHandler('inventory:useItem', function(itemName)
    local src = source
    local identifier = GetPlayerIdentifier(src)

    if not identifier then return end

    LoadInventory(identifier, function(inventory)
        for k, item in pairs(inventory.items) do
            if item.name == itemName then
                if item.usable then
                    -- Remove one item
                    item.count = item.count - 1

                    if item.count <= 0 then
                        table.remove(inventory.items, k)
                    end

                    -- Trigger item use effect
                    TriggerClientEvent('inventory:itemUsed', src, itemName)
                    PlayerInventories[identifier] = inventory
                    SaveInventory(identifier, inventory)
                    TriggerClientEvent('inventory:receiveInventory', src, inventory)
                    TriggerClientEvent('inventory:notify', src, 'Used ' .. item.label, 'success')
                else
                    TriggerClientEvent('inventory:notify', src, 'This item cannot be used', 'error')
                end
                return
            end
        end
    end)
end)

-- Drop item
RegisterServerEvent('inventory:dropItem')
AddEventHandler('inventory:dropItem', function(itemName, amount)
    local src = source
    local identifier = GetPlayerIdentifier(src)

    if not identifier then return end

    LoadInventory(identifier, function(inventory)
        for k, item in pairs(inventory.items) do
            if item.name == itemName then
                if item.count >= amount then
                    item.count = item.count - amount

                    if item.count <= 0 then
                        table.remove(inventory.items, k)
                    end

                    PlayerInventories[identifier] = inventory
                    SaveInventory(identifier, inventory)
                    TriggerClientEvent('inventory:receiveInventory', src, inventory)
                    TriggerClientEvent('inventory:notify', src, 'Dropped ' .. amount .. 'x ' .. item.label, 'success')
                else
                    TriggerClientEvent('inventory:notify', src, 'Not enough items to drop', 'error')
                end
                return
            end
        end
    end)
end)

-- Player disconnecting - save inventory
AddEventHandler('playerDropped', function(reason)
    local src = source
    local identifier = GetPlayerIdentifier(src)

    if identifier and PlayerInventories[identifier] then
        SaveInventory(identifier, PlayerInventories[identifier])
        PlayerInventories[identifier] = nil
    end
end)

-- Give item (admin command)
RegisterCommand('giveitem', function(source, args, rawCommand)
    if source == 0 then -- Console only
        local targetId = tonumber(args[1])
        local itemName = args[2]
        local amount = tonumber(args[3]) or 1

        if targetId and itemName then
            TriggerEvent('inventory:addItem', targetId, itemName, amount, {
                label = itemName,
                weight = 0.5,
                description = 'Admin given item',
                usable = true
            })
            print('[Inventory] Gave ' .. amount .. 'x ' .. itemName .. ' to player ' .. targetId)
        else
            print('Usage: giveitem <player_id> <item_name> <amount>')
        end
    end
end, true)

-- Clear inventory (admin command)
RegisterCommand('clearinventory', function(source, args, rawCommand)
    if source == 0 then -- Console only
        local targetId = tonumber(args[1])
        if targetId then
            local identifier = GetPlayerIdentifier(targetId)
            if identifier then
                local emptyInventory = {
                    items = {},
                    maxSlots = 30,
                    maxWeight = 100.0
                }
                SaveInventory(identifier, emptyInventory)
                PlayerInventories[identifier] = emptyInventory
                TriggerClientEvent('inventory:receiveInventory', targetId, emptyInventory)
                print('[Inventory] Cleared inventory for player ' .. targetId)
            end
        else
            print('Usage: clearinventory <player_id>')
        end
    end
end, true)

-- View inventory in database (admin command)
RegisterCommand('viewinventory', function(source, args, rawCommand)
    if source == 0 then -- Console only
        local targetId = tonumber(args[1])
        if targetId then
            local identifier = GetPlayerIdentifier(targetId)
            if identifier then
                MySQL.query('SELECT * FROM player_inventory WHERE identifier = ?', {identifier}, function(result)
                    if result and result[1] then
                        print('[Inventory] Player ' .. targetId .. ' (' .. identifier .. '):')
                        print('  Items: ' .. result[1].items)
                        print('  Slots: ' .. result[1].max_slots)
                        print('  Weight: ' .. result[1].max_weight)
                    else
                        print('[Inventory] No inventory found for player ' .. targetId)
                    end
                end)
            end
        else
            print('Usage: viewinventory <player_id>')
        end
    end
end, true)
