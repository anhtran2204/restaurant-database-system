const apiUrl = '/api/employees';

// Fetch and display all employees
function fetchEmployees() {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('#employeeTable tbody');
            tbody.innerHTML = '';
            data.forEach(employee => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${employee.ID}</td>
                    <td>${employee.fname}</td>
                    <td>${employee.minit || ''}</td>
                    <td>${employee.lname}</td>
                    <td>${formatDate(employee.dob)}</td>
                    <td>${employee.position}</td>
                    <td>${employee.hoursPerWeek || ''}</td>
                    <td>${employee.Salary || ''}</td>
                    <td>${employee.Rate || ''}</td>
                    <td>
                        <button class="btn btn-warning" onclick="openEditEmployeeModal(${employee.ID})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteEmployee(${employee.ID})">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        });
}

// Open the Edit Modal and pre-fill data
function openEditEmployeeModal(employeeID) {
    fetch(`${apiUrl}/${employeeID}`)
        .then(response => response.json())
        .then(employee => {
            if (employee) {
                // Pre-fill the form in the modal
                document.getElementById('editEmployeeID').value = employee.ID;
                document.getElementById('editFname').value = employee.fname;
                document.getElementById('editMinit').value = employee.minit || '';
                document.getElementById('editLname').value = employee.lname;
                document.getElementById('editDob').value = new Date(employee.dob).toISOString().split('T')[0];
                document.getElementById('editPosition').value = employee.position;
                document.getElementById('editHoursPerWeek').value = employee.hoursPerWeek || '';
                document.getElementById('editSalary').value = employee.Salary || '';
                document.getElementById('editRate').value = employee.Rate || '';
                // Show the modal
                document.getElementById('employeeEditModal').style.display = 'flex';
            }
        })
        .catch(error => console.error('Error fetching employee:', error));
}

// Submit changes from the modal
function submitEditEmployee() {
    const employeeID = document.getElementById('editEmployeeID').value;
    const updatedEmployeeData = {
        fname: document.getElementById('editFname').value,
        minit: document.getElementById('editMinit').value || null,
        lname: document.getElementById('editLname').value,
        dob: document.getElementById('editDob').value,
        position: document.getElementById('editPosition').value,
        hoursPerWeek: document.getElementById('editHoursPerWeek').value || null,
        Salary: document.getElementById('editSalary').value || null,
        Rate: document.getElementById('editRate').value || null,
    };

    fetch(`${apiUrl}/${employeeID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedEmployeeData),
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Employee updated successfully');
                closeEditEmployeeModal();
                fetchEmployees();
            } else {
                alert('Error updating employee');
            }
        })
        .catch(error => console.error('Error updating employee:', error));
}

// Delete an employee
function deleteEmployee(employeeID) {
    if (confirm('Are you sure you want to delete this employee?')) {
        fetch(`${apiUrl}/${employeeID}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    alert('Employee deleted successfully');
                    fetchEmployees();
                } else {
                    alert('Error deleting employee');
                }
            })
            .catch(error => console.error('Error deleting employee:', error));
    }
}

// Close the Edit Modal
function closeEditEmployeeModal() {
    document.getElementById('employeeEditModal').style.display = 'none';
    document.getElementById('editEmployeeForm').reset();
}

// Utility function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US');
}

// Initial fetch to populate the employee table
fetchEmployees();
