const apiUrl = '/api/employees';

// Fetch and display all employees
function fetchEmployees() {
    const sortBy = document.getElementById('sortBy').value;
    fetch(`${apiUrl}?sortBy=${sortBy}`)
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('#employeeTable tbody');
            tbody.innerHTML = '';
            data.forEach(employee => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${employee.ID}</td>
                    <td>${employee.fname}</td>
                    <td>${employee.minit || 'N/A'}</td>
                    <td>${employee.lname}</td>
                    <td>${formatDate(employee.dob)}</td>
                    <td>${employee.AvailableDays || 'N/A'}</td>
                    <td>${employee.position}</td>
                    <td>${employee.ShiftType || 'N/A'}</td>
                    <td>${employee.hoursPerWeek || 'N/A'}</td>
                    <td>${employee.Salary || 'N/A'}</td>
                    <td>${employee.Rate || 'N/A'}</td>
                    <td>
                        <button class="btn btn-warning" onclick="openEditEmployeeModal(${employee.ID})">Edit</button>
                        <button class="btn btn-danger" onclick="deleteEmployee(${employee.ID})">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching employees:', error));
}

// Open the Edit Modal and pre-fill data
function openEditEmployeeModal(employeeID) {
    fetch(`${apiUrl}/${employeeID}`)
        .then(response => response.json())
        .then(employee => {
            if (employee) {
                document.getElementById('editEmployeeID').value = employee.ID;
                document.getElementById('editFname').value = employee.fname;
                document.getElementById('editMinit').value = employee.minit || '';
                document.getElementById('editLname').value = employee.lname;
                document.getElementById('editDob').value = new Date(employee.dob).toISOString().split('T')[0];
                document.getElementById('editPosition').value = employee.position;
                document.getElementById('editHoursPerWeek').value = employee.hoursPerWeek || '';
                document.getElementById('editSalary').value = employee.Salary || '';
                document.getElementById('editRate').value = employee.Rate || '';
                document.getElementById('editShiftType').value = employee.ShiftType;

                // Populate checkboxes for available days
                const availableDays = (employee.AvailableDays || '').split(',');
                document.querySelectorAll('#editAvailableDays input[type="checkbox"]').forEach(checkbox => {
                    checkbox.checked = availableDays.includes(checkbox.value);
                });

                document.getElementById('employeeEditModal').style.display = 'flex';

                // Add event listener for clicks outside the modal
                document.addEventListener('click', closeModalOnOutsideClick);
            }
        })
        .catch(error => console.error('Error fetching employee:', error));
}


function saveEmployee() {
    const employeeData = {
        employeeID: document.getElementById('employeeID').value,
        fname: document.getElementById('fname').value,
        minit: document.getElementById('minit').value || null,
        lname: document.getElementById('lname').value,
        dob: document.getElementById('dob').value,
        position: document.getElementById('position').value,
        hoursPerWeek: document.getElementById('hoursPerWeek').value || null,
        salary: document.getElementById('salary').value || null,
        rate: document.getElementById('rate').value || null,
        availableDays: getSelectedDays(),
        shiftType: document.getElementById('shiftType').value || null
    };

    fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData),
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Employee saved successfully');
                fetchEmployees();
            } else {
                alert('Error saving employee');
            }
        })
        .catch(error => console.error('Error saving employee:', error));
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
        shiftType: document.getElementById('editShiftType').value,
        availableDays: Array.from(
            document.querySelectorAll('#editAvailableDays input[type="checkbox"]:checked')
        ).map(checkbox => checkbox.value).join(',')
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

function closeModalOnOutsideClick(event) {
    const modal = document.getElementById('employeeEditModal');
    const modalContent = document.querySelector('.popup-content');

    // Check if the clicked target is the modal overlay but not the modal content
    if (event.target === modal) {
        closeEditEmployeeModal();
    }
}

// Close the Edit Modal
function closeEditEmployeeModal() {
    document.getElementById('employeeEditModal').style.display = 'none';
    document.getElementById('editEmployeeForm').reset();
    document.removeEventListener('click', closeModalOnOutsideClick);
}

// Utility function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US');
}

// Initial fetch to populate the employee table
fetchEmployees();