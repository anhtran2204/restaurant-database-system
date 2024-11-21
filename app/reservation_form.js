function loadLocationFilter() {
    fetch(`/api/reservations/locations`)
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

// Fetch and display all reservations
function fetchReservations() {
    const sortBy = document.getElementById('sortBy').value; // Get selected sorting criteria
    const locationID = document.getElementById('locationFilter').value; // Get selected location
    
    // Build the API URL
    const apiUrl = locationID
        ? `/api/reservations?sortBy=${sortBy}&locationID=${locationID}`
        : `/api/reservations?sortBy=${sortBy}`;

    fetch(apiUrl)
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
                    <td>${reservation.LocationID}</td>
                    <td>${reservation.ResID}</td>
                    <td>${reservation.ResName}</td>
                    <td>${formattedDate}</td>
                    <td>${reservation.ResSize}</td>
                    <td>${reservation.HostID}</td>
                    <td>
                        <button onclick="editReservation(${reservation.ResID}, ${reservation.LocationID})">Edit</button>
                        <button onclick="deleteReservation(${reservation.ResID}, ${reservation.LocationID})">Delete</button>
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
        LocationID: document.getElementById('locationID').value,
        ResID: document.getElementById('resID').value,
        ResName: document.getElementById('resName').value,
        ResInfo: document.getElementById('resInfo').value,
        ResSize: document.getElementById('partySize').value,
        HostID: document.getElementById('hostID').value,
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

function editReservation(resID, locationID) {
    fetch(`/api/reservations/${resID}/${locationID}`)
        .then(response => response.json())
        .then(reservation => {
            if (reservation) {
                document.getElementById('editLocationID').value = reservation.LocationID;
                document.getElementById('editResID').value = reservation.ResID;
                document.getElementById('editResName').value = reservation.ResName;
                document.getElementById('editResInfo').value = new Date(reservation.ResInfo)
                    .toISOString()
                    .slice(0, 16);
                document.getElementById('editResSize').value = reservation.ResSize;
                document.getElementById('editHostID').value = reservation.HostID;

                document.getElementById('reservationEditModal').style.display = 'flex';
                document.addEventListener('click', closeModalOnOutsideClick);
            }
        })
        .catch(error => console.error('Error fetching reservation:', error));
}

function submitEditReservation() {
    const locationID = document.getElementById('editLocationID').value;
    const resID = document.getElementById('editResID').value;

    const updatedReservationData = {
        ResName: document.getElementById('editResName').value,
        ResInfo: document.getElementById('editResInfo').value,
        ResSize: document.getElementById('editResSize').value,
        HostID: document.getElementById('editHostID').value,
    };

    fetch(`/api/reservations/${resID}/${locationID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedReservationData, resID, locationID }),
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
function deleteReservation(ResID, locationID) {
    if (confirm('Are you sure you want to delete this reservation?')) {
        fetch(`/api/reservations/${ResID}/${locationID}`, { method: 'DELETE' })
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

loadLocationFilter()

// Initial fetch
fetchReservations();
