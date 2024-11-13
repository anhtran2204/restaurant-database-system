// Server setup and other routes (already present)
const express = require('express');
const mysql = require('mysql');
const app = express();
const PORT = 8080;

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(express.static('app'));

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'rootpassword', 
    database: 'Restaurant' 
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Route for Employees
app.get('/api/employees', (req, res) => {
    const query = 'SELECT * FROM Employees';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching employees:', err);
            res.status(500).send('Server error');
        } else {
            res.json(results);
        }
    });
});

// Route for Work Time
app.get('/api/worktime', (req, res) => {
    const query = 'SELECT * FROM Clocked_Times';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching work times:', err);
            res.status(500).send('Server error');
        } else {
            res.json(results);
        }
    });
});

// Route for Inventory
app.get('/api/inventory', (req, res) => {
    const query = 'SELECT * FROM Ingredient_inventory';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching inventory:', err);
            res.status(500).send('Server error');
        } else {
            res.json(results);
        }
    });
});

// Route for Menu Items
app.get('/api/menu', (req, res) => {
    const query = 'SELECT * FROM Menu_item';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching menu items:', err);
            res.status(500).send('Server error');
        } else {
            res.json(results);
        }
    });
});

// Route for Reservations
app.get('/api/reservation', (req, res) => {
    const query = 'SELECT * FROM Reservation';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching reservations:', err);
            res.status(500).send('Server error');
        } else {
            res.json(results);
        }
    });
});

// Route for Schedule (updated for filtering by date)
app.get('/api/schedule', (req, res) => {
    const { startDate, endDate } = req.query;
    const query = `
        SELECT Employees.ID, CONCAT(Employees.fname, ' ', Employees.lname) AS FullName, 
               Schedule.AvDate AS date, Schedule.StartTime, Schedule.EndTime, Employees.position AS Position
        FROM Employees
        JOIN Schedule ON Employees.ID = Schedule.EmployeeID
        WHERE Schedule.AvDate BETWEEN ? AND ?
        ORDER BY Employees.ID, Schedule.AvDate;
    `;
    db.query(query, [startDate, endDate], (err, results) => {
        if (err) {
            console.error('Error fetching schedule:', err);
            res.status(500).send('Error fetching schedule');
        } else {
            res.json(results);
        }
    });
});

// Route for Waitlist
app.get('/api/waitlist', (req, res) => {
    const query = 'SELECT * FROM Waitlist';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching waitlist:', err);
            res.status(500).send('Server error');
        } else {
            res.json(results);
        }
    });
});
