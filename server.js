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
// Get unique LocationIDs
app.get('/api/employees/locations', (req, res) => {
    const sql = `
        SELECT DISTINCT LocationID
        FROM Works_at
        ORDER BY LocationID ASC;
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results);
    });
});

app.get('/api/employees', (req, res) => {
    const sortBy = req.query.sortBy || 'ID'; // Default to sorting by ID
    const locationID = req.query.locationID; // Fetch location ID from query parameters

    const validSortColumns = ['LocationID', 'ID', 'fname', 'lname', 'dob', 'hoursPerWeek', 'Salary', 'Rate'];
    if (!validSortColumns.includes(sortBy)) {
        return res.status(400).json({ error: 'Invalid sort criteria' });
    }

    const sql = locationID
    ? `
        SELECT e.*, wa.LocationID
        FROM Employees e
        JOIN Works_at wa ON e.ID = wa.EmployeeID
        WHERE wa.LocationID = ?
        ORDER BY ${mysql.escapeId(sortBy)} ASC;
        `
    : `
        SELECT e.*, wa.LocationID
        FROM Employees e
        JOIN Works_at wa ON e.ID = wa.EmployeeID
        ORDER BY ${mysql.escapeId(sortBy)} ASC;
        `;

    const params = locationID ? [locationID] : [];
    db.query(sql, params, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results);
    });
});

app.get('/api/employees/:id/:location', (req, res) => {
    const { id } = req.params;
    const { location } = req.params;
    const sql = `
        SELECT *
        FROM Employees e
        JOIN Works_at wa ON e.ID = wa.EmployeeID
        WHERE e.ID = ? and wa.LocationID = ?;
    `;
    db.query(sql, [id, location], (err, results) => {
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

app.post('/api/employees/', (req, res) => {
    const { LocationID, ID, fname, minit, lname, dob, position, hoursPerWeek, Salary, Rate, availableDays, shiftType } = req.body;

    if (!LocationID || !ID || !fname || !lname || !dob || !position) {
        alert('All fields are required.');
        return res.status(400).json({ status: 'error', message: 'Missing required fields' });
    }

    const formattedDOB = new Date(dob).toISOString().split('T')[0];

    const insertEmployee = `
        INSERT INTO Employees (ID, fname, minit, lname, dob, availableDays, position, shiftType, hoursPerWeek, Salary, Rate) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const insertWorksAtSQL = `
        INSERT INTO Works_at (EmployeeID, LocationID) 
        VALUES (?, ?)
    `;

    const params = [ID, fname, minit || null, lname, formattedDOB, availableDays || '', position, shiftType || '', hoursPerWeek || null, Salary || null, Rate || null];

    db.query(insertEmployee, params, (err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ status: 'error', message: 'Database error' });
        } else {
            db.query(insertWorksAtSQL, [ID, LocationID], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Failed to assign location.' });
                }
                res.json({ status: 'success', message: 'Employee added successfully.' });
            });
        }
    });
});

app.put('/api/employees/:id/:locationID', (req, res) => {
    const employeeID = req.params.id;
    const locationID = req.params.locationID;
    const { fname, minit, lname, dob, position, hoursPerWeek, salary, rate, availableDays, shiftType } = req.body;

    const updateEmployee = `
        UPDATE Employees 
        SET fname = ?, minit = ?, lname = ?, dob = ?, availableDays = ?, position = ?, shiftType = ?, hoursPerWeek = ?, Salary = ?, Rate = ?
        WHERE ID = ?
    `;
    const validateWorksAtSQL = `
        SELECT * FROM Works_at WHERE EmployeeID = ? AND LocationID = ?
    `;

    const params = [fname, minit, lname, dob, availableDays, position, shiftType, hoursPerWeek, salary, rate];

    db.query(validateWorksAtSQL, [employeeID, locationID], (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).json({ error: 'Employee does not belong to the specified location.' });
        }
        db.query(updateEmployee, [...params, employeeID, locationID], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to update employee.' });
            }
            res.json({ status: 'success', message: 'Employee updated successfully.' });
        });
    });
});

