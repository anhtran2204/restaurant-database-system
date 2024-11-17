const express = require('express');
const mysql = require('mysql');
const app = express();
const PORT = 8080;

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files (HTML, CSS, JS)
app.use(express.static('app'));

// MySQL Connection Setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'rootpassword',
    database: 'Restaurant'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.stack);
        return;
    }
    console.log('Connected to the database.');
});

// CRUD for Employees
app.get('/api/employees', (req, res) => {
    const sql = 'SELECT * FROM Employees';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Database query failed' });
        res.json(results);
    });
});

// Get a single employee by ID
app.get('/api/employees/:id', (req, res) => {
    const { id } = req.params;

    db.query('SELECT * FROM Employees WHERE ID = ?', [id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query failed.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Employee not found.' });
        }

        res.json(results[0]);
    });
});

app.post('/api/employees', (req, res) => {
    const { ID, fname, minit, lname, dob, position, hoursPerWeek, Salary, Rate } = req.body;

    if (!ID || !fname || !lname || !dob || !position) {
        return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    const formattedDOB = new Date(dob).toISOString().split('T')[0];

    const sql = `
        INSERT INTO Employees (ID, fname, minit, lname, dob, position, hoursPerWeek, Salary, Rate) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [ID, fname, minit || null, lname, formattedDOB, position, hoursPerWeek || null, Salary || null, Rate || null];

    db.query(sql, params, (err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ status: 'error', message: 'Database error' });
        } else {
            res.json({ status: 'success', message: 'Employee added successfully' });
        }
    });
});


app.put('/api/employees/:id', (req, res) => {
    const employeeID = req.params.id;
    const { fname, minit, lname, dob, position, hoursPerWeek, salary, rate } = req.body;

    const sql = `
        UPDATE Employees 
        SET fname = ?, minit = ?, lname = ?, dob = ?, position = ?, hoursPerWeek = ?, Salary = ?, Rate = ?
        WHERE ID = ?
    `;

    db.query(
        sql,
        [fname, minit, lname, dob, position, hoursPerWeek, salary, rate, employeeID],
        (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).json({ error: 'Failed to update employee' });
            } else {
                res.json({ status: 'success' });
            }
        }
    );
});


app.delete('/api/employees/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM Employees WHERE ID = ?', id, err => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Employee deleted successfully' });
    });
});

// CRUD for Clocked_Times
app.get('/api/worktimes', (req, res) => {
    const sql = `
        SELECT 
            Clocked_Times.EmployeeID AS EmpID,
            CONCAT(Employees.fname, ' ', Employees.lname) AS FullName,
            ClockedStart,
            ClockedEnd
        FROM Clocked_Times
        JOIN Employees ON Clocked_Times.EmployeeID = Employees.ID;
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query failed.' });
        }
        res.json(results);
    });
});

// POST a new worktime
app.post('/api/worktimes', (req, res) => {
    const { EmpID, FullName, ClockedStart, ClockedEnd } = req.body;
    if (!EmpID || !ClockedStart || !ClockedEnd) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const sql = `
        INSERT INTO Clocked_Times (EmployeeID, ClockedStart, ClockedEnd)
        VALUES (?, ?, ?);
    `;

    db.query(sql, [EmpID, ClockedStart, ClockedEnd], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query failed.' });
        }
        res.json({ status: 'success', message: 'Worktime added successfully.' });
    });
});

// PUT to update a worktime
app.put('/api/worktimes/:clockID', (req, res) => {
    const { clockID } = req.params;
    const { EmpID, ClockedStart, ClockedEnd } = req.body;

    if (!clockID || !EmpID || !ClockedStart || !ClockedEnd) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const sql = `
        UPDATE Clocked_Times
        SET EmployeeID = ?, ClockedStart = ?, ClockedEnd = ?
        WHERE ClockID = ?;
    `;

    db.query(sql, [EmpID, ClockedStart, ClockedEnd, clockID], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query failed.' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Worktime not found.' });
        }
        res.json({ status: 'success', message: 'Worktime updated successfully.' });
    });
});

// DELETE a worktime
app.delete('/api/worktimes/:clockID', (req, res) => {
    const { clockID } = req.params;

    const sql = `
        DELETE FROM Clocked_Times
        WHERE ClockID = ?;
    `;

    db.query(sql, [clockID], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query failed.' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Worktime not found.' });
        }
        res.json({ status: 'success', message: 'Worktime deleted successfully.' });
    });
});

