let shopItems = [];
let cart = {};
let currentCategory = 'all';

// Item icons mapping
const itemIcons = {
    sandwich: '🥪',
    burger: '🍔',
    pizza: '🍕',
    hotdog: '🌭',
    chips: '🍟',
    chocolate: '🍫',
    donut: '🍩',
    water: '💧',
    cola: '🥤',
    energydrink: '⚡',
    coffee: '☕',
    orangejuice: '🧃'
};

// Listen for messages from client
window.addEventListener('message', function(event) {
    const data = event.data;

    if (data.action === 'openShop') {
        shopItems = data.items;
        openShop();
    } else if (data.action === 'closeShop') {
        closeShop();
    }
});

// Open shop
function openShop() {
    document.getElementById('shop-container').classList.remove('hidden');
    renderItems();
    updateCart();
}

// Close shop
function closeShop() {
    document.getElementById('shop-container').classList.add('hidden');
    // Reset category to 'all'
    currentCategory = 'all';
    // Clear cart when closing
    cart = {};
    $.post('https://fivem_24_7_shop/closeShop', JSON.stringify({}));
}

// Filter by category
function filterCategory(category) {
    currentCategory = category;

    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    renderItems();
}

// Determine item category
function getItemCategory(item) {
    const foodItems = ['sandwich', 'burger', 'pizza', 'hotdog', 'chips', 'chocolate', 'donut'];
    if (foodItems.includes(item.item)) return 'food';
    return 'drinks';
}

// Render items
function renderItems() {
    const grid = document.getElementById('items-grid');
    grid.innerHTML = '';

    const filteredItems = currentCategory === 'all'
        ? shopItems
        : shopItems.filter(item => getItemCategory(item) === currentCategory);

    filteredItems.forEach((item, index) => {
        const itemCard = document.createElement('div');
        itemCard.className = 'item-card';

        const icon = itemIcons[item.item] || '🛒';

        itemCard.innerHTML = `
            <div class="item-icon">${icon}</div>
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <div class="item-price">$${item.price}</div>
            <button class="add-to-cart-btn" onclick="addToCart('${item.item}')">
                Add to Cart
            </button>
        `;

        grid.appendChild(itemCard);
    });
}

// Add item to cart
function addToCart(itemName) {
    if (cart[itemName]) {
        cart[itemName]++;
    } else {
        cart[itemName] = 1;
    }
    updateCart();
}

// Remove item from cart
function removeFromCart(itemName) {
    delete cart[itemName];
    updateCart();
}

// Update item quantity
function updateQuantity(itemName, delta) {
    if (cart[itemName]) {
        cart[itemName] += delta;
        if (cart[itemName] <= 0) {
            delete cart[itemName];
        }
        updateCart();
    }
}

// Clear cart
function clearCart() {
    cart = {};
    updateCart();
}

