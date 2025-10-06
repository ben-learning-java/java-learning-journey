let currentInventory = null;
let selectedItem = null;

// Item icons
const itemIcons = {
    water: '💧',
    burger: '🍔',
    sandwich: '🥪',
    pizza: '🍕',
    hotdog: '🌭',
    chips: '🍟',
    chocolate: '🍫',
    donut: '🍩',
    cola: '🥤',
    energydrink: '⚡',
    coffee: '☕',
    orangejuice: '🧃',
    bandage: '🩹',
    medkit: '💊',
    phone: '📱',
    keys: '🔑',
    wallet: '💰',
    default: '📦'
};

// Listen for messages from client
window.addEventListener('message', function(event) {
    const data = event.data;

    if (data.action === 'openInventory') {
        currentInventory = data.inventory;
        openInventory();
    } else if (data.action === 'closeInventory') {
        document.getElementById('inventory-container').classList.add('hidden');
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
    $.post('https://fivem_inventory/closeInventory', JSON.stringify({}));
}

// Render inventory
function renderInventory() {
    const grid = document.getElementById('items-grid');
    grid.innerHTML = '';

    // Update stats
    updateInventoryStats();

    // Create item slots
    if (currentInventory && currentInventory.items && currentInventory.items.length > 0) {
        currentInventory.items.forEach((item, index) => {
            const itemSlot = createItemSlot(item);
            grid.appendChild(itemSlot);
        });
    } else {
        // Show empty message
        const emptyMsg = document.createElement('div');
        emptyMsg.style.gridColumn = '1 / -1';
        emptyMsg.style.textAlign = 'center';
        emptyMsg.style.padding = '50px';
        emptyMsg.style.color = 'rgba(255, 255, 255, 0.4)';
        emptyMsg.style.fontSize = '18px';
        emptyMsg.innerHTML = 'Your inventory is empty';
        grid.appendChild(emptyMsg);
    }
}

// Create item slot
function createItemSlot(item) {
    const slot = document.createElement('div');
    slot.className = 'item-slot';
    if (selectedItem && selectedItem.name === item.name) {
        slot.classList.add('selected');
    }

    const icon = itemIcons[item.name] || itemIcons.default;

    slot.innerHTML = `
        <div class="item-count">${item.count}</div>
        <div class="item-icon">${icon}</div>
        <div class="item-name">${item.label}</div>
        <div class="item-weight">${item.weight} KG</div>
    `;

    slot.addEventListener('click', () => selectItem(item));
    return slot;
}

// Select item
function selectItem(item) {
    selectedItem = item;
    renderInventory();
    showItemDetails(item);
}

// Show item details
function showItemDetails(item) {
    const detailsPanel = document.getElementById('item-details');
    detailsPanel.classList.remove('hidden');

    const icon = itemIcons[item.name] || itemIcons.default;

    document.getElementById('detail-icon').textContent = icon;
    document.getElementById('detail-name').textContent = item.label;
    document.getElementById('detail-count').textContent = `x${item.count}`;
    document.getElementById('detail-weight').textContent = `${item.weight} KG`;
    document.getElementById('detail-description').textContent = item.description || 'No description available';
}

// Update inventory stats
function updateInventoryStats() {
    if (!currentInventory) return;

    const itemCount = currentInventory.items ? currentInventory.items.length : 0;
    const maxSlots = currentInventory.maxSlots || 30;

    let totalWeight = 0;
    if (currentInventory.items) {
        currentInventory.items.forEach(item => {
            totalWeight += (item.weight * item.count);
        });
    }

    const maxWeight = currentInventory.maxWeight || 100.0;

    document.getElementById('slots-info').textContent = `${itemCount}/${maxSlots} Slots`;
    document.getElementById('weight-info').textContent = `${totalWeight.toFixed(1)}/${maxWeight.toFixed(1)} KG`;
}

// Use item
function useItem() {
    if (!selectedItem) return;

    $.post('https://fivem_inventory/useItem', JSON.stringify({
        itemName: selectedItem.name
    }));
}

// Show drop prompt
function showDropPrompt() {
    if (!selectedItem) return;

    document.getElementById('drop-modal').classList.remove('hidden');
    document.getElementById('drop-item-name').textContent = `Drop ${selectedItem.label} (Max: ${selectedItem.count})`;
    document.getElementById('drop-amount').max = selectedItem.count;
    document.getElementById('drop-amount').value = 1;
}

// Confirm drop
function confirmDrop() {
    if (!selectedItem) return;

    const amount = parseInt(document.getElementById('drop-amount').value);

    if (isNaN(amount) || amount <= 0 || amount > selectedItem.count) {
        return;
    }

    $.post('https://fivem_inventory/dropItem', JSON.stringify({
        itemName: selectedItem.name,
        amount: amount
    }));

    cancelDrop();
}

// Cancel drop
function cancelDrop() {
    document.getElementById('drop-modal').classList.add('hidden');
}

// ESC key to close
document.addEventListener('keyup', function(event) {
    if (event.key === 'Escape') {
        if (!document.getElementById('drop-modal').classList.contains('hidden')) {
            cancelDrop();
        } else if (!document.getElementById('inventory-container').classList.contains('hidden')) {
            closeInventory();
        }
    }
});
