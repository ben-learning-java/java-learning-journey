local isInMarker = false
local currentZone = nil
local shopOpen = false

-- Create blips on the map
Citizen.CreateThread(function()
    for k, v in pairs(Config.ShopLocations) do
        local blip = AddBlipForCoord(v.x, v.y, v.z)
        SetBlipSprite(blip, 52)
        SetBlipScale(blip, 0.8)
        SetBlipColour(blip, 2)
        SetBlipAsShortRange(blip, true)
        BeginTextCommandSetBlipName("STRING")
        AddTextComponentString(v.name)
        EndTextCommandSetBlipName(blip)
    end
end)

-- Draw markers at shop locations
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)
        local playerPed = PlayerPedId()
        local playerCoords = GetEntityCoords(playerPed)
        local isInRangeOfAnyShop = false

        for k, v in pairs(Config.ShopLocations) do
            local distance = #(playerCoords - vector3(v.x, v.y, v.z))

            if distance < Config.DrawDistance then
                isInRangeOfAnyShop = true
                DrawMarker(
                    Config.MarkerType,
                    v.x, v.y, v.z - 1.0,
                    0.0, 0.0, 0.0,
                    0.0, 0.0, 0.0,
                    Config.MarkerSize.x, Config.MarkerSize.y, Config.MarkerSize.z,
                    Config.MarkerColor.r, Config.MarkerColor.g, Config.MarkerColor.b, 200,
                    false, true, 2, false, nil, nil, false
                )

                if distance < Config.InteractionDistance then
                    if not isInMarker then
                        isInMarker = true
                        currentZone = k
                        DisplayHelpText("Press ~INPUT_CONTEXT~ to open 24/7 Shop")
                    end
                else
                    if isInMarker and currentZone == k then
                        isInMarker = false
                        currentZone = nil
                    end
                end
            end
        end

        if not isInRangeOfAnyShop then
            Citizen.Wait(500)
        end
    end
end)

-- Check for key press to open shop
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)
        if isInMarker and not shopOpen then
            if IsControlJustReleased(0, 38) then -- E key
                OpenShop()
            end
        else
            Citizen.Wait(500)
        end
    end
end)

function OpenShop()
    if shopOpen then return end
    shopOpen = true
    SetNuiFocus(true, true)
    SendNUIMessage({
        action = "openShop",
        items = Config.ShopItems
    })
end

function CloseShop()
    if not shopOpen then return end
    shopOpen = false
    SetNuiFocus(false, false)
    SendNUIMessage({
        action = "closeShop"
    })
end

-- NUI Callbacks
RegisterNUICallback('closeShop', function(data, cb)
    CloseShop()
    cb('ok')
end)

RegisterNUICallback('buyItem', function(data, cb)
    TriggerServerEvent('24_7_shop:buyItem', data.item, data.quantity)
    cb('ok')
end)

-- Display help text
function DisplayHelpText(text)
    SetTextComponentFormat("STRING")
    AddTextComponentString(text)
    DisplayHelpTextFromStringLabel(0, 0, 1, -1)
end

-- Handle ESC key to close shop
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)
        if shopOpen then
            DisableControlAction(0, 1, true) -- Disable mouse look
            DisableControlAction(0, 2, true) -- Disable mouse look
            DisableControlAction(0, 142, true) -- Disable melee attack
            DisableControlAction(0, 18, true) -- Disable enter
            DisableControlAction(0, 322, true) -- Disable ESC (we'll handle it manually)
            DisableControlAction(0, 106, true) -- Disable VehicleMouseControlOverride
        else
            Citizen.Wait(500)
        end
    end
end)

-- Notification function
RegisterNetEvent('24_7_shop:notify')
AddEventHandler('24_7_shop:notify', function(message, type)
    if type == 'success' then
        SetNotificationTextEntry("STRING")
        AddTextComponentString(message)
        SetNotificationMessage("CHAR_DEFAULT", "CHAR_DEFAULT", false, 1, "24/7 Shop", "Purchase Successful")
        DrawNotification(false, false)
    elseif type == 'error' then
        SetNotificationTextEntry("STRING")
        AddTextComponentString(message)
        SetNotificationMessage("CHAR_DEFAULT", "CHAR_DEFAULT", false, 1, "24/7 Shop", "Error")
        DrawNotification(false, false)
    end
end)

-- Command to open inventory
RegisterCommand('showinv', function()
    OpenInventory()
end, false)

-- Open Inventory
function OpenInventory()
    TriggerServerEvent('24_7_shop:getInventory')
end

-- Receive inventory (for standalone)
RegisterNetEvent('24_7_shop:receiveInventory')
AddEventHandler('24_7_shop:receiveInventory', function(inventory)
    SetNuiFocus(true, true)
    SendNUIMessage({
        action = "openInventory",
        inventory = inventory
    })
end)

-- Close inventory callback
RegisterNUICallback('closeInventory', function(data, cb)
    SetNuiFocus(false, false)
    cb('ok')
end)

-- Use item callback
RegisterNUICallback('useItem', function(data, cb)
    TriggerServerEvent('24_7_shop:useItem', data.item)
    cb('ok')
end)

-- Drop item callback
RegisterNUICallback('dropItem', function(data, cb)
    TriggerServerEvent('24_7_shop:dropItem', data.item, data.amount)
    cb('ok')
end)

-- Refresh inventory
RegisterNetEvent('24_7_shop:refreshInventory')
AddEventHandler('24_7_shop:refreshInventory', function(inventory)
    SendNUIMessage({
        action = "updateInventory",
        inventory = inventory
    })
end)
