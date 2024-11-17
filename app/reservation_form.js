// Fetch and display all reservations
function fetchReservations() {
    fetch('/api/reservations')
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('#reservationTable tbody');
            tbody.innerHTML = '';
            data.forEach(reservation => {
                const formattedDate = new Date(reservation.ResInfo).toLocaleString('en-US', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                });

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${reservation.ResID}</td>
                    <td>${reservation.ResName}</td>
                    <td>${formattedDate}</td>
                    <td>${reservation.HostID}</td>
                    <td>
                        <button onclick="deleteReservation(${reservation.ResID})">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching reservations:', error));
}

// Save or update a reservation
function saveReservation() {
    const formData = {
        ResName: document.getElementById('ResName').value,
        ResInfo: document.getElementById('ResInfo').value,
        HostID: document.getElementById('HostID').value,
    };

    fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Reservation added successfully');
                fetchReservations();
            } else {
                alert('Error adding reservation');
            }
        })
        .catch(error => console.error('Error saving reservation:', error));
}

// Delete a reservation
function deleteReservation(ResID) {
    if (confirm('Are you sure you want to delete this reservation?')) {
        fetch(`/api/reservations/${ResID}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert('Reservation deleted successfully');
                    fetchReservations();
                } else {
                    alert('Error deleting reservation');
                }
            })
            .catch(error => console.error('Error deleting reservation:', error));
    }
}

// Initial fetch
fetchReservations();