app.delete('/api/employees/:id/:locationID', (req, res) => {
    const { id, locationID } = req.params;

    const validateWorksAtSQL = `
        SELECT * FROM Works_at WHERE EmployeeID = ? AND LocationID = ?;
    `;
    const deleteWorksAtSQL = `
        DELETE FROM Works_at WHERE EmployeeID = ? AND LocationID = ?;
    `;
    const deleteEmployeeSQL = `
        DELETE FROM Employees WHERE ID = ?;
    `;

    // Step 1: Validate the employee's association with the location
    db.query(validateWorksAtSQL, [id, locationID], (err, results) => {
        if (err) {
            console.error('Error validating employee location:', err);
            return res.status(500).json({ error: 'Database validation failed.' });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: 'Employee does not belong to the specified location.' });
        }

        // Step 2: Remove the association from Works_at
        db.query(deleteWorksAtSQL, [id, locationID], (err) => {
            if (err) {
                console.error('Error deleting from Works_at:', err);
                return res.status(500).json({ error: 'Failed to delete employee location association.' });
            }

            // Step 3: Delete the employee from Employees table
            db.query(deleteEmployeeSQL, [id], (err) => {
                if (err) {
                    console.error('Error deleting employee:', err);
                    return res.status(500).json({ error: 'Failed to delete employee.' });
                }

                res.json({ status: 'success', message: 'Employee deleted successfully.' });
            });
        });
    });
});

