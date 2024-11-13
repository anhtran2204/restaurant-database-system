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
            });
        })
        .catch(error => console.error('Error fetching schedule:', error));
}

document.addEventListener('DOMContentLoaded', renderCalendar);
