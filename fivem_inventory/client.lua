local currentInventory = nil
local inventoryOpen = false

-- Open inventory command
RegisterCommand('inventory', function()
    OpenInventory()
end, false)

RegisterCommand('inv', function()
    OpenInventory()
end, false)

-- Key mapping (I key)
RegisterKeyMapping('inventory', 'Open Inventory', 'keyboard', 'I')

-- Open inventory
function OpenInventory()
    if inventoryOpen then return end
    TriggerServerEvent('inventory:getInventory')
end

-- Receive inventory from server
RegisterNetEvent('inventory:receiveInventory')
AddEventHandler('inventory:receiveInventory', function(inventory)
    currentInventory = inventory
    inventoryOpen = true
    SetNuiFocus(true, true)
    SendNUIMessage({
        action = 'openInventory',
        inventory = inventory
    })
end)

-- Close inventory
RegisterNUICallback('closeInventory', function(data, cb)
    CloseInventory()
    cb('ok')
end)

function CloseInventory()
    inventoryOpen = false
    SetNuiFocus(false, false)
    SendNUIMessage({
        action = 'closeInventory'
    })
end

-- Use item callback
RegisterNUICallback('useItem', function(data, cb)
    TriggerServerEvent('inventory:useItem', data.itemName)
    cb('ok')
end)

-- Drop item callback
RegisterNUICallback('dropItem', function(data, cb)
    TriggerServerEvent('inventory:dropItem', data.itemName, data.amount)
    cb('ok')
end)

-- Give item (for testing - F9 key)
RegisterCommand('testitem', function()
    -- Test: add some items
    TriggerServerEvent('inventory:addItem', 'water', 5, {
        label = 'Water Bottle',
        weight = 0.5,
        description = 'A refreshing bottle of water',
        usable = true
    })
end, false)

RegisterCommand('testfood', function()
    TriggerServerEvent('inventory:addItem', 'burger', 3, {
        label = 'Burger',
        weight = 0.8,
        description = 'A delicious burger',
        usable = true
    })
end, false)

-- Item used effects
RegisterNetEvent('inventory:itemUsed')
AddEventHandler('inventory:itemUsed', function(itemName)
    -- Add effects based on item
    if itemName == 'water' then
        -- Restore health
        local playerPed = PlayerPedId()
        local health = GetEntityHealth(playerPed)
        SetEntityHealth(playerPed, math.min(health + 20, 200))
    elseif itemName == 'burger' or itemName == 'sandwich' or itemName == 'pizza' then
        -- Restore health
        local playerPed = PlayerPedId()
        local health = GetEntityHealth(playerPed)
        SetEntityHealth(playerPed, math.min(health + 30, 200))
    elseif itemName == 'energydrink' then
        -- Speed boost
        local playerPed = PlayerPedId()
        SetRunSprintMultiplierForPlayer(PlayerId(), 1.2)
        Citizen.Wait(10000)
        SetRunSprintMultiplierForPlayer(PlayerId(), 1.0)
    end
end)

-- Notifications
RegisterNetEvent('inventory:notify')
AddEventHandler('inventory:notify', function(message, type)
    if type == 'success' then
        SetNotificationTextEntry("STRING")
        AddTextComponentString(message)
        SetNotificationMessage("CHAR_DEFAULT", "CHAR_DEFAULT", false, 1, "Inventory", "")
        DrawNotification(false, false)
    elseif type == 'error' then
        SetNotificationTextEntry("STRING")
        AddTextComponentString(message)
        SetNotificationMessage("CHAR_DEFAULT", "CHAR_DEFAULT", false, 1, "Inventory", "Error")
        DrawNotification(false, false)
    end
end)

-- Disable controls while inventory is open
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)
        if inventoryOpen then
            DisableControlAction(0, 1, true) -- Mouse look
            DisableControlAction(0, 2, true) -- Mouse look
            DisableControlAction(0, 142, true) -- Melee attack
            DisableControlAction(0, 18, true) -- Enter
            DisableControlAction(0, 322, true) -- ESC
            DisableControlAction(0, 106, true) -- VehicleMouseControlOverride
        else
            Citizen.Wait(500)
        end
    end
end)
