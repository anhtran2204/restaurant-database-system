function loadLocationFilter() {
    fetch(`/api/inventory/locations`)
        .then(response => response.json())
        .then(locations => {
            const locationFilter = document.getElementById('locationFilter');
            locationFilter.innerHTML = ''; // Clear the existing options

            // Add an option for all locations
            const allOption = document.createElement('option');
            allOption.value = '';
            allOption.textContent = 'All Locations';
            locationFilter.appendChild(allOption);
            
            locations.forEach(location => {
                const option = document.createElement('option');
                option.value = location.LocationID;
                option.textContent = `Location ${location.LocationID}`;
                locationFilter.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching locations:', error));
}

function fetchInventory() {
    const sortBy = document.getElementById('sortBy').value; // Get selected sorting criteria
    const locationID = document.getElementById('locationFilter').value; // Get selected location
    
    // Build the API URL
    const apiUrl = locationID
        ? `/api/inventory?sortBy=${sortBy}&locationID=${locationID}`
        : `/api/inventory?sortBy=${sortBy}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('#inventoryTable tbody');
            tbody.innerHTML = '';
            data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.LocationID}</td>
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
                        <button onclick="editInventory(${item.IngredientID}, ${item.LocationID})">Edit</button>
                        <button onclick="deleteInventory(${item.IngredientID}, ${item.LocationID})">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching inventory:', error));
}

function saveInventory() {
    const inventoryData = {
        LocationID: document.getElementById('locationID').value,
        IngredientID: document.getElementById('ingredientID').value,
        IngredientName: document.getElementById('ingredientName').value,
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
    fetch(`/api/inventory/${ingredientID}/${locationID}`)
        .then(response => response.json())
        .then(item => {
            if (item) {
                document.getElementById('editIngredientID').value = item.IngredientID;
                document.getElementById('editIngredientName').value = item.IngredientName;
                document.getElementById('editLocationID').value = item.LocationID;
                document.getElementById('editQuantity').value = item.Quantity;
                document.getElementById('editExpiration').value = new Date(item.Expiration).toISOString().split('T')[0];

                document.getElementById('inventoryEditModal').style.display = 'flex';
                document.addEventListener('click', closeModalOnOutsideClick);
            }
        })
        .catch(error => console.error('Error fetching inventory item:', error));
}

function submitEditInventory() {
    const ingredientID = document.getElementById('editIngredientID').value;
    const locationID = document.getElementById('editLocationID').value;

    const updatedInventoryData = {
        IngredientName: document.getElementById('editIngredientName').value,
        Quantity: parseInt(document.getElementById('editQuantity').value, 10),
        Expiration: document.getElementById('editExpiration').value
    };

    fetch(`/api/inventory/${ingredientID}/${locationID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedInventoryData, ingredientID, locationID })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Inventory item updated successfully');
                closeEditInventoryModal();
                fetchInventory();
            } else {
                alert('Error updating inventory item');
            }
        })
        .catch(error => console.error('Error updating inventory item:', error));
}

function closeModalOnOutsideClick(event) {
    const modal = document.getElementById('inventoryEditModal');
    const modalContent = document.querySelector('.popup-content');

    // Check if the clicked target is the modal overlay but not the modal content
    if (event.target === modal) {
        closeEditInventoryModal();
    }
}

function closeEditInventoryModal() {
    document.getElementById('inventoryEditModal').style.display = 'none';
    document.getElementById('editInventoryForm').reset();
    document.removeEventListener('click', closeModalOnOutsideClick);
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
// Load locations on page load
loadLocationFilter();

fetchInventory();
