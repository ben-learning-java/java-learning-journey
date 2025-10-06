-- ESX/QBCore Framework Detection (modify based on your framework)
local Framework = nil

-- Uncomment the framework you're using:

-- ESX
--[[
ESX = nil
TriggerEvent('esx:getSharedObject', function(obj) ESX = obj end)
Framework = 'ESX'
]]

-- QBCore
--[[
QBCore = nil
TriggerEvent('QBCore:GetObject', function(obj) QBCore = obj end)
Framework = 'QBCore'
]]

-- Standalone (no framework)
Framework = 'Standalone'

-- Standalone inventory storage (only used if Framework == 'Standalone')
local PlayerInventories = {}

RegisterServerEvent('24_7_shop:buyItem')
AddEventHandler('24_7_shop:buyItem', function(itemName, quantity)
    local src = source
    local xPlayer = nil
    local itemData = nil

    -- Find the item in config
    for k, v in pairs(Config.ShopItems) do
        if v.item == itemName then
            itemData = v
            break
        end
    end

    if not itemData then
        TriggerClientEvent('24_7_shop:notify', src, 'Item not found!', 'error')
        return
    end

    local totalPrice = itemData.price * quantity

    -- Handle based on framework
    if Framework == 'ESX' then
        xPlayer = ESX.GetPlayerFromId(src)

        if xPlayer.getMoney() >= totalPrice then
            xPlayer.removeMoney(totalPrice)
            xPlayer.addInventoryItem(itemData.item, quantity)
            TriggerClientEvent('24_7_shop:notify', src,
                string.format('Purchased %dx %s for $%d', quantity, itemData.name, totalPrice),
                'success')
        else
            TriggerClientEvent('24_7_shop:notify', src, 'Not enough money!', 'error')
        end

    elseif Framework == 'QBCore' then
        xPlayer = QBCore.Functions.GetPlayer(src)

        if xPlayer.PlayerData.money.cash >= totalPrice then
            xPlayer.Functions.RemoveMoney('cash', totalPrice)
            xPlayer.Functions.AddItem(itemData.item, quantity)
            TriggerClientEvent('24_7_shop:notify', src,
                string.format('Purchased %dx %s for $%d', quantity, itemData.name, totalPrice),
                'success')
        else
            TriggerClientEvent('24_7_shop:notify', src, 'Not enough money!', 'error')
        end

    elseif Framework == 'Standalone' then
        -- Standalone implementation (no money system)
        local identifier = GetPlayerIdentifier(src, 0)

        -- Initialize inventory if doesn't exist
        if not PlayerInventories[identifier] then
            PlayerInventories[identifier] = {}
        end

        -- Add item to inventory
        if PlayerInventories[identifier][itemData.item] then
            PlayerInventories[identifier][itemData.item].count = PlayerInventories[identifier][itemData.item].count + quantity
        else
            PlayerInventories[identifier][itemData.item] = {
                name = itemData.name,
                count = quantity,
                price = itemData.price,
                description = itemData.description
            }
        end

        TriggerClientEvent('24_7_shop:notify', src,
            string.format('Purchased %dx %s for $%d', quantity, itemData.name, totalPrice),
            'success')

        -- Log to console for testing
        print(string.format('[24/7 Shop] Player %s purchased %dx %s for $%d',
            GetPlayerName(src), quantity, itemData.name, totalPrice))
    end
end)

-- Get inventory callback
if Framework == 'ESX' then
    ESX.RegisterServerCallback('24_7_shop:getInventory', function(source, cb)
        local xPlayer = ESX.GetPlayerFromId(source)
        local inventory = {}

        for k, v in pairs(xPlayer.inventory) do
            if v.count > 0 then
                table.insert(inventory, {
                    name = v.label,
                    item = v.name,
                    count = v.count,
                    weight = v.weight
                })
            end
        end

        cb(inventory)
    end)
elseif Framework == 'QBCore' then
    QBCore.Functions.CreateCallback('24_7_shop:getInventory', function(source, cb)
        local Player = QBCore.Functions.GetPlayer(source)
        local inventory = {}

        for k, v in pairs(Player.PlayerData.items) do
            if v.amount > 0 then
                table.insert(inventory, {
                    name = v.label,
                    item = v.name,
                    count = v.amount,
                    weight = v.weight
                })
            end
        end

        cb(inventory)
    end)
elseif Framework == 'Standalone' then
    -- Standalone callback registration
    RegisterServerEvent('24_7_shop:getInventory')
    AddEventHandler('24_7_shop:getInventory', function()
        local src = source
        local identifier = GetPlayerIdentifier(src, 0)
        local inventory = {}

        if PlayerInventories[identifier] then
            for item, data in pairs(PlayerInventories[identifier]) do
                table.insert(inventory, {
                    name = data.name,
                    item = item,
                    count = data.count,
                    description = data.description
                })
            end
        end

        TriggerClientEvent('24_7_shop:receiveInventory', src, inventory)
    end)
end

-- Use item
RegisterServerEvent('24_7_shop:useItem')
AddEventHandler('24_7_shop:useItem', function(itemName)
    local src = source

    if Framework == 'ESX' then
        local xPlayer = ESX.GetPlayerFromId(src)
        xPlayer.removeInventoryItem(itemName, 1)
        TriggerClientEvent('24_7_shop:notify', src, 'Used ' .. itemName, 'success')

    elseif Framework == 'QBCore' then
        local Player = QBCore.Functions.GetPlayer(src)
        Player.Functions.RemoveItem(itemName, 1)
        TriggerClientEvent('24_7_shop:notify', src, 'Used ' .. itemName, 'success')

    elseif Framework == 'Standalone' then
        local identifier = GetPlayerIdentifier(src, 0)

        if PlayerInventories[identifier] and PlayerInventories[identifier][itemName] then
            PlayerInventories[identifier][itemName].count = PlayerInventories[identifier][itemName].count - 1

            if PlayerInventories[identifier][itemName].count <= 0 then
                PlayerInventories[identifier][itemName] = nil
            end

            TriggerClientEvent('24_7_shop:notify', src, 'Used ' .. itemName, 'success')
        end
    end
end)

-- Drop item
RegisterServerEvent('24_7_shop:dropItem')
AddEventHandler('24_7_shop:dropItem', function(itemName, amount)
    local src = source

    if Framework == 'ESX' then
        local xPlayer = ESX.GetPlayerFromId(src)
        xPlayer.removeInventoryItem(itemName, amount)
        TriggerClientEvent('24_7_shop:notify', src, 'Dropped ' .. amount .. 'x ' .. itemName, 'success')

    elseif Framework == 'QBCore' then
        local Player = QBCore.Functions.GetPlayer(src)
        Player.Functions.RemoveItem(itemName, amount)
        TriggerClientEvent('24_7_shop:notify', src, 'Dropped ' .. amount .. 'x ' .. itemName, 'success')

    elseif Framework == 'Standalone' then
        local identifier = GetPlayerIdentifier(src, 0)

        if PlayerInventories[identifier] and PlayerInventories[identifier][itemName] then
            PlayerInventories[identifier][itemName].count = PlayerInventories[identifier][itemName].count - amount

            if PlayerInventories[identifier][itemName].count <= 0 then
                PlayerInventories[identifier][itemName] = nil
            end

            TriggerClientEvent('24_7_shop:notify', src, 'Dropped ' .. amount .. 'x ' .. itemName, 'success')
        end
    end
end)
