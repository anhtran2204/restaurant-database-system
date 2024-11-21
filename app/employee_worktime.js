function fetchWorktime() {
    const sortBy = document.getElementById('sortBy').value; // Get selected sorting criteria
    fetch(`/api/worktimes?sortBy=${sortBy}`)
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('#worktimeTable tbody');
            tbody.innerHTML = '';
            data.forEach(worktime => {
                const startTime = new Date(worktime.ClockedStart).toLocaleString();
                const endTime = new Date(worktime.ClockedEnd).toLocaleString();
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${worktime.EmpID}</td>
                    <td>${worktime.FullName}</td>
                    <td>${startTime}</td>
                    <td>${endTime}</td>
                    <td>
                        <button onclick="editWorktime(${worktime.EmpID})">Edit</button>
                        <button onclick="deleteWorktime(${worktime.EmpID})">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching worktimes:', error));
}

function saveWorktime() {
    const worktimeData = {
        EmpID: document.getElementById('employeeID').value,
        FullName: `${document.getElementById('fName').value} ${document.getElementById('lName').value}`,
        ClockedStart: document.getElementById('clockedStart').value,
        ClockedEnd: document.getElementById('clockedEnd').value
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

function editWorktime(empID) {
    fetch(`/api/worktimes/${empID}`)
        .then(response => response.json())
        .then(worktime => {
            if (worktime) {
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
    const empID = document.getElementById('editEmployeeID').value; // Assuming clockID is tied to EmployeeID
    const updatedWorktimeData = {
        EmpID: empID,
        ClockedStart: document.getElementById('editClockedStart').value,
        ClockedEnd: document.getElementById('editClockedEnd').value
    };

    fetch(`/api/worktimes/${empID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedWorktimeData)
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

function deleteWorktime(empID) {
    fetch(`/api/worktimes/${empID}`, { method: 'DELETE' })
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



// Initialize the worktime table on load
fetchWorktime();
