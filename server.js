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
    const sql = `
        SELECT * FROM Employees e
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Database query failed' });
        res.json(results);
    });
});

app.get('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT *
        FROM Employees e
        WHERE e.ID = ?
    `;
    db.query(sql, [id], (err, results) => {
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
    const { ID, fname, minit, lname, dob, position, hoursPerWeek, Salary, Rate, availableDays, shiftType } = req.body;

    if (!ID || !fname || !lname || !dob || !position) {
        return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    const formattedDOB = new Date(dob).toISOString().split('T')[0];

    const insertEmployee = `
        INSERT INTO Employees (ID, fname, minit, lname, dob, position, hoursPerWeek, Salary, Rate) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const insertAvailability = `
        INSERT INTO Availability (EmployeeID, AvailableDays, ShiftType) 
        VALUES (?, ?, ?)
    `;

    const params = [ID, fname, minit || null, lname, formattedDOB, position, hoursPerWeek || null, Salary || null, Rate || null];

    db.query(insertEmployee, params, (err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ status: 'error', message: 'Database error' });
        } else {
            db.query(insertAvailability, [ID, availableDays || '', shiftType || ''], (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ status: 'error', message: 'Failed to save availability' });
                } else {
                    res.json({ status: 'success', message: 'Employee added successfully' });
                }
            });
        }
    });
});

app.put('/api/employees/:id', (req, res) => {
    const employeeID = req.params.id;
    const { fname, minit, lname, dob, position, hoursPerWeek, salary, rate, availableDays, shiftType } = req.body;

    const updateEmployee = `
        UPDATE Employees 
        SET fname = ?, minit = ?, lname = ?, dob = ?, position = ?, hoursPerWeek = ?, Salary = ?, Rate = ?
        WHERE ID = ?
    `;
    const updateAvailability = `
        UPDATE Availability 
        SET AvailableDays = ?, ShiftType = ? 
        WHERE EmployeeID = ?
    `;

    const params = [fname, minit, lname, dob, position, hoursPerWeek, salary, rate];

    db.query(updateEmployee, [...params, employeeID], (err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to update employee' });
        } else {
            db.query(updateAvailability, [availableDays, shiftType, employeeID], (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: 'Failed to update availability' });
                } else {
                    res.json({ status: 'success' });
                }
            });
        }
    });
});

app.delete('/api/employees/:id', (req, res) => {
    const { id } = req.params;

    const deleteAvailability = 'DELETE FROM Availability WHERE EmployeeID = ?';
    const deleteEmployee = 'DELETE FROM Employees WHERE ID = ?';

    db.query(deleteAvailability, id, (err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to delete availability' });
        } else {
            db.query(deleteEmployee, id, (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: 'Failed to delete employee' });
                } else {
                    res.json({ message: 'Employee deleted successfully' });
                }
            });
        }
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

app.get('/api/worktimes/:empID', (req, res) => {
    const { empID } = req.params;

    const sql = `
        SELECT EmployeeID AS EmpID, CONCAT(fname, ' ', lname) AS FullName, ClockedStart, ClockedEnd
        FROM Clocked_Times
        JOIN Employees ON Clocked_Times.EmployeeID = Employees.ID
        WHERE EmployeeID = ?
    `;

    db.query(sql, [empID], (err, results) => {
        if (err) {
            console.error('Error fetching worktime:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Worktime not found' });
        }

        res.json(results[0]);
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
app.put('/api/worktimes/:empID', (req, res) => {
    const { empID } = req.params;
    const { ClockedStart, ClockedEnd } = req.body;

    if (!empID || !ClockedStart || !ClockedEnd) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const sql = `
        UPDATE Clocked_Times
        SET ClockedStart = ?, ClockedEnd = ?
        WHERE EmployeeID = ?;
    `;

    db.query(sql, [ClockedStart, ClockedEnd, empID], (err, results) => {
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
app.delete('/api/worktimes/:empID', (req, res) => {
    const { empID } = req.params;

    const sql = `
        DELETE FROM Clocked_Times
        WHERE EmployeeID = ?;
    `;

    db.query(sql, [empID], (err, results) => {
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
    const { weekStartDate } = req.query;

    if (!weekStartDate) {
        return res.status(400).json({ error: 'Missing weekStartDate query parameter' });
    }

    const sql = `
        SELECT 
            e.ID AS EmployeeID,
            CONCAT(e.fname, ' ', e.lname) AS FullName,
            s.WeekStartDate,
            s.DayOfWeek,
            s.StartTime,
            s.EndTime,
            s.ShiftType,
            s.position
        FROM Employees e
        LEFT JOIN Schedule s ON e.ID = s.EmployeeID AND s.WeekStartDate = ?
        ORDER BY e.ID, FIELD(s.DayOfWeek, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
    `;

    db.query(sql, [weekStartDate], (err, results) => {
        if (err) {
            console.error('Error fetching schedule:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }

        // Group data by employee
        const employees = [];
        const employeeMap = {};

        results.forEach(row => {
            if (!employeeMap[row.EmployeeID]) {
                const employee = {
                    ID: row.EmployeeID,
                    FullName: row.FullName,
                    schedules: Array(7).fill({ day: null, startTime: null, endTime: null, shiftType: null, position: null })
                };
                employees.push(employee);
                employeeMap[row.EmployeeID] = employee;
            }

            if (row.DayOfWeek) {
                const dayIndex = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(row.DayOfWeek);
                employeeMap[row.EmployeeID].schedules[dayIndex] = {
                    day: row.DayOfWeek,
                    startTime: row.StartTime,
                    endTime: row.EndTime,
                    shiftType: row.ShiftType,
                    position: row.position
                };
            }
        });

        res.json(employees);
    });
});

app.post('/api/schedule', (req, res) => {
    const { schedule } = req.body;

    if (!Array.isArray(schedule) || schedule.length === 0) {
        return res.status(400).json({ error: 'Schedule data is required' });
    }

    // Extract WeekStartDate from the first entry (or validate it in the request)
    const weekStartDate = schedule[0]?.weekStartDate;

    if (!weekStartDate) {
        return res.status(400).json({ error: 'WeekStartDate is required' });
    }

    const sql = `
        INSERT INTO Schedule (EmployeeID, WeekStartDate, DayOfWeek, StartTime, EndTime, ShiftType, position)
        VALUES ?
        ON DUPLICATE KEY UPDATE
        StartTime = VALUES(StartTime),
        EndTime = VALUES(EndTime),
        ShiftType = VALUES(ShiftType),
        position = VALUES(position)
    `;

    const values = schedule.map(entry => [
        entry.id, // EmployeeID
        weekStartDate, // WeekStartDate
        entry.day, // DayOfWeek
        entry.startTime, // StartTime
        entry.endTime, // EndTime
        entry.ShiftType, // ShiftType
        entry.position // Position
    ]);

    db.query(sql, [values], (err) => {
        if (err) {
            console.error('Error inserting/updating schedule:', err);
            return res.status(500).json({ error: 'Database operation failed' });
        }

        res.json({ status: 'success', message: 'Schedule updated successfully' });
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

// CRUD for Menu_item
app.get('/api/menu', (req, res) => {
    db.query('SELECT * FROM Menu_item', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.get('/api/menu/:itemID', (req, res) => {
    const { itemID } = req.params;

    const sql = `
        SELECT ItemID, Mname, Price, Recipe, Descr
        FROM Menu_item
        WHERE ItemID = ?;
    `;

    db.query(sql, [itemID], (err, results) => {
        if (err) {
            console.error('Error fetching menu item:', err);
            return res.status(500).json({ error: 'Database query failed.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Menu item not found.' });
        }

        res.json(results[0]);
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

app.put('/api/menu/:ItemID', (req, res) => {
    const { ItemID } = req.params;
    const { Mname, Price, Recipe, Descr } = req.body;

    const sql = `
        UPDATE Menu_item
        SET Mname = ?, Price = ?, Recipe = ?, Descr = ?
        WHERE ItemID = ?;
    `;

    db.query(sql, [Mname, Price, Recipe, Descr, ItemID], (err, results) => {
        if (err) {
            console.error('Error updating menu item:', err);
            return res.status(500).json({ error: 'Database query failed.' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Menu item not found.' });
        }

        res.json({ status: 'success', message: 'Menu item updated successfully.' });
    });
});

app.delete('/api/menu/:ItemID', (req, res) => {
    const { ItemID } = req.params;
    db.query('DELETE FROM Menu_item WHERE ItemID = ?', ItemID, (err) => {
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

app.get('/api/reservations/:id', (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT ResID, ResName, ResInfo, HostID
        FROM Reservation
        WHERE ResID = ?;
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error fetching reservation:', err);
            return res.status(500).json({ error: 'Database query failed.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Reservation not found.' });
        }

        res.json(results[0]);
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
    const { id } = req.params;
    const { ResName, ResInfo, HostID } = req.body;

    const sql = `
        UPDATE Reservation
        SET ResName = ?, ResInfo = ?, HostID = ?
        WHERE ResID = ?;
    `;

    db.query(sql, [ResName, ResInfo, HostID, id], (err, results) => {
        if (err) {
            console.error('Error updating reservation:', err);
            return res.status(500).json({ error: 'Database query failed.' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Reservation not found.' });
        }

        res.json({ status: 'success', message: 'Reservation updated successfully.' });
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

app.get('/api/waitlist/:id', (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT WaitlistID, WaitName, PhoneNumber, PartySize, HostID
        FROM Waitlist
        WHERE WaitlistID = ?;
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error fetching waitlist entry:', err);
            return res.status(500).json({ error: 'Database query failed.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Waitlist entry not found.' });
        }

        res.json(results[0]);
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

    db.query(sql, [WaitName, PhoneNumber, PartySize, HostID, id], (err, results) => {
        if (err) {
            console.error('Error updating waitlist entry:', err);
            return res.status(500).json({ error: 'Database query failed.' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Waitlist entry not found.' });
        }

        res.json({ status: 'success', message: 'Waitlist entry updated successfully.' });
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
    db.query('SELECT * FROM Ingredient_inventory', (err, results) => {
        if (err) {
            console.error('Error fetching inventory:', err);
            return res.status(500).json({ error: 'Database query failed.' });
        }
        res.json(results);
    });
});

app.get('/api/inventory/:ingredientID/:locationID', (req, res) => {
    const { ingredientID, locationID } = req.params;

    const sql = `
        SELECT IngredientID, IngredientName, LocationID, Quantity, Expiration
        FROM Ingredient_inventory
        WHERE IngredientID = ? AND LocationID = ?;
    `;

    db.query(sql, [ingredientID, locationID], (err, results) => {
        if (err) {
            console.error('Error fetching inventory item:', err);
            return res.status(500).json({ error: 'Database query failed.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Inventory item not found.' });
        }

        res.json(results[0]);
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
        SET Quantity = ${Quantity}, Expiration = ${Expiration}
        WHERE IngredientID = ${ingredientID} AND LocationID = ${locationID};
    `;

    db.query(sql, (err) => {
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
