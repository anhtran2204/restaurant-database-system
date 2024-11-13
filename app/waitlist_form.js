function fetchWaitlist() {
    fetch('/api/waitlist')
        .then(response => response.json())
        .then(data => {
            const tbody = document.querySelector('#waitlistTable tbody');
            tbody.innerHTML = '';
            data.forEach(entry => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${entry.WaitlistID}</td>
                    <td>${entry.WaitName}</td>
                    <td>${entry.HostID}</td>
                    <td>
                        <button onclick="deleteWaitlist(${entry.WaitlistID})">Delete</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching waitlist:', error));
}

function saveWaitlistEntry() {
    const waitlistData = {
        WaitlistID: document.getElementById('waitlistID').value,
        WaitName: document.getElementById('waitName').value,
        HostID: document.getElementById('hostID').value
    };

    fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(waitlistData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Waitlist entry added successfully');
            fetchWaitlist();
        } else {
            alert('Error adding waitlist entry');
        }
    })
    .catch(error => console.error('Error saving waitlist entry:', error));
}

function deleteWaitlist(waitlistID) {
    fetch(`/api/waitlist/${waitlistID}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert('Waitlist entry deleted successfully');
            fetchWaitlist();
        } else {
            alert('Error deleting waitlist entry');
        }
    })
    .catch(error => console.error('Error deleting waitlist entry:', error));
}
