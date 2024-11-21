function loadLocationFilter() {
    fetch(`/api/waitlist/locations`)
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

function fetchWaitlist() {
    const sortBy = document.getElementById('sortBy').value; // Get selected sorting criteria
    const locationID = document.getElementById('locationFilter').value; // Get selected location
    
    // Build the API URL
    const apiUrl = locationID
        ? `/api/waitlist?sortBy=${sortBy}&locationID=${locationID}`
        : `/api/waitlist?sortBy=${sortBy}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('#waitlistTable tbody');
            tbody.innerHTML = '';
            data.forEach(entry => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${entry.LocationID}</td>
                    <td>${entry.WaitlistID}</td>
                    <td>${entry.WaitName}</td>
                    <td>${entry.PhoneNumber}</td>
                    <td>${entry.PartySize}</td>
                    <td>${entry.HostID}</td>
                    <td>
                        <button onclick="editWaitlist(${entry.WaitlistID}, ${entry.LocationID})">Edit</button>
                        <button onclick="deleteWaitlist(${entry.WaitlistID}, ${entry.LocationID})">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching waitlist:', error));
}

function saveWaitlistEntry() {
    const waitlistData = {
        LocationID: document.getElementById('locationID').value,
        WaitlistID: document.getElementById('waitlistID').value,
        WaitName: document.getElementById('waitName').value,
        PhoneNumber: document.getElementById('phoneNumber').value,
        PartySize: document.getElementById('partySize').value,
        HostID: document.getElementById('hostID').value,
    };

    fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(waitlistData),
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Waitlist entry added successfully');
                fetchWaitlist();
            } else {
                alert('Error adding waitlist entry');
            }
        })
        .catch(error => console.error('Error saving waitlist entry:', error));
}

function editWaitlist(waitlistID, locationID) {
    fetch(`/api/waitlist/${waitlistID}/${locationID}`)
        .then(response => response.json())
        .then(entry => {
            if (entry) {
                document.getElementById('editLocationID').value = entry.LocationID;
                document.getElementById('editWaitlistID').value = entry.WaitlistID;
                document.getElementById('editWaitName').value = entry.WaitName;
                document.getElementById('editPhoneNumber').value = entry.PhoneNumber;
                document.getElementById('editPartySize').value = entry.PartySize;
                document.getElementById('editHostID').value = entry.HostID;

                document.getElementById('waitlistEditModal').style.display = 'flex';
                
                document.addEventListener('click', closeModalOnOutsideClick);
            }
        })
        .catch(error => console.error('Error fetching waitlist entry:', error));
}

function submitEditWaitlist() {
    const locationID = document.getElementById('editLocationID').value;
    const waitlistID = document.getElementById('editWaitlistID').value;

    const updatedWaitlistData = {
        WaitName: document.getElementById('editWaitName').value,
        PhoneNumber: document.getElementById('editPhoneNumber').value,
        PartySize: document.getElementById('editPartySize').value,
        HostID: document.getElementById('editHostID').value,
    };

    fetch(`/api/waitlist/${waitlistID}/${locationID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedWaitlistData, waitlistID, locationID }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Waitlist entry updated successfully');
                closeEditWaitlistModal();
                fetchWaitlist();
            } else {
                alert('Error updating waitlist entry');
            }
        })
        .catch(error => console.error('Error updating waitlist entry:', error));
}

function closeModalOnOutsideClick(event) {
    const modal = document.getElementById('waitlistEditModal');
    const modalContent = document.querySelector('.popup-content');

    // Check if the clicked target is the modal overlay but not the modal content
    if (event.target === modal) {
        closeEditWaitlistModal();
    }
}

function closeEditWaitlistModal() {
    document.getElementById('waitlistEditModal').style.display = 'none';
    document.getElementById('editWaitlistForm').reset();
    document.removeEventListener('click', closeModalOnOutsideClick);
}

function deleteWaitlist(waitlistID, locationID) {
    if (confirm('Are you sure you want to delete this waitlist entry?')) {
        fetch(`/api/waitlist/${waitlistID}/${locationID}`, {
            method: 'DELETE',
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert('Waitlist entry deleted successfully');
                    fetchWaitlist();
                } else {
                    alert('Error deleting waitlist entry');
                }
            })
            .catch(error => console.error('Error deleting waitlist entry:', error));
    }
}

loadLocationFilter();
fetchWaitlist();