// CRUD for Clocked_Times
app.get('/api/worktimes/locations', (req, res) => {
    const sql = `
        SELECT DISTINCT LocationID
        FROM Works_at
        ORDER BY LocationID ASC;
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching locations:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results);
    });
});

app.get('/api/worktimes', (req, res) => {
    const sortBy = req.query.sortBy || 'EmpID'; // Default to sorting by ID
    const locationID = req.query.locationID || null; // Optional location ID filter
    const validSortColumns = ['LocationID', 'EmpID', 'FullName'];

    // Validate the sortBy parameter
    if (!validSortColumns.includes(sortBy)) {
        return res.status(400).json({ error: 'Invalid sort criteria' });
    }

    const sql = locationID
        ?`
            SELECT 
                Clocked_Times.EmployeeID AS EmpID,
                CONCAT(Employees.fname, ' ', Employees.lname) AS FullName,
                ClockedStart,
                ClockedEnd,
                Works_at.LocationID
            FROM Clocked_Times
            JOIN Employees ON Clocked_Times.EmployeeID = Employees.ID
            JOIN Works_at ON Employees.ID = Works_at.EmployeeID
            WHERE Works_at.LocationID = ?
            ORDER BY ${mysql.escapeId(sortBy)} ASC;
        `
        : 
        `
            SELECT 
                Clocked_Times.EmployeeID AS EmpID,
                CONCAT(Employees.fname, ' ', Employees.lname) AS FullName,
                ClockedStart,
                ClockedEnd,
                Works_at.LocationID
            FROM Clocked_Times
            JOIN Employees ON Clocked_Times.EmployeeID = Employees.ID
            JOIN Works_at ON Employees.ID = Works_at.EmployeeID
            ORDER BY ${mysql.escapeId(sortBy)} ASC
        `;

    const params = locationID ? [locationID] : [];
    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Error fetching worktimes:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results);
    });
});

app.get('/api/worktimes/:empID/:locationID', (req, res) => {
    const { empID } = req.params;
    const { locationID } = req.params;

    const sql = `
        SELECT 
            Clocked_Times.LocationID,
            Clocked_Times.EmployeeID AS EmpID, 
            CONCAT(Employees.fname, ' ', Employees.lname) AS FullName, 
            Clocked_Times.ClockedStart, 
            Clocked_Times.ClockedEnd
        FROM Clocked_Times
        JOIN Employees ON Clocked_Times.EmployeeID = Employees.ID
        JOIN Works_at wa ON Employees.ID = wa.EmployeeID
        WHERE Clocked_Times.EmployeeID = ? AND wa.LocationID = ?;
    `;

    db.query(sql, [empID, locationID], (err, results) => {
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
    const { LocationID, EmpID, FullName, ClockedStart , ClockedEnd } = req.body;
    if (!LocationID || !EmpID || !FullName || !ClockedStart  || !ClockedEnd) {
        alert('All fields are required.');
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Convert ISO 8601 to MySQL DATETIME
    const formattedPostClockedStart = new Date(ClockedStart).toISOString().slice(0, 19).replace('T', ' ');
    const formattedPostClockedEnd = new Date(ClockedEnd).toISOString().slice(0, 19).replace('T', ' ');

    const sql = `
        INSERT INTO Clocked_Times (LocationID, EmployeeID, ClockedStart, ClockedEnd)
        VALUES (?, ?, ?, ?);
    `;
    const validateWorksAtSQL = `
        SELECT * FROM Works_at WHERE EmployeeID = ? AND LocationID = ?
    `;

    const params = [LocationID, EmpID, formattedPostClockedStart, formattedPostClockedEnd];

    db.query(validateWorksAtSQL, [EmpID, LocationID], (err, results) => {
        if (err || results.length === 0) {
            alert('Employee does not belong to the specified location.');
            return res.status(400).json({ error: 'Employee does not belong to the specified location.' });
        }
        db.query(sql, params, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to add worktime.' });
            }
            res.json({ status: 'success', message: 'Worktime added successfully.' });
        });
    });
});

// PUT to update a worktime
app.put('/api/worktimes/:empID/:locationID', (req, res) => {
    const empID  = req.params.empID;
    const locationID = req.params.locationID;
    const { FullName, ClockedStart, ClockedEnd } = req.body;

    if (!locationID || !empID || !ClockedStart || !ClockedEnd) {
        console.error('Missing required fields:', { empID, locationID, ClockedStart, ClockedEnd });
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const sql = `
        UPDATE Clocked_Times
        SET ClockedStart = ?, ClockedEnd = ?
        WHERE EmployeeID = ? and LocationID = ?;
    `;
    const validateWorksAtSQL = `
        SELECT * FROM Works_at WHERE EmployeeID = ? AND LocationID = ?
    `;

    const params = [ClockedStart, ClockedEnd];

    db.query(validateWorksAtSQL, [empID, locationID], (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).json({ error: 'Employee does not belong to the specified location.' });
        }
        db.query(sql, [ ...params, empID, locationID], (err, results) => {  
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
});

// DELETE a worktime
app.delete('/api/worktimes/:empID/:locationID', (req, res) => {
    const { empID } = req.params;
    const { locationID } = req.params;

    const validateWorksAtSQL = `SELECT * FROM Works_at WHERE EmployeeID = ? AND LocationID = ?`;
    const sql = `
        DELETE FROM Clocked_Times
        WHERE EmployeeID = ? AND LocationID = ?;
    `;

    db.query(validateWorksAtSQL, [empID, locationID], (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).json({ error: 'Employee does not belong to the specified location.' });
        }
        db.query(sql, [empID, locationID], (err, results) => {
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
});

// CRUD for Schedule
app.get('/api/schedule/locations', (req, res) => {
    const sql = `
        SELECT DISTINCT LocationID
        FROM Works_at
        ORDER BY LocationID ASC;
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching locations:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results);
    });
});

