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
                    <td>${item.LocationID}</td>
                    <td>${item.Quantity}</td>
                    <td>${new Date(item.Expiration).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit'
                    })}</td>
                    <td>
                        <button onclick="deleteInventory(${item.IngredientID}, ${item.LocationID})">Delete</button>
                        <button onclick="editInventory(${item.IngredientID}, ${item.LocationID})">Edit</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching inventory:', error));
}

function saveInventory() {
    const inventoryData = {
        IngredientID: document.getElementById('ingredientID').value,
        IngredientName: document.getElementById('ingredientName').value,
        LocationID: document.getElementById('locationID').value,
        Quantity: parseInt(document.getElementById('quantity').value, 10),
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

function editInventory(ingredientID, locationID) {
    const quantity = prompt('Enter new quantity:');
    const expiration = prompt('Enter new expiration date (YYYY-MM-DD):');

    if (quantity && expiration) {
        const updatedData = {
            Quantity: parseInt(quantity, 10),
            Expiration: expiration
        };

        fetch(`/api/inventory/${ingredientID}/${locationID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Inventory item updated successfully');
                fetchInventory();
            } else {
                alert('Error updating inventory item');
            }
        })
        .catch(error => console.error('Error updating inventory item:', error));
    }
}

function deleteInventory(ingredientID, locationID) {
    fetch(`/api/inventory/${ingredientID}/${locationID}`, {
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

fetchInventory();
