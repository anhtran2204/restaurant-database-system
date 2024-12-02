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

        // Add employee name
        const nameCell = document.createElement('td');
        nameCell.textContent = employee.FullName;
        row.appendChild(nameCell);

        // Add schedule for each day of the week
        for (let i = 0; i < 7; i++) {
            const dayCell = document.createElement('td');
            const currentDate = new Date(startDate);
            currentDate.setDate(currentDate.getDate() + i);
            const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' });

            const schedule = employee.schedules[i];
            if (schedule && schedule.startTime) {
                // Add editable schedule information
                dayCell.innerHTML = `
                    <div class="schedule-content">
                        <div>${schedule.shiftType}</div>
                        <div>${schedule.startTime} - ${schedule.endTime}</div>
                        <div>${schedule.position || 'No Position'}</div>
                        <button onclick="openEditScheduleModal(
                            '${employee.ID}', 
                            '${dayOfWeek}', 
                            '${schedule.shiftType}', 
                            '${schedule.startTime}', 
                            '${schedule.endTime}', 
                            '${schedule.position || ''}'
                        )">Edit</button>
                        <button onclick="removeEmployeeFromSchedule(
                            '${employee.ID}', 
                            '${dayOfWeek}'
                        )">Remove</button>
                    </div>
                `;
                dayCell.classList.add('scheduled-cell');
            } else {
                // Add "Off" for empty schedule
                dayCell.innerHTML = `<div class="off-content">Off</div>`;
                dayCell.classList.add('off-cell');
            }

            row.appendChild(dayCell);
        }

        tbody.appendChild(row);
    });
}

// Fetch unique locationIDs and populate dropdown
function loadLocationFilter() {
    fetch('/api/schedule/locations')
        .then(response => response.json())
        .then(locations => {
            const locationFilter = document.getElementById('locationFilter');
            locationFilter.innerHTML = ''; // Clear existing options

            // Add "All Locations" option (if needed)
            const allOption = document.createElement('option');
            allOption.value = '';
            allOption.textContent = 'All Locations';
            locationFilter.appendChild(allOption);

            // Add options for each location
            locations.forEach(location => {
                const option = document.createElement('option');
                option.value = location.LocationID;
                option.textContent = `Location ${location.LocationID}`;
                locationFilter.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching locations:', error));
}

function fetchSchedule(startDate) {
    const locationID = document.getElementById('locationFilter').value; // Get selected location
    const weekStartDate = currentWeekStartDate.toISOString().split('T')[0]; // Current week start date

    const fetchUrl = locationID
        ? `/api/schedule?weekStartDate=${weekStartDate}&locationID=${locationID}`
        : `/api/schedule?weekStartDate=${weekStartDate}`;

    fetch(fetchUrl)
        .then(response => response.json())
        .then(data => {
            console.log('Fetched schedule data:', data); // Debugging log
            if (data.error) {
                console.error('Error fetching schedule:', data.error);
                return;
            }
            populateScheduleTable(data, startDate);
        })
        .catch(error => console.error('Error fetching schedule:', error));
}

function showGenerateScheduleModal() {
    const locationID = document.getElementById('locationFilter').value;

    if (!locationID) {
        alert('Please select a location to generate a schedule.');
        return;
    }

    // Fetch employee availability from the API
    fetch(`/api/employees?locationID=${locationID}`)
        .then(response => response.json())
        .then(employees => {
            if (employees.error) {
                console.error('Error fetching employees:', employees.error);
                return;
            }

            // Populate each tab with available employees
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            days.forEach(day => {
                const tabContent = document.getElementById(day);
                tabContent.innerHTML = ''; // Clear existing content

                employees.forEach(employee => {
                    const availableDays = employee.AvailableDays.split(',');
                    if (availableDays.includes(day)) {
                        const checkbox = document.createElement('input');
                        checkbox.type = 'checkbox';
                        checkbox.value = JSON.stringify({
                            id: employee.ID,
                            fullName: employee.fname + ' ' + employee.lname,
                            position: employee.position,
                            ShiftType: employee.ShiftType,
                            startTime: employee.StartTime,
                            endTime: employee.EndTime
                        });
                        checkbox.name = 'employee';

                        const label = document.createElement('label');
                        label.textContent = `
                            ${employee.fname} 
                            ${employee.lname} 
                            (${employee.ShiftType})`;

                        const container = document.createElement('div');
                        container.appendChild(checkbox);
                        container.appendChild(label);

                        tabContent.appendChild(container);
                    }
                });
            });

            // Display the modal
            document.getElementById('generateScheduleModal').style.display = 'flex';

            // Add event listener for clicks outside the modal
            document.addEventListener('click', closeModalOnOutsideClick);
        })
        .catch(error => console.error('Error fetching employees:', error));
}

function closeGenerateScheduleModal() {
    const modal = document.getElementById('generateScheduleModal');
    modal.style.display = 'none';
    document.getElementById('editEmployeeForm').reset();
    // Remove the event listener to prevent memory leaks
    document.removeEventListener('click', closeModalOnOutsideClick);
}

function generateSchedule() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const scheduleData = [];

    days.forEach(day => {
        const tabContent = document.getElementById(day);
        const selectedEmployees = tabContent.querySelectorAll('input[type="checkbox"]:checked');

        selectedEmployees.forEach(checkbox => {
            const employeeData = JSON.parse(checkbox.value);
            scheduleData.push({
                id: employeeData.id,
                weekStartDate: currentWeekStartDate.toISOString().split('T')[0], // Include weekStartDate
                day,
                startTime: employeeData.startTime || '09:00:00', // Default value
                endTime: employeeData.endTime || '17:00:00', // Default value
                ShiftType: employeeData.ShiftType,
                position: employeeData.position
            });
        });
    });

    // Send the generated schedule data to the server
    fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedule: scheduleData })
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error generating schedule:', data.error);
                return;
            }

            console.log('Schedule successfully generated:', data.message);

            // Refresh the calendar view
            fetchSchedule(currentWeekStartDate);
            closeGenerateScheduleModal();
        })
        .catch(error => console.error('Error posting schedule:', error));
}