// CRUD for Schedule
app.get('/api/schedule', (req, res) => {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required.' });
    }

    const sql = `
        SELECT 
            e.ID AS EmployeeID,
            CONCAT(e.fname, ' ', e.lname) AS FullName,
            s.AvDate AS Date,
            s.StartTime,
            s.EndTime,
            s.ShiftType,
            e.position AS Position
        FROM Employees e
        LEFT JOIN Schedule s ON e.ID = s.EmployeeID
        WHERE s.AvDate BETWEEN ? AND ?
        ORDER BY e.ID, s.AvDate;
    `;

    db.query(sql, [startDate, endDate], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query failed.' });
        }

        // Initialize groupedData here
        const groupedData = results.reduce((acc, row) => {
            const employee = acc.find(e => e.EmployeeID === row.EmployeeID);

            if (employee) {
                employee.schedules.push({
                    date: row.Date,
                    StartTime: row.StartTime,
                    EndTime: row.EndTime,
                    ShiftType: row.ShiftType,
                    Position: row.Position,
                });
            } else {
                acc.push({
                    EmployeeID: row.EmployeeID,
                    FullName: row.FullName,
                    schedules: [
                        {
                            date: row.Date,
                            StartTime: row.StartTime,
                            EndTime: row.EndTime,
                            ShiftType: row.ShiftType,
                            Position: row.Position,
                        },
                    ],
                });
            }

            return acc;
        }, []);

        // console.log('Grouped Data:', groupedData); // Log groupedData for debugging
        res.json(groupedData);
    });
});


app.post('/api/schedule', (req, res) => {
    const { EmployeeID, AvDate, StartTime, EndTime, Status } = req.body;
    db.query('INSERT INTO Schedule (EmployeeID, AvDate, StartTime, EndTime, ShiftType) VALUES (?, ?, ?, ?, ?)', 
        [EmployeeID, AvDate, StartTime, EndTime, ShiftType], (err) => {
        if (err) throw err;
        res.json({ status: 'success' });
    });
});

app.put('/api/schedule/:id', (req, res) => {
    const { AvDate, StartTime, EndTime, Status } = req.body;
    const { id } = req.params;
    db.query('UPDATE Schedule SET AvDate = ?, StartTime = ?, EndTime = ?, Status = ? WHERE EntryID = ?', 
        [AvDate, StartTime, EndTime, Status, id], (err) => {
        if (err) throw err;
        res.json({ status: 'success' });
    });
});

app.delete('/api/schedule/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM Schedule WHERE EntryID = ?', id, (err) => {
        if (err) throw err;
        res.json({ status: 'success' });
    });
});

// CRUD for Availability
app.post('/api/availability', (req, res) => {
    const { employeeID, availableDates, shiftType } = req.body;

    const queries = availableDates.map(date => {
        const [startTime, endTime] = shiftType === 'Morning' 
            ? ['10:00:00', '16:00:00'] 
            : ['16:00:00', '22:00:00'];

        return db.query(
            `INSERT INTO Schedule (EmployeeID, AvDate, StartTime, EndTime, Status) VALUES (?, ?, ?, ?, 'Available')`,
            [employeeID, date, startTime, endTime],
        );
    });

    Promise.all(queries)
        .then(() => res.json({ status: 'success' }))
        .catch(err => res.status(500).json({ status: 'error', message: err.message }));
});

