// Fetch and display all reservations
function fetchReservations() {
    const sortBy = document.getElementById('sortBy').value; // Get selected sorting criteria
    fetch(`/api/reservations?sortBy=${sortBy}`)

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
                        <button onclick="editReservation(${reservation.ResID})">Edit</button>
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

function editReservation(resID) {
    fetch(`/api/reservations/${resID}`)
        .then(response => response.json())
        .then(reservation => {
            if (reservation) {
                document.getElementById('editResID').value = reservation.ResID;
                document.getElementById('editResName').value = reservation.ResName;
                document.getElementById('editResInfo').value = new Date(reservation.ResInfo)
                    .toISOString()
                    .slice(0, 16);
                document.getElementById('editHostID').value = reservation.HostID;

                document.getElementById('reservationEditModal').style.display = 'flex';
                document.addEventListener('click', closeModalOnOutsideClick);
            }
        })
        .catch(error => console.error('Error fetching reservation:', error));
}

function submitEditReservation() {
    const resID = document.getElementById('editResID').value;

    const updatedReservationData = {
        ResName: document.getElementById('editResName').value,
        ResInfo: document.getElementById('editResInfo').value,
        HostID: document.getElementById('editHostID').value,
    };

    fetch(`/api/reservations/${resID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedReservationData),
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Reservation updated successfully');
                closeEditReservationModal();
                fetchReservations();
            } else {
                alert('Error updating reservation');
            }
        })
        .catch(error => console.error('Error updating reservation:', error));
}

function closeModalOnOutsideClick(event) {
    const modal = document.getElementById('reservationEditModal');
    const modalContent = document.querySelector('.popup-content');

    // Check if the clicked target is the modal overlay but not the modal content
    if (event.target === modal) {
        closeEditReservationModal();
    }
}

function closeEditReservationModal() {
    document.getElementById('reservationEditModal').style.display = 'none';
    document.getElementById('editReservationForm').reset();
    document.removeEventListener('click', closeModalOnOutsideClick);
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
