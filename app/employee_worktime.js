function loadLocationFilter() {
    fetch(`/api/worktimes/locations`)
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

function fetchWorktime() {
    const sortBy = document.getElementById('sortBy').value; // Get selected sorting criteria
    const locationID = document.getElementById('locationFilter').value; // Get selected location
    
    // Build the API URL
    const apiUrl = locationID
        ? `/api/worktimes?sortBy=${sortBy}&locationID=${locationID}`
        : `/api/worktimes?sortBy=${sortBy}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('#worktimeTable tbody');
            tbody.innerHTML = '';
            data.forEach(worktime => {
                const startTime = new Date(worktime.ClockedStart).toLocaleString();
                const endTime = new Date(worktime.ClockedEnd).toLocaleString();
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${worktime.LocationID}</td>
                    <td>${worktime.EmpID}</td>
                    <td>${worktime.FullName}</td>
                    <td>${startTime}</td>
                    <td>${endTime}</td>
                    <td>
                        <button onclick="editWorktime(${worktime.EmpID}, ${worktime.LocationID})">Edit</button>
                        <button onclick="deleteWorktime(${worktime.EmpID}, ${worktime.LocationID})">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching worktimes:', error));
}

function saveWorktime() {
    const worktimeData = {
        LocationID: document.getElementById('locationID').value,
        EmpID: document.getElementById('employeeID').value,
        FullName: `${document.getElementById('fName').value} ${document.getElementById('lName').value}`,
        ClockedStart: formatToMySQLDatetime(document.getElementById('clockedStart').value),
        ClockedEnd: formatToMySQLDatetime(document.getElementById('clockedEnd').value)
    };

    fetch('/api/worktimes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(worktimeData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Worktime added successfully');
            fetchWorktime();
        } else {
            alert('Error adding worktime');
        }
    })
    .catch(error => console.error('Error saving worktime:', error));
}

function editWorktime(empID, locationID) {
    fetch(`/api/worktimes/${empID}/${locationID}`)
        .then(response => response.json())
        .then(worktime => {
            if (worktime) {
                document.getElementById('editLocationID').value = worktime.LocationID;
                document.getElementById('editEmployeeID').value = worktime.EmpID;
                document.getElementById('editFullName').value = worktime.FullName;
                document.getElementById('editClockedStart').value = new Date(worktime.ClockedStart).toISOString().slice(0, 16);
                document.getElementById('editClockedEnd').value = new Date(worktime.ClockedEnd).toISOString().slice(0, 16);

                document.getElementById('worktimeEditModal').style.display = 'flex';
                
                document.addEventListener('click', closeModalOnOutsideClick);
            }
        })
        .catch(error => console.error('Error fetching worktime:', error));
}

function submitEditWorktime() {
    const locationID = document.getElementById('editLocationID').value;
    const empID = document.getElementById('editEmployeeID').value; // Assuming clockID is tied to EmployeeID
    const updatedWorktimeData = {
        ClockedStart: formatToMySQLDatetime(document.getElementById('editClockedStart').value),
        ClockedEnd: formatToMySQLDatetime(document.getElementById('editClockedEnd').value)
    };

    fetch(`/api/worktimes/${empID}/${locationID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedWorktimeData, empID, locationID })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Worktime updated successfully');
                closeEditWorktimeModal();
                fetchWorktime();
            } else {
                alert('Error updating worktime');
            }
        })
        .catch(error => console.error('Error updating worktime:', error));
}

function closeModalOnOutsideClick(event) {
    const modal = document.getElementById('worktimeEditModal');
    const modalContent = document.querySelector('.popup-content');

    // Check if the clicked target is the modal overlay but not the modal content
    if (event.target === modal) {
        closeEditWorktimeModal();
    }
}

function closeEditWorktimeModal() {
    document.getElementById('worktimeEditModal').style.display = 'none';
    document.getElementById('editWorktimeForm').reset();
    document.removeEventListener('click', closeModalOnOutsideClick);
}

function deleteWorktime(empID, locationID) {
    if (confirm('Are you sure you want to delete this employee?')) {
        fetch(`/api/worktimes/${empID}/${locationID}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert('Worktime deleted successfully');
                    fetchWorktime();
                } else {
                    alert('Error deleting worktime');
                }
            })
            .catch(error => console.error('Error deleting worktime:', error));
    }
}

// Utility function to format datetime to MySQL-compatible format
function formatToMySQLDatetime(datetimeString) {
    const date = new Date(datetimeString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Load locations on page load
loadLocationFilter();

// Initialize the worktime table on load
fetchWorktime();
