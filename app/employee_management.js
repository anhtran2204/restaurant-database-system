// Fetch and display all employees
function fetchEmployees() {
    fetch('/api/employees')
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('#employeeTable tbody');
            tbody.innerHTML = '';
            data.forEach(employee => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${employee.ID}</td>
                    <td>${employee.fname}</td>
                    <td>${employee.minit}</td>
                    <td>${employee.lname}</td>
                    <td>${employee.dob}</td>
                    <td>${employee.position}</td>
                    <td>${employee.hoursPerWeek}</td>
                    <td>${employee.Salary}</td>
                    <td>${employee.Rate}</td>
                    <td>
                        <button onclick="editEmployee(${employee.ID})">Edit</button>
                        <button onclick="deleteEmployee(${employee.ID})">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        });
}

// Save or update employee
function saveEmployee() {
    const formData = new FormData(document.getElementById('employeeForm'));
    formData.append('availableDates', document.getElementById('availableDates').value);
    formData.append('workStartTime', document.getElementById('workStartTime').value);
    formData.append('workEndTime', document.getElementById('workEndTime').value);

    fetch('/api/employees', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Employee added successfully');
            // Optionally, refresh the employee list here
        } else {
            alert('Error adding employee');
        }
    })
    .catch(error => console.error('Error:', error));
}


// Delete employee
function deleteEmployee(id) {
    if (confirm('Are you sure you want to delete this employee?')) {
        fetch(`/api/employees?id=${id}`, { method: 'GET' })
            .then(() => fetchEmployees())
            .catch(error => console.error('Error:', error));
    }
}

// Initial fetch
fetchEmployees();