// Update cart display
function updateCart() {
    const cartContainer = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');

    if (Object.keys(cart).length === 0) {
        cartContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        totalElement.textContent = '$0';
        return;
    }

    cartContainer.innerHTML = '';
    let total = 0;

    for (const [itemName, quantity] of Object.entries(cart)) {
        const item = shopItems.find(i => i.item === itemName);
        if (!item) continue;

        const itemTotal = item.price * quantity;
        total += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';

        const icon = itemIcons[item.item] || '🛒';

        cartItem.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${icon} ${item.name}</div>
                <div class="cart-item-details">$${item.price} × ${quantity} = $${itemTotal}</div>
            </div>
            <div class="cart-item-controls">
                <button class="qty-btn" onclick="updateQuantity('${itemName}', -1)">-</button>
                <span class="cart-item-qty">${quantity}</span>
                <button class="qty-btn" onclick="updateQuantity('${itemName}', 1)">+</button>
                <button class="remove-item-btn" onclick="removeFromCart('${itemName}')">✕</button>
            </div>
        `;

        cartContainer.appendChild(cartItem);
    }

    totalElement.textContent = `$${total}`;
}

// Checkout
function checkout() {
    if (Object.keys(cart).length === 0) {
        return;
    }

    // Send purchase request for each item
    for (const [itemName, quantity] of Object.entries(cart)) {
        $.post('https://fivem_24_7_shop/buyItem', JSON.stringify({
            item: itemName,
            quantity: quantity
        }));
    }

    // Clear cart and close shop
    clearCart();
    closeShop();
}

// ESC key to close
document.addEventListener('keyup', function(event) {
    if (event.key === 'Escape') {
        if (!document.getElementById('shop-container').classList.contains('hidden')) {
            closeShop();
        } else if (!document.getElementById('inventory-container').classList.contains('hidden')) {
            closeInventory();
        }
    }
});

// ============= INVENTORY FUNCTIONS =============

let inventory = [];
let selectedItem = null;

// Listen for inventory messages
window.addEventListener('message', function(event) {
    const data = event.data;

    if (data.action === 'openInventory') {
        inventory = data.inventory;
        openInventory();
    } else if (data.action === 'updateInventory') {
        inventory = data.inventory;
        renderInventory();
    }
});

// Open inventory
function openInventory() {
    document.getElementById('inventory-container').classList.remove('hidden');
    renderInventory();
}

// Close inventory
function closeInventory() {
    document.getElementById('inventory-container').classList.add('hidden');
    selectedItem = null;
    $.post('https://fivem_24_7_shop/closeInventory', JSON.stringify({}));
}

// Render inventory
function renderInventory() {
    const grid = document.getElementById('inventory-grid');
    grid.innerHTML = '';

    if (inventory.length === 0) {
        grid.innerHTML = '<p class="empty-inventory">Your inventory is empty</p>';
        document.getElementById('item-info').classList.add('hidden');
        return;
    }

    inventory.forEach((item, index) => {
        const itemCard = document.createElement('div');
        itemCard.className = 'inventory-item';
        if (selectedItem && selectedItem.item === item.item) {
            itemCard.classList.add('selected');
        }

        const icon = itemIcons[item.item] || '📦';

        itemCard.innerHTML = `
            <div class="inventory-item-count">${item.count}</div>
            <div class="inventory-item-icon">${icon}</div>
            <div class="inventory-item-name">${item.name}</div>
        `;

        itemCard.addEventListener('click', () => selectInventoryItem(item));
        grid.appendChild(itemCard);
    });
}

// Select inventory item
function selectInventoryItem(item) {
    selectedItem = item;
    renderInventory();

    // Show info panel
    const infoPanel = document.getElementById('item-info');
    infoPanel.classList.remove('hidden');

    document.getElementById('info-item-name').textContent = item.name;
    document.getElementById('info-item-description').textContent = item.description || 'No description available';
    document.getElementById('info-item-count').textContent = `Quantity: ${item.count}`;
}

// Use item
function useItem() {
    if (!selectedItem) return;

    $.post('https://fivem_24_7_shop/useItem', JSON.stringify({
        item: selectedItem.item
    }));

    // Update local inventory
    const itemIndex = inventory.findIndex(i => i.item === selectedItem.item);
    if (itemIndex !== -1) {
        inventory[itemIndex].count--;
        if (inventory[itemIndex].count <= 0) {
            inventory.splice(itemIndex, 1);
            selectedItem = null;
        }
        renderInventory();
    }
}

// Drop item
function dropItem() {
    if (!selectedItem) return;

    const amount = prompt(`How many ${selectedItem.name} do you want to drop? (Max: ${selectedItem.count})`);
    const dropAmount = parseInt(amount);

    if (isNaN(dropAmount) || dropAmount <= 0 || dropAmount > selectedItem.count) {
        return;
    }

    $.post('https://fivem_24_7_shop/dropItem', JSON.stringify({
        item: selectedItem.item,
        amount: dropAmount
    }));

    // Update local inventory
    const itemIndex = inventory.findIndex(i => i.item === selectedItem.item);
    if (itemIndex !== -1) {
        inventory[itemIndex].count -= dropAmount;
        if (inventory[itemIndex].count <= 0) {
            inventory.splice(itemIndex, 1);
            selectedItem = null;
        }
        renderInventory();
    }
}
