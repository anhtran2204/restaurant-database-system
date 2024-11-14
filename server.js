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
    db.query('SELECT * FROM Employees', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.post('/api/employees', (req, res) => {
    const { ID, fname, minit, lname, dob, position, hoursPerWeek, Salary, Rate } = req.body;
    const query = `
        INSERT INTO Employees (ID, fname, minit, lname, dob, position, hoursPerWeek, Salary, Rate) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
        query,
        [ID, fname, minit || null, lname, dob, position, hoursPerWeek || null, Salary || null, Rate || null],
        (err) => {
            if (err) throw err;
            res.json({ status: 'success' });
        }
    );
});

app.put('/api/employees/:id', (req, res) => {
    const data = req.body;
    const { id } = req.params;
    db.query('UPDATE Employees SET ? WHERE ID = ?', [data, id], (err) => {
        if (err) throw err;
        res.json({ status: 'success' });
    });
});

app.delete('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM Employees WHERE ID = ?', id, (err) => {
        if (err) throw err;
        res.json({ status: 'success' });
    });
});

// CRUD for Clocked_Times
app.get('/api/worktimes', (req, res) => {
    db.query('SELECT * FROM Clocked_Times', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.post('/api/worktimes', (req, res) => {
    const { EmployeeID, ClockedStart, ClockedEnd } = req.body;
    db.query('INSERT INTO Clocked_Times (EmployeeID, ClockedStart, ClockedEnd) VALUES (?, ?, ?)', 
        [EmployeeID, ClockedStart, ClockedEnd], (err) => {
        if (err) throw err;
        res.json({ status: 'success' });
    });
});

app.put('/api/worktimes/:id', (req, res) => {
    const { ClockedStart, ClockedEnd } = req.body;
    const { id } = req.params;
    db.query('UPDATE Clocked_Times SET ClockedStart = ?, ClockedEnd = ? WHERE ClockID = ?', 
        [ClockedStart, ClockedEnd, id], (err) => {
        if (err) throw err;
        res.json({ status: 'success' });
    });
});

app.delete('/api/worktimes/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM Clocked_Times WHERE ClockID = ?', id, (err) => {
        if (err) throw err;
        res.json({ status: 'success' });
    });
});

// CRUD for Schedule
app.get('/api/schedule', (req, res) => {
    db.query('SELECT * FROM Schedule', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.post('/api/schedule', (req, res) => {
    const { EmployeeID, AvDate, StartTime, EndTime, Status } = req.body;
    db.query('INSERT INTO Schedule (EmployeeID, AvDate, StartTime, EndTime, Status) VALUES (?, ?, ?, ?, ?)', 
        [EmployeeID, AvDate, StartTime, EndTime, Status], (err) => {
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
    db.query('SELECT * FROM Reservation', (err, results) => {
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
    const { WaitlistID, WaitName, HostID } = req.body;
    db.query('INSERT INTO Waitlist (WaitlistID, WaitName, HostID) VALUES (?, ?, ?)', 
        [WaitlistID, WaitName, HostID], (err) => {
        if (err) throw err;
        res.json({ status: 'success' });
    });
});

app.put('/api/waitlist/:id', (req, res) => {
    const { WaitName, HostID } = req.body;
    const { id } = req.params;
    db.query('UPDATE Waitlist SET WaitName = ?, HostID = ? WHERE WaitlistID = ?', 
        [WaitName, HostID, id], (err) => {
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
    db.query('SELECT * FROM Ingredient_inventory', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
});

app.post('/api/inventory', (req, res) => {
    const { IngredientID, IngredientName } = req.body;
    db.query('INSERT INTO Ingredient_inventory (IngredientID, IngredientName, LocationID, Quantity, Expiration) VALUES (?, ?, ?, ?, ?)', 
        [IngredientID, IngredientName], (err) => {
        if (err) throw err;
        res.json({ status: 'success' });
    });
});

app.put('/api/inventory/:id', (req, res) => {
    const { IngredientName } = req.body;
    const { id } = req.params;
    db.query('UPDATE Ingredient_inventory SET IngredientName = ? WHERE IngredientID = ?', 
        [IngredientName, id], (err) => {
        if (err) throw err;
        res.json({ status: 'success' });
    });
});

app.delete('/api/inventory/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM Ingredient_inventory WHERE IngredientID = ?', id, (err) => {
        if (err) throw err;
        res.json({ status: 'success' });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
