Config = {}

-- Shop locations (24/7 stores around Los Santos)
Config.ShopLocations = {
    {x = 25.7, y = -1347.3, z = 29.49, name = "24/7 Supermarket"},
    {x = -3038.71, y = 585.95, z = 7.9, name = "24/7 Supermarket"},
    {x = -3241.93, y = 1001.46, z = 12.83, name = "24/7 Supermarket"},
    {x = 1729.21, y = 6414.13, z = 35.03, name = "24/7 Supermarket"},
    {x = 1697.99, y = 4924.4, z = 42.06, name = "24/7 Supermarket"},
    {x = 1961.46, y = 3739.96, z = 32.34, name = "24/7 Supermarket"},
    {x = 547.43, y = 2671.71, z = 42.15, name = "24/7 Supermarket"},
    {x = 2679.62, y = 3280.4, z = 55.24, name = "24/7 Supermarket"},
    {x = 2557.46, y = 382.28, z = 108.62, name = "24/7 Supermarket"},
    {x = 373.55, y = 325.56, z = 103.56, name = "24/7 Supermarket"},
}

-- Marker settings
Config.MarkerType = 27
Config.MarkerSize = {x = 1.5, y = 1.5, z = 1.0}
Config.MarkerColor = {r = 0, g = 255, b = 0}
Config.DrawDistance = 10.0
Config.InteractionDistance = 2.0

-- Shop items
Config.ShopItems = {
    -- Food items
    {
        name = "Sandwich",
        price = 5,
        item = "sandwich",
        description = "A delicious sandwich",
        image = "sandwich.png"
    },
    {
        name = "Burger",
        price = 8,
        item = "burger",
        description = "Tasty burger",
        image = "burger.png"
    },
    {
        name = "Pizza Slice",
        price = 6,
        item = "pizza",
        description = "Hot pizza slice",
        image = "pizza.png"
    },
    {
        name = "Hot Dog",
        price = 4,
        item = "hotdog",
        description = "Classic hot dog",
        image = "hotdog.png"
    },
    {
        name = "Chips",
        price = 3,
        item = "chips",
        description = "Crispy chips",
        image = "chips.png"
    },
    {
        name = "Chocolate Bar",
        price = 3,
        item = "chocolate",
        description = "Sweet chocolate",
        image = "chocolate.png"
    },
    {
        name = "Donut",
        price = 2,
        item = "donut",
        description = "Glazed donut",
        image = "donut.png"
    },
    -- Drinks
    {
        name = "Water",
        price = 2,
        item = "water",
        description = "Refreshing water",
        image = "water.png"
    },
    {
        name = "Cola",
        price = 3,
        item = "cola",
        description = "Ice cold cola",
        image = "cola.png"
    },
    {
        name = "Energy Drink",
        price = 5,
        item = "energydrink",
        description = "Boosts your energy",
        image = "energydrink.png"
    },
    {
        name = "Coffee",
        price = 4,
        item = "coffee",
        description = "Hot coffee",
        image = "coffee.png"
    },
    {
        name = "Orange Juice",
        price = 4,
        item = "orangejuice",
        description = "Fresh orange juice",
        image = "juice.png"
    },
}