app.get('/api/schedule', (req, res) => {
    const { weekStartDate, locationID } = req.query;

    if (!weekStartDate) {
        return res.status(400).json({ error: 'Missing weekStartDate query parameter' });
    }

    const sql = locationID 
        ? `
            SELECT 
                e.ID AS EmployeeID, 
                wa.LocationID,
                CONCAT(e.fname, ' ', e.lname) AS FullName,
                s.WeekStartDate,
                s.DayOfWeek,
                s.StartTime,
                s.EndTime,
                s.ShiftType,
                s.position
            FROM Employees e
            LEFT JOIN Schedule s ON e.ID = s.EmployeeID AND s.WeekStartDate = ?
            JOIN Works_at wa ON e.ID = wa.EmployeeID 
            WHERE wa.LocationID = ?
            ORDER BY e.ID, FIELD(s.DayOfWeek, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
        `    
        : `
            SELECT 
                e.ID AS EmployeeID,
                wa.LocationID,
                CONCAT(e.fname, ' ', e.lname) AS FullName,
                s.WeekStartDate,
                s.DayOfWeek,
                s.StartTime,
                s.EndTime,
                s.ShiftType,
                s.position
            FROM Employees e
            LEFT JOIN Schedule s ON e.ID = s.EmployeeID AND s.WeekStartDate = ?
            LEFT JOIN Works_at wa ON e.ID = wa.EmployeeID AND wa.LocationID = ?
            ORDER BY e.ID, FIELD(s.DayOfWeek, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
        `;

    db.query(sql, [weekStartDate, locationID], (err, results) => {
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

app.put('/api/schedule/:employeeID/:day', (req, res) => {
    const { employeeID, day } = req.params;
    const { startTime, endTime, shiftType, position } = req.body;

    const sql = `
        UPDATE Schedule
        SET StartTime = ?, EndTime = ?, ShiftType = ?, position = ?
        WHERE EmployeeID = ? AND DayOfWeek = ?;
    `;

    db.query(sql, [startTime, endTime, shiftType, position, employeeID, day], (err, results) => {
        if (err) {
            console.error('Error updating schedule entry:', err);
            return res.status(500).json({ error: 'Database update failed.' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Schedule entry not found.' });
        }

        res.json({ status: 'success', message: 'Schedule entry updated successfully.' });
    });
});

app.delete('/api/schedule/:employeeID/:day', (req, res) => {
    const { employeeID, day } = req.params;

    const sql = `
        DELETE FROM Schedule
        WHERE EmployeeID = ? AND DayOfWeek = ?;
    `;

    db.query(sql, [employeeID, day], (err, results) => {
        if (err) {
            console.error('Error deleting schedule entry:', err);
            return res.status(500).json({ error: 'Database delete failed.' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Schedule entry not found.' });
        }

        res.json({ status: 'success', message: 'Schedule entry deleted successfully.' });
    });
});

// CRUD for Menu_item
app.get('/api/menu', (req, res) => {
    const sortBy = req.query.sortBy || 'ItemID'; // Default to sorting by Item ID
    const validSortColumns = ['ItemID', 'Mname', 'Price'];

    // Validate the sortBy parameter
    if (!validSortColumns.includes(sortBy)) {
        return res.status(400).json({ error: 'Invalid sort criteria' });
    }

    const sql = `
        SELECT ItemID, Mname, Price, Recipe, Descr
        FROM Menu_item
        ORDER BY ${mysql.escapeId(sortBy)} ASC;
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching menu items:', err);
            return res.status(500).json({ error: 'Database query failed.' });
        }
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

    if (!Mname || !Price || !Recipe || !Descr) {
        alert('All fields are required.');
        return res.status(400).json({ error: 'All fields are required.' }); 
    }

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
app.get('/api/reservations/locations', (req, res) => {
    const sql = `
        SELECT DISTINCT LocationID 
        FROM Reservation
        ORDER BY LocationID ASC;
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching locations:', err);
            return res.status(500).json({ error: 'Database query failed.' });
        }
        res.json(results);
    });
});

app.get('/api/reservations', (req, res) => {
    const sortBy = req.query.sortBy || 'ResID';
    const locationID = req.query.locationID || null;
    const validSortColumns = ['ResID', 'ResName', 'ResInfo', 'ResSize', 'HostID', 'LocationID'];

    if (!validSortColumns.includes(sortBy)) {
        return res.status(400).json({ error: 'Invalid sort criteria.' });
    }

    const sql = locationID
        ? `
            SELECT ResID, ResName, ResInfo, ResSize, HostID, LocationID
            FROM Reservation
            WHERE LocationID = ?
            ORDER BY ${mysql.escapeId(sortBy)} ASC;
        `
        : `
            SELECT ResID, ResName, ResInfo, ResSize, HostID, LocationID
            FROM Reservation
            ORDER BY ${mysql.escapeId(sortBy)} ASC;
        `;

    const params = locationID ? [locationID] : [];
    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Error fetching reservations:', err);
            return res.status(500).json({ error: 'Database query failed.' });
        }
        res.json(results);
    });
});

app.get('/api/reservations/:resID/:locationID', (req, res) => {
    const { resID, locationID } = req.params;
    const sql = `
        SELECT ResID, ResName, ResInfo, ResSize, HostID, LocationID
        FROM Reservation
        WHERE ResID = ? AND LocationID = ?;
    `;

    db.query(sql, [resID, locationID], (err, results) => {
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
    const { LocationID, ResID, ResName, ResInfo, ResSize, HostID } = req.body;

    if (!LocationID || !ResID || !ResName || !ResInfo || !ResSize || !HostID) {
        alert('All fields are required.');
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const sql = `
        INSERT INTO Reservation (LocationID, ResID, ResName, ResInfo, ResSize, HostID)
        VALUES (?, ?, ?, ?, ?, ?);
    `;

    db.query(sql, [LocationID, ResID, ResName, ResInfo, ResSize, HostID], (err) => {
        if (err) {
            console.error('Error adding reservation:', err);
            return res.status(500).json({ error: 'Database insert failed.' });
        }
        res.json({ status: 'success', message: 'Reservation added successfully.' });
    });
});

app.put('/api/reservations/:resID/:locationID', (req, res) => {
    const { resID, locationID } = req.params;
    const { ResName, ResInfo, ResSize, HostID } = req.body;

    if (!ResName || !ResInfo || !ResSize || !HostID) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const sql = `
        UPDATE Reservation
        SET ResName = ?, ResInfo = ?, ResSize = ?, HostID = ?
        WHERE ResID = ? AND LocationID = ?;
    `;

    db.query(sql, [ResName, ResInfo, ResSize, HostID, resID, locationID], (err, results) => {
        if (err) {
            console.error('Error updating reservation:', err);
            return res.status(500).json({ error: 'Database update failed.' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Reservation not found.' });
        }

        res.json({ status: 'success', message: 'Reservation updated successfully.' });
    });
});

app.delete('/api/reservations/:resID/:locationID', (req, res) => {
    const { resID, locationID } = req.params;

    const sql = `
        DELETE FROM Reservation
        WHERE ResID = ? AND LocationID = ?;
    `;

    db.query(sql, [resID, locationID], (err, results) => {
        if (err) {
            console.error('Error deleting reservation:', err);
            return res.status(500).json({ error: 'Database delete failed.' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Reservation not found.' });
        }

        res.json({ status: 'success', message: 'Reservation deleted successfully.' });
    });
});

// CRUD for Waitlist
app.get('/api/waitlist/locations', (req, res) => {
    const sql = `
        SELECT DISTINCT LocationID
        FROM Waitlist
        ORDER BY LocationID ASC;
    `;
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching locations:', err);
            return res.status(500).json({ error: 'Database query failed.' });
        }
        res.json(results);
    });
});

app.get('/api/waitlist', (req, res) => {
    const sortBy = req.query.sortBy || 'WaitlistID'; // Default sorting by Waitlist ID
    const locationID = req.query.locationID || null; // Optional filter by location
    const validSortColumns = ['LocationID', 'WaitlistID', 'WaitName', 'PartySize'];

    // Validate sorting column
    if (!validSortColumns.includes(sortBy)) {
        return res.status(400).json({ error: 'Invalid sort criteria.' });
    }

    const sql = locationID
        ? `
            SELECT WaitlistID, WaitName, PhoneNumber, PartySize, HostID, LocationID
            FROM Waitlist
            WHERE LocationID = ?
            ORDER BY ${mysql.escapeId(sortBy)} ASC;
        `
        : `
            SELECT WaitlistID, WaitName, PhoneNumber, PartySize, HostID, LocationID
            FROM Waitlist
            ORDER BY ${mysql.escapeId(sortBy)} ASC;
        `;

    const params = locationID ? [locationID] : [];
    db.query(sql, params, (err, results) => {
        if (err) {
            console.error('Error fetching waitlist:', err);
            return res.status(500).json({ error: 'Database query failed.' });
        }
        res.json(results);
    });
});

app.get('/api/waitlist/:waitlistID/:locationID', (req, res) => {
    const { waitlistID, locationID } = req.params;

    const sql = `
        SELECT WaitlistID, WaitName, PhoneNumber, PartySize, HostID, LocationID
        FROM Waitlist
        WHERE WaitlistID = ? AND LocationID = ?;
    `;

    db.query(sql, [waitlistID, locationID], (err, results) => {
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
    const { LocationID, WaitlistID, WaitName, PhoneNumber, PartySize, HostID } = req.body;

    if (!LocationID || !WaitlistID || !WaitName || !PhoneNumber || !PartySize || !HostID) {
        alert('All fields are required.');
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const sql = `
        INSERT INTO Waitlist (LocationID, WaitlistID, WaitName, PhoneNumber, PartySize, HostID)
        VALUES (?, ?, ?, ?, ?, ?);
    `;

    db.query(sql, [LocationID, WaitlistID, WaitName, PhoneNumber, PartySize, HostID], (err) => {
        if (err) {
            console.error('Error adding waitlist entry:', err);
            return res.status(500).json({ error: 'Database insert failed.' });
        }
        res.json({ status: 'success', message: 'Waitlist entry added successfully.' });
    });
});

app.put('/api/waitlist/:waitlistID/:locationID', (req, res) => {
    const { waitlistID, locationID } = req.params;
    const { WaitName, PhoneNumber, PartySize, HostID } = req.body;

    if (!WaitName || !PhoneNumber || !PartySize || !HostID) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const sql = `
        UPDATE Waitlist
        SET WaitName = ?, PhoneNumber = ?, PartySize = ?, HostID = ?
        WHERE WaitlistID = ? AND LocationID = ?;
    `;

    db.query(sql, [WaitName, PhoneNumber, PartySize, HostID, waitlistID, locationID], (err, results) => {
        if (err) {
            console.error('Error updating waitlist entry:', err);
            return res.status(500).json({ error: 'Database update failed.' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Waitlist entry not found.' });
        }

        res.json({ status: 'success', message: 'Waitlist entry updated successfully.' });
    });
});

app.delete('/api/waitlist/:waitlistID/:locationID', (req, res) => {
    const { waitlistID, locationID } = req.params;

    const sql = `
        DELETE FROM Waitlist
        WHERE WaitlistID = ? AND LocationID = ?;
    `;

    db.query(sql, [waitlistID, locationID], (err, results) => {
        if (err) {
            console.error('Error deleting waitlist entry:', err);
            return res.status(500).json({ error: 'Database delete failed.' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Waitlist entry not found.' });
        }

        res.json({ status: 'success', message: 'Waitlist entry deleted successfully.' });
    });
});

// CRUD for Inventory
app.get('/api/inventory/locations', (req, res) => {
    const sql = `
        SELECT DISTINCT LocationID
        FROM Works_at
        ORDER BY LocationID ASC;
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching locations:', err);
            return res.status(500).json({ error: 'Database query failed' });
        }
        res.json(results);
    });
});

app.get('/api/inventory', (req, res) => {
    const sortBy = req.query.sortBy || 'IngredientID';
    const locationID = req.query.locationID || null;
    const validSortColumns = ['IngredientID', 'IngredientName', 'LocationID', 'Quantity', 'Expiration'];

    if (!validSortColumns.includes(sortBy)) {
        return res.status(400).json({ error: 'Invalid sort criteria' });
    }

    const sql = locationID
        ? `
            SELECT IngredientID, IngredientName, LocationID, Quantity, Expiration
            FROM Ingredient_inventory
            WHERE LocationID = ?
            ORDER BY ${mysql.escapeId(sortBy)} ASC;
        `
        : `
            SELECT IngredientID, IngredientName, LocationID, Quantity, Expiration
            FROM Ingredient_inventory
            ORDER BY ${mysql.escapeId(sortBy)} ASC;
        `;

    const params = locationID ? [locationID] : [];
    db.query(sql, params, (err, results) => {
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

    if (!IngredientID || !IngredientName || !LocationID || Quantity === undefined || !Expiration) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const checkIngredientSQL = `
        SELECT COUNT(*) AS count 
        FROM Ingredients 
        WHERE IngredientID = ? AND IngredientName = ?;
    `;

    const insertIngredientSQL = `
        INSERT INTO Ingredients (IngredientID, IngredientName)
        VALUES (?, ?);
    `;

    const insertInventorySQL = `
        INSERT INTO Ingredient_inventory (IngredientID, IngredientName, LocationID, Quantity, Expiration)
        VALUES (?, ?, ?, ?, ?);
    `;

    // Step 1: Check if the ingredient exists in the Ingredients table
    db.query(checkIngredientSQL, [IngredientID, IngredientName], (err, results) => {
        if (err) {
            console.error('Error checking ingredient existence:', err);
            return res.status(500).json({ error: 'Database query failed.' });
        }

        const ingredientExists = results[0].count > 0;

        const insertInventory = () => {
            // Step 3: Insert into Ingredient_inventory
            db.query(insertInventorySQL, [IngredientID, IngredientName, LocationID, Quantity, Expiration], (err) => {
                if (err) {
                    console.error('Error adding inventory item:', err);
                    return res.status(500).json({ error: 'Database insert failed.' });
                }
                res.json({ status: 'success', message: 'Inventory item added successfully.' });
            });
        };

        if (!ingredientExists) {
            // Step 2: Add the ingredient to Ingredients table if it doesn't exist
            db.query(insertIngredientSQL, [IngredientID, IngredientName], (err) => {
                if (err) {
                    console.error('Error adding ingredient:', err);
                    return res.status(500).json({ error: 'Failed to add ingredient to Ingredients table.' });
                }
                // Proceed to insert into Ingredient_inventory
                insertInventory();
            });
        } else {
            // Ingredient already exists, proceed to insert into Ingredient_inventory
            insertInventory();
        }
    });
});

// DELETE an inventory item
app.delete('/api/inventory/:ingredientID/:locationID', (req, res) => {
    const { ingredientID, locationID } = req.params;

    const sql = `
        DELETE FROM Ingredient_inventory
        WHERE IngredientID = ? AND LocationID = ?;
    `;

    db.query(sql, [ingredientID, locationID], (err, results) => {
        if (err) {
            console.error('Error deleting inventory item:', err);
            return res.status(500).json({ error: 'Database delete failed.' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Inventory item not found.' });
        }

        res.json({ status: 'success', message: 'Inventory item deleted successfully.' });
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

    db.query(sql, [Quantity, Expiration, ingredientID, locationID], (err, results) => {
        if (err) {
            console.error('Error updating inventory item:', err);
            return res.status(500).json({ error: 'Database update failed.' });
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Inventory item not found.' });
        }

        res.json({ status: 'success', message: 'Inventory item updated successfully.' });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
