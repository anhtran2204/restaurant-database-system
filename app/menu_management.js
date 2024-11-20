function fetchMenuItems() {
    fetch('/api/menu')
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('#menuTable tbody');
            tbody.innerHTML = '';
            data.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.ItemID}</td>
                    <td>${item.Mname}</td>
                    <td>${item.Price}</td>
                    <td>${item.Recipe}</td>
                    <td>${item.Descr}</td>
                    <td>
                        <button onclick="editMenuItem(${item.ItemID})">Edit</button>
                        <button onclick="deleteMenuItem(${item.ItemID})">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching menu items:', error));
}

function saveMenuItem() {
    const menuData = {
        Mname: document.getElementById('mname').value,
        Price: document.getElementById('price').value,
        Recipe: document.getElementById('recipe').value,
        Descr: document.getElementById('descr').value
    };

    fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Menu item added successfully');
            fetchMenuItems();
        } else {
            alert('Error adding menu item');
        }
    })
    .catch(error => console.error('Error saving menu item:', error));
}

function editMenuItem(itemID) {
    fetch(`/api/menu/${itemID}`)
        .then(response => response.json())
        .then(item => {
            if (item) {
                document.getElementById('editMname').value = item.Mname;
                document.getElementById('editPrice').value = item.Price;
                document.getElementById('editRecipe').value = item.Recipe || '';
                document.getElementById('editDescr').value = item.Descr || '';

                document.getElementById('menuEditModal').style.display = 'flex';
                document.addEventListener('click', closeModalOnOutsideClick);
            }
        })
        .catch(error => console.error('Error fetching menu item:', error));
}

function submitEditMenu() {
    const mname = document.getElementById('editMname').value;

    const updatedMenuData = {
        Price: parseFloat(document.getElementById('editPrice').value),
        Recipe: document.getElementById('editRecipe').value || '',
        Descr: document.getElementById('editDescr').value || ''
    };

    fetch(`/api/menu/${itemID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMenuData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Menu item updated successfully');
                closeEditMenuModal();
                fetchMenuItems();
            } else {
                alert('Error updating menu item');
            }
        })
        .catch(error => console.error('Error updating menu item:', error));
}

function closeModalOnOutsideClick(event) {
    const modal = document.getElementById('menuEditModal');
    const modalContent = document.querySelector('.popup-content');

    // Check if the clicked target is the modal overlay but not the modal content
    if (event.target === modal) {
        closeEditMenuModal();
    }
}

function closeEditMenuModal() {
    document.getElementById('menuEditModal').style.display = 'none';
    document.getElementById('editMenuForm').reset();
    document.removeEventListener('click', closeModalOnOutsideClick);
}

function deleteMenuItem(itemID) {
    fetch(`/api/menu/${itemID}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Menu item deleted successfully');
            fetchMenuItems();
        } else {
            alert('Error deleting menu item');
        }
    })
    .catch(error => console.error('Error deleting menu item:', error));
}

fetchMenuItems();