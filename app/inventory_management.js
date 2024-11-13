function fetchInventory() {
    fetch('/api/inventory')
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('#inventoryTable tbody');
            tbody.innerHTML = '';
            data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.IngredientID}</td>
                    <td>${item.IngredientName}</td>
                    <td>${item.Quantity}</td>
                    <td>${item.Expiration}</td>
                    <td>
                        <button onclick="deleteInventory(${item.IngredientID})">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching inventory:', error));
}

function saveInventoryItem() {
    const inventoryData = {
        IngredientID: document.getElementById('ingredientID').value,
        IngredientName: document.getElementById('ingredientName').value,
        Quantity: document.getElementById('quantity').value,
        Expiration: document.getElementById('expiration').value
    };

    fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inventoryData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Inventory item added successfully');
            fetchInventory();
        } else {
            alert('Error adding inventory item');
        }
    })
    .catch(error => console.error('Error saving inventory item:', error));
}

function deleteInventory(ingredientID) {
    fetch(`/api/inventory/${ingredientID}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Inventory item deleted successfully');
            fetchInventory();
        } else {
            alert('Error deleting inventory item');
        }
    })
    .catch(error => console.error('Error deleting inventory item:', error));
}
