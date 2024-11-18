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

function showGenerateScheduleModal() {
    fetch('/api/availability')
        .then(response => response.json())
        .then(data => {
            Object.keys(data).forEach(day => {
                const container = document.getElementById(day);
                container.innerHTML = ''; // Clear previous content
                data[day].forEach(employee => {
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.value = employee.ID;
                    checkbox.id = `${day}-${employee.ID}`;

                    const label = document.createElement('label');
                    label.htmlFor = `${day}-${employee.ID}`;
                    label.textContent = employee.FullName;

                    // Ensure checkbox comes before the label
                    const listItem = document.createElement('div');
                    listItem.className = 'employee-item'; // Scoped styling will apply
                    listItem.appendChild(checkbox);
                    listItem.appendChild(label);

                    container.appendChild(listItem);
                });

                // Show only Monday's list initially
                if (day === 'Monday') {
                    container.style.display = 'block';
                } else {
                    container.style.display = 'none';
                }
            });

            document.getElementById('generateScheduleModal').style.display = 'flex';
        })
        .catch(error => console.error('Error fetching availability:', error));
}


function closeGenerateScheduleModal() {
    document.getElementById('generateScheduleModal').style.display = 'none';
}

function openTab(event, day) {
    const tabContents = document.querySelectorAll('.tabcontent');
    tabContents.forEach(tab => tab.style.display = 'none');

    const tabLinks = document.querySelectorAll('.tablink');
    tabLinks.forEach(link => link.classList.remove('active'));

    document.getElementById(day).style.display = 'block';
    event.currentTarget.classList.add('active');
}

function generateSchedule() {
    const schedule = {};
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Collect selected employees for each day
    days.forEach(day => {
        const selectedEmployees = Array.from(document.querySelectorAll(`#${day} input:checked`))
            .map(checkbox => {
                return {
                    ID: checkbox.value,
                    FullName: checkbox.nextElementSibling.textContent // Extract the employee's name from the label
                };
            });

        schedule[day] = selectedEmployees;
    });

    // Prepare data in the format required for `populateScheduleTable`
    const employees = [];

    // Combine all selected employees into a single array
    const employeeMap = new Map(); // Use Map to avoid duplicate entries
    days.forEach(day => {
        schedule[day].forEach(employee => {
            if (!employeeMap.has(employee.ID)) {
                employeeMap.set(employee.ID, {
                    ID: employee.ID,
                    FullName: employee.FullName,
                    schedules: []
                });
            }
            // Add the schedule for the day
            employeeMap.get(employee.ID).schedules.push({
                date: day, // Add the day of the week as the schedule "date"
                ShiftType: 'Scheduled' // Placeholder to indicate the employee is scheduled
            });
        });
    });

    employees.push(...employeeMap.values());

    // Populate the table with the generated schedule
    populateScheduleTable(employees, currentWeekStartDate);

    closeGenerateScheduleModal();
}


document.addEventListener('DOMContentLoaded', () => {
    renderCalendar(); // Correctly initializes the calendar
    // Ensure no code unintentionally calls showGenerateScheduleModal
    fetchSchedule(currentWeekStartDate, new Date(currentWeekStartDate), new Date(currentWeekStartDate));
});
