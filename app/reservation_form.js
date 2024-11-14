function fetchReservations() {
    fetch('/api/reservations')
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('#reservationTable tbody');
            tbody.innerHTML = '';
            data.forEach(reservation => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${reservation.ResID}</td>
                    <td>${reservation.ResName}</td>
                    <td>${reservation.ResInfo}</td>
                    <td>
                        <button onclick="deleteReservation(${reservation.ResID})">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching reservations:', error));
}

function saveReservation() {
    const reservationData = {
        ResID: document.getElementById('resID').value,
        ResName: document.getElementById('resName').value,
        ResInfo: document.getElementById('resInfo').value
    };

    fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservationData)
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

function deleteReservation(resID) {
    fetch(`/api/reservations/${resID}`, {
        method: 'DELETE'
    })
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


fetchReservations();