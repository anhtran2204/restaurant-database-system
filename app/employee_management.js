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

function saveEmployee() {
    const empData = {
        ID: document.getElementById('employeeID').value,
        fname: document.getElementById('fname').value, // Corrected from 'fName'
        minit: document.getElementById('minit').value,
        lname: document.getElementById('lname').value, // Corrected from 'lName'
        dob: new Date(document.getElementById('dob').value).toISOString().split('T')[0],
        position: document.getElementById('position').value,
        hoursPerWeek: document.getElementById('hoursPerWeek').value,
        Salary: document.getElementById('salary').value, // Corrected from 'Salary'
        Rate: document.getElementById('rate').value, // Corrected from 'Rate'
    };

    fetch('/api/employees', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(empData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert(data.message);
            fetchEmployees(); // Refresh employee list
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}


function deleteEmployee(id) {
    if (confirm('Are you sure you want to delete this employee?')) {
        fetch(`/api/employees/${id}`, { method: 'DELETE' }) // Use DELETE method and correct endpoint
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Employee deleted successfully') {
                    alert('Employee deleted successfully');
                    fetchEmployees(); // Refresh the employee list
                } else {
                    alert('Error deleting employee');
                }
            })
            .catch(error => console.error('Error:', error));
    }
}

// Initial fetch
fetchEmployees();