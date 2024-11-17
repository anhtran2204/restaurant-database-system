let currentWeekStartDate = getStartOfWeek(new Date());

function goToThisWeek() {
    currentWeekStartDate = getStartOfWeek(new Date());
    renderCalendar();
}

function changeWeek(weekChange) {
    currentWeekStartDate.setDate(currentWeekStartDate.getDate() + weekChange * 7);
    renderCalendar();
}

function getStartOfWeek(date) {
    const day = date.getDay(); // 0 (Sun) - 6 (Sat)
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    return new Date(date.setDate(diff));
}

function renderCalendar() {
    const calendarTitle = document.getElementById('calendarTitle');
    const calendarBody = document.getElementById('calendarBody');

    // Format the week range title
    const endOfWeek = new Date(currentWeekStartDate);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    calendarTitle.textContent = `${currentWeekStartDate.toDateString()} - ${endOfWeek.toDateString()}`;

    // Clear previous content
    calendarBody.innerHTML = '';
    const headerRow = document.querySelector('#scheduleTable thead tr');
    headerRow.innerHTML = '<th>Employee</th>';

    // Generate headers for each day of the week
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(currentWeekStartDate);
        day.setDate(day.getDate() + i);
        weekDays.push(day);

        const th = document.createElement('th');
        th.textContent = day.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
        headerRow.appendChild(th);
    }

    // Fetch schedule data for the current week
    fetchSchedule(currentWeekStartDate, endOfWeek, weekDays);
}

function populateScheduleTable(data, startDate) {
    const table = document.getElementById('scheduleTable');
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = ''; // Clear previous content

    data.forEach(employee => {
        const row = document.createElement('tr');
        const nameCell = document.createElement('td');
        nameCell.textContent = employee.FullName;
        row.appendChild(nameCell);

        for (let i = 0; i < 7; i++) {
            const cell = document.createElement('td');
            const currentDate = new Date(startDate);
            currentDate.setDate(currentDate.getDate() + i);
            const dateStr = currentDate.toISOString().split('T')[0];

            const scheduleForDay = employee.schedules.find(s => s.date.startsWith(dateStr));
            if (scheduleForDay) {
                cell.innerHTML = `
                    <div>${scheduleForDay.ShiftType}</div>
                    <div>${scheduleForDay.StartTime} - ${scheduleForDay.EndTime}</div>
                    <div>${scheduleForDay.Position}</div>
                `;
                cell.classList.add('scheduled-cell');
            } else {
                cell.innerHTML = `<div>Off</div>`;
                cell.classList.add('off-cell');
            }
            row.appendChild(cell);
        }
        tbody.appendChild(row);
    });
}

function fetchSchedule(startDate, endDate, weekDays) {
    fetch(`/api/schedule?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`)
        .then(response => response.json())
        .then(data => {
            const calendarBody = document.getElementById('calendarBody');

            data.forEach(employee => {
                const row = document.createElement('tr');
                
                // Employee Name Cell
                const nameCell = document.createElement('td');
                nameCell.textContent = employee.FullName;
                nameCell.classList.add('employee-name');
                row.appendChild(nameCell);

                // Schedule Cells for each day of the week
                weekDays.forEach(day => {
                    const cell = document.createElement('td');
                    const dateString = day.toISOString().split('T')[0];

                    const shift = employee.schedules.find(s => s.date === dateString);
                    if (shift) {
                        const shiftDiv = document.createElement('div');
                        shiftDiv.classList.add('shift');
                        shiftDiv.textContent = `${shift.Position}: ${shift.StartTime} - ${shift.EndTime}`;
                        cell.appendChild(shiftDiv);
                    }
                    row.appendChild(cell);
                });

                calendarBody.appendChild(row);
                populateScheduleTable(data, startDate);
            });
        })
        .catch(error => console.error('Error fetching schedule:', error));
}

// Handle the pop-up form visibility
function showAddAvailabilityForm() {
    document.getElementById('availabilityFormPopup').style.display = 'flex';
}

function closeAddAvailabilityForm() {
    document.getElementById('availabilityFormPopup').style.display = 'none';
}

// Handle form submission
function submitAvailabilityForm() {
    const formData = {
        employeeID: document.getElementById('employeeID').value,
        availableDays: Array.from(document.querySelectorAll('#availableDays input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value), // Collect selected days
        shiftType: document.getElementById('shiftType').value,
    };

    fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Availability added successfully');
                closeAddAvailabilityForm();
                renderCalendar(); // Refresh the calendar to reflect new data
            } else {
                alert('Error adding availability');
            }
        })
        .catch(error => console.error('Error:', error));
}


document.addEventListener('DOMContentLoaded', renderCalendar);

fetchSchedule(currentWeekStartDate, new Date(currentWeekStartDate), new Date(currentWeekStartDate));