function openEditScheduleModal(employeeID, dayOfWeek, shiftType, startTime, endTime, position) {
    const modal = document.getElementById('editScheduleModal');
    modal.style.display = 'flex';

    // Populate modal fields with the selected shift data
    document.getElementById('editEmployeeID').value = employeeID;
    document.getElementById('editDayOfWeek').value = dayOfWeek;
    document.getElementById('editShiftType').value = shiftType;
    document.getElementById('editStartTime').value = startTime;
    document.getElementById('editEndTime').value = endTime;
    document.getElementById('editPosition').value = position || '';
}

function closeEditScheduleModal() {
    const modal = document.getElementById('editScheduleModal');
    modal.style.display = 'none';
    document.removeEventListener('click', closeModalOnOutsideClick);
}

function removeEmployeeFromSchedule(employeeID, dayOfWeek) {
    if (confirm('Are you sure you want to remove this employee from the schedule?')) {
        fetch(`/api/schedule/${employeeID}/${dayOfWeek}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeID, dayOfWeek, weekStartDate: currentWeekStartDate.toISOString().split('T')[0] })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Employee removed from the schedule successfully!');
                fetchSchedule(currentWeekStartDate); // Refresh schedule
            } else {
                console.error('Failed to remove employee:', data.error);
            }
        })
        .catch(error => console.error('Error removing employee:', error));
    }
}

function updateSchedule() {
    event.preventDefault();

    const employeeID = document.getElementById('editEmployeeID').value;
    const dayOfWeek = document.getElementById('editDayOfWeek').value;
    const shiftType = document.getElementById('editShiftType').value;
    const startTime = document.getElementById('editStartTime').value;
    const endTime = document.getElementById('editEndTime').value;
    const position = document.getElementById('editPosition').value;

    fetch(`/api/schedule/${employeeID}/${dayOfWeek}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            employeeID,
            weekStartDate: currentWeekStartDate.toISOString().split('T')[0],
            dayOfWeek,
            shiftType,
            startTime,
            endTime,
            position
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Schedule updated successfully!');
            closeEditScheduleModal();
            fetchSchedule(currentWeekStartDate); // Refresh schedule
        } else {
            console.error('Failed to update schedule:', data.error);
        }
    })
    .catch(error => console.error('Error updating schedule:', error));
}

function openTab(event, day) {
    const tabContents = document.querySelectorAll('.tabcontent');
    tabContents.forEach(tab => tab.style.display = 'none');

    const tabLinks = document.querySelectorAll('.tablink');
    tabLinks.forEach(link => link.classList.remove('active'));

    document.getElementById(day).style.display = 'block';
    event.currentTarget.classList.add('active');
}

function closeModalOnOutsideClick(event) {
    const generateModal = document.getElementById('generateScheduleModal');
    const editmodal = document.getElementById('editScheduleModal');
    const modalContent = document.querySelector('.popup-content');

    // Check if the clicked target is the modal overlay but not the modal content
    if (event.target === editmodal) {
        closeEditScheduleModal();
    }

    if (event.target === generateModal) {
        closeGenerateScheduleModal();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadLocationFilter()
    renderCalendar(); // Correctly initializes the calendar
    // Ensure no code unintentionally calls showGenerateScheduleModal
    fetchSchedule(currentWeekStartDate, new Date(currentWeekStartDate), new Date(currentWeekStartDate));
});
