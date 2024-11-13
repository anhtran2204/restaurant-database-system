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
                    <td>${item.Descr}</td>
                    <td>
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
        ItemID: document.getElementById('itemID').value,
        Mname: document.getElementById('mname').value,
        Price: document.getElementById('price').value,
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
