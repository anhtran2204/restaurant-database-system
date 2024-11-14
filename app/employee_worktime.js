function fetchWorktime() {
    fetch('/api/worktimes')
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('#worktimeTable tbody');
            tbody.innerHTML = '';
            data.forEach(worktime => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${worktime.ClockID}</td>
                    <td>${worktime.EmpID}</td>
                    <td>${worktime.FullName}</td>
                    <td>${worktime.ClockedStart}</td>
                    <td>${worktime.ClockedEnd}</td>
                    <td>
                        <button onclick="editWorktime(${worktime.ClockID})">Edit</button>
                        <button onclick="deleteWorktime(${worktime.ClockID})">Delete</button>
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
        FullName: document.getElementById('fName').value + " " + document.getElementById('lName').value,
        ClockedStart: document.getElementById('clockedStart').value,
        ClockedEnd: document.getElementById('clockedEnd').value
    };

    fetch('/api/worktime', {
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

function deleteWorktime(clockID) {
    fetch(`/api/worktime/${clockID}`, {
        method: 'DELETE'
    })
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
