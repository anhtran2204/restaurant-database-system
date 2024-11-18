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
    const headerRow = document.querySelector('#scheduleTable thead tr');

    // Clear previous header content
    headerRow.innerHTML = '<th>Employee</th>'; // Add the "Employee" column label

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(currentWeekStartDate);
        day.setDate(day.getDate() + i);
        weekDays.push(day);

        const th = document.createElement('th');
        th.textContent = day.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
        headerRow.appendChild(th);
    }

    // Update calendar title
    const endOfWeek = new Date(currentWeekStartDate);
    endOfWeek.setDate(currentWeekStartDate.getDate() + 6);
    calendarTitle.textContent = `${currentWeekStartDate.toDateString()} - ${endOfWeek.toDateString()}`;

    // Clear body content and fetch new data
    calendarBody.innerHTML = '';
    fetchSchedule(currentWeekStartDate);
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
                    <div class="schedule-content">
                        <div>${scheduleForDay.ShiftType}</div>
                        <div>${scheduleForDay.StartTime} - ${scheduleForDay.EndTime}</div>
                        <div>${scheduleForDay.Position}</div>
                    </div>
                `;
                cell.classList.add('scheduled-cell');
            } else {
                cell.innerHTML = `<div class="off-content">Off</div>`;
                cell.classList.add('off-cell');
            }
            row.appendChild(cell);
        }
        tbody.appendChild(row);
    });
}


function fetchSchedule(startDate) {
    const weekStartDate = startDate.toISOString().split('T')[0];

    fetch(`/api/schedule?weekStartDate=${weekStartDate}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error fetching schedule:', data.error);
                return;
            }
            populateScheduleTable(data, startDate);
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
            .map(checkbox => ({
                ID: checkbox.value,
                FullName: checkbox.nextElementSibling.textContent // Employee name
            }));

        schedule[day] = selectedEmployees;
    });

    // Prepare schedule data for the backend
    const weekStartDate = currentWeekStartDate.toISOString().split('T')[0];
    const scheduleEntries = [];
    days.forEach((day, index) => {
        const dayDate = new Date(currentWeekStartDate);
        dayDate.setDate(currentWeekStartDate.getDate() + index); // Get the date for each day

        schedule[day].forEach(employee => {
            scheduleEntries.push({
                EmployeeID: employee.ID,
                AvDate: dayDate.toISOString().split('T')[0],
                StartTime: '09:00:00', // Example start time
                EndTime: '17:00:00',  // Example end time
                ShiftType: 'Morning'  // Example shift type
            });
        });
    });

    // Send schedule data to the backend
    const promises = scheduleEntries.map(entry =>
        fetch('/api/schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry)
        })
    );

    Promise.all(promises)
        .then(() => {
            console.log('Schedule saved successfully.');
            renderCalendar(); // Reload the calendar to reflect changes
            closeGenerateScheduleModal();
        })
        .catch(error => console.error('Error saving schedule:', error));
}



document.addEventListener('DOMContentLoaded', () => {
    renderCalendar(); // Correctly initializes the calendar
    // Ensure no code unintentionally calls showGenerateScheduleModal
    fetchSchedule(currentWeekStartDate, new Date(currentWeekStartDate), new Date(currentWeekStartDate));
});