// CRUD for Menu_item
app.get('/api/menu', (req, res) => {
    db.query('SELECT * FROM Menu_item', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.post('/api/menu', (req, res) => {
    const { Mname, Price, Recipe, Descr } = req.body;
    db.query('INSERT INTO Menu_item (Mname, Price, Recipe, Descr) VALUES (?, ?, ?, ?)', 
        [Mname, Price, Recipe, Descr], (err) => {
        if (err) throw err;
        res.json({ status: 'success' });
    });
});

app.put('/api/menu/:name', (req, res) => {
    const { Price, Recipe, Descr } = req.body;
    const { name } = req.params;
    db.query('UPDATE Menu_item SET Price = ?, Recipe = ?, Descr = ? WHERE Mname = ?', 
        [Price, Recipe, Descr, name], (err) => {
        if (err) throw err;
        res.json({ status: 'success' });
    });
});

app.delete('/api/menu/:name', (req, res) => {
    const { name } = req.params;
    db.query('DELETE FROM Menu_item WHERE Mname = ?', name, (err) => {
        if (err) throw err;
        res.json({ status: 'success' });
    });
});

// CRUD for Reservation
app.get('/api/reservations', (req, res) => {
    db.query('SELECT ResID, ResName, ResInfo, HostID FROM Reservation', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.post('/api/reservations', (req, res) => {
    const { ResName, ResInfo, HostID } = req.body;
    db.query('INSERT INTO Reservation (ResName, ResInfo, HostID) VALUES (?, ?, ?)', 
        [ResName, ResInfo, HostID], (err) => {
        if (err) throw err;
        res.json({ status: 'success' });
    });
});

app.put('/api/reservations/:id', (req, res) => {
    const { ResName, ResInfo, HostID } = req.body;
    const { id } = req.params;
    db.query('UPDATE Reservation SET ResName = ?, ResInfo = ?, HostID = ? WHERE ResID = ?', 
        [ResName, ResInfo, HostID, id], (err) => {
        if (err) throw err;
        res.json({ status: 'success' });
    });
});

app.delete('/api/reservations/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM Reservation WHERE ResID = ?', id, (err) => {
        if (err) throw err;
        res.json({ status: 'success' });
    });
});

// CRUD for Waitlist
app.get('/api/waitlist', (req, res) => {
    db.query('SELECT * FROM Waitlist', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.post('/api/waitlist', (req, res) => {
    const { WaitlistID, WaitName, PhoneNumber, PartySize, HostID } = req.body;

    if (!WaitlistID || !WaitName || !PhoneNumber || !PartySize || !HostID) {
        return res.status(400).json({ status: 'error', message: 'All fields are required' });
    }

    const sql = `
        INSERT INTO Waitlist (WaitlistID, WaitName, PhoneNumber, PartySize, HostID)
        VALUES (?, ?, ?, ?, ?);
    `;
    db.query(sql, [WaitlistID, WaitName, PhoneNumber, PartySize, HostID], (err) => {
        if (err) throw err;
        res.json({ status: 'success' });
    });
});

app.put('/api/waitlist/:id', (req, res) => {
    const { id } = req.params;
    const { WaitName, PhoneNumber, PartySize, HostID } = req.body;

    const sql = `
        UPDATE Waitlist
        SET WaitName = ?, PhoneNumber = ?, PartySize = ?, HostID = ?
        WHERE WaitlistID = ?;
    `;
    db.query(sql, [WaitName, PhoneNumber, PartySize, HostID, id], (err) => {
        if (err) throw err;
        res.json({ status: 'success' });
    });
});

app.delete('/api/waitlist/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM Waitlist WHERE WaitlistID = ?', id, (err) => {
        if (err) throw err;
        res.json({ status: 'success' });
    });
});

// CRUD for Inventory
app.get('/api/inventory', (req, res) => {
    const sql = `
        SELECT 
            IngredientID, 
            IngredientName, 
            LocationID, 
            Quantity, 
            Expiration 
        FROM Ingredient_inventory;
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching inventory:', err);
            return res.status(500).json({ error: 'Database query failed.' });
        }
        res.json(results);
    });
});

// POST a new inventory item
app.post('/api/inventory', (req, res) => {
    const { IngredientID, IngredientName, LocationID, Quantity, Expiration } = req.body;

    if (!IngredientID || !IngredientName || !LocationID || !Quantity || !Expiration) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const sql = `
        INSERT INTO Ingredient_inventory (IngredientID, IngredientName, LocationID, Quantity, Expiration)
        VALUES (?, ?, ?, ?, ?);
    `;

    db.query(sql, [IngredientID, IngredientName, LocationID, Quantity, Expiration], (err) => {
        if (err) {
            console.error('Error saving inventory item:', err);
            return res.status(500).json({ error: 'Database insert failed.' });
        }
        res.json({ status: 'success', message: 'Inventory item added successfully' });
    });
});

// DELETE an inventory item
app.delete('/api/inventory/:ingredientID/:locationID', (req, res) => {
    const { ingredientID, locationID } = req.params;

    const sql = `
        DELETE FROM Ingredient_inventory
        WHERE IngredientID = ? AND LocationID = ?;
    `;

    db.query(sql, [ingredientID, locationID], (err) => {
        if (err) {
            console.error('Error deleting inventory item:', err);
            return res.status(500).json({ error: 'Database delete failed.' });
        }
        res.json({ status: 'success', message: 'Inventory item deleted successfully' });
    });
});

// PUT to update an inventory item
app.put('/api/inventory/:ingredientID/:locationID', (req, res) => {
    const { ingredientID, locationID } = req.params;
    const { Quantity, Expiration } = req.body;

    if (Quantity === undefined || !Expiration) {
        return res.status(400).json({ error: 'Quantity and Expiration are required.' });
    }

    const sql = `
        UPDATE Ingredient_inventory
        SET Quantity = ?, Expiration = ?
        WHERE IngredientID = ? AND LocationID = ?;
    `;

    db.query(sql, [Quantity, Expiration, ingredientID, locationID], (err) => {
        if (err) {
            console.error('Error updating inventory item:', err);
            return res.status(500).json({ error: 'Database update failed.' });
        }
        res.json({ status: 'success', message: 'Inventory item updated successfully' });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
