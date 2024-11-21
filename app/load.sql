-- Temporarily disable foreign key checks to avoid constraint errors during load
SET FOREIGN_KEY_CHECKS = 0;

-- Clear data with `TRUNCATE` to reset auto-increment values, preserving order
TRUNCATE TABLE Menu_item_ingredients;
TRUNCATE TABLE Ingredient_inventory;
TRUNCATE TABLE Works_at;
TRUNCATE TABLE Reservation;
TRUNCATE TABLE Waitlist;
TRUNCATE TABLE RTable;
TRUNCATE TABLE Server;
TRUNCATE TABLE Cook;
TRUNCATE TABLE Clocked_Times;
TRUNCATE TABLE Schedule;
TRUNCATE TABLE Manages;
TRUNCATE TABLE Employees;
TRUNCATE TABLE Location;
TRUNCATE TABLE Ingredients;
TRUNCATE TABLE Menu_item;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Insert data into Employees table (ensure unique IDs)
INSERT INTO Employees (ID, fname, minit, lname, dob, AvailableDays, position, shiftType, hoursPerWeek, Salary, Rate)
VALUES
    (28, 'Gordon', 'J', 'Ramsay', '1970-11-08', 'Monday,Tuesday,Wednesday', 'Head Chef', 'Morning', 40, 70000, NULL),
    (29, 'Susie', 'K', 'Diann', '1980-05-15', 'Thursday,Friday,Saturday', 'Pastry Chef', 'Dinner', 40, 62000, NULL),
    (30, 'Guy', 'R', 'Fieri', '1968-01-22', 'Sunday,Monday', 'Sous Chef', 'Morning', 40, 65000, NULL),
    (31, 'Robert', 'B', 'Squarepants', '1990-04-12', 'Monday,Tuesday,Wednesday', 'Line Cook', 'Dinner', 32, NULL, 18),
    (18, 'Angelica', 'P', 'Vance', '1992-09-18', 'Sunday,Monday', 'Server', 'Morning', 20, NULL, 16),
    (32, 'Donnie', 'M', 'Key', '1988-07-11', 'Thursday,Friday,Saturday', 'Host', 'Dinner', 22, NULL, 20),
    (45, 'Linda', 'S', 'Brown', '1995-02-05', 'Monday,Tuesday,Wednesday', 'Server', 'Morning', 25, NULL, 18),
    (3, 'Alice', 'A', 'Brown', '1992-08-15', 'Monday,Tuesday,Wednesday', 'Manager', 'Morning', 40, 50000, NULL),
    (4, 'Jane', 'M', 'Smith', '1985-05-20', 'Thursday,Friday,Saturday', 'Chef', 'Dinner', 40, 40000, NULL),
    (5, 'John', 'D', 'Doe', '1990-01-01', 'Sunday,Monday', 'Server', 'Dinner', 40, 30000, NULL),
    (1, 'John', 'A', 'Doe', '1985-05-15', 'Tuesday,Wednesday,Thursday', 'Chef', 'Morning', 40, 50000, 25.00),
    (2, 'Donna', 'B', 'Smith', '1990-08-20', 'Tuesday,Wednesday,Thursday', 'Server', 'Dinner', 20, NULL, 15.00);

-- Insert data into Location table
INSERT INTO Location (LocationID, Address, Region)
VALUES
    (5, '4172 Thrash Trail, Dallas, TX', 'North Texas'),
    (6, '500 Elm St, Austin, TX', 'Central Texas'), 
    (7, '202 Pine Ln, Houston, TX', 'South Texas'), 
    (8, '303 Sunset Blvd, San Antonio, TX', 'West Texas');

-- Insert data into Works_at table
INSERT INTO Works_at (EmployeeID, LocationID)
VALUES
    (28, 5), (29, 5), (30, 6), (31, 7), (32, 7), 
    (18, 8), (45, 5), (3, 5), (4, 6), (5, 7), 
    (1, 8), (2, 8);

-- Insert data into Manages table
INSERT INTO Manages (ManagerID, EmployeeID)
VALUES
    (28, 32), (28, 18), (30, 29), (28, 45);

-- Insert data into Clocked_Times table
INSERT INTO Clocked_Times (LocationID, EmployeeID, ClockedStart, ClockedEnd)
VALUES
    (5, 28, '2024-11-18 09:00:00', '2024-11-18 17:00:00'),
    (6, 29, '2024-11-18 16:00:00', '2024-11-18 20:00:00'), 
    (7, 30, '2024-11-18 08:00:00', '2024-11-18 16:00:00'), 
    (8, 31, '2024-11-18 12:00:00', '2024-11-18 20:00:00');

-- Insert data into Cook table
INSERT INTO Cook (EmployeeID, fname, lname, Specialty)
VALUES
    (28, 'Gordon', 'Ramsay', 'Head Chef'),
    (29, 'Susie', 'Diann', 'Pastry Chef'), 
    (30, 'Guy', 'Fieri', 'Sous Chef'), 
    (31, 'Robert', 'Squarepants', 'Line Cook');

-- Insert data into Server table with fname and lname included
INSERT INTO Server (EmployeeID, fname, lname, Tips)
VALUES
    (18, 'Angelica', 'Vance', 42.91),
    (45, 'Linda', 'Brown', 35.00);
 

-- Insert data into RTable table
INSERT INTO RTable (TableNum, NumSeats, ServerID)
VALUES
    (1, 4, 18), (2, 4, 18), (3, 2, 18), (4, 6, 45), (5, 2, 45), (6, 2, 45);  

-- Insert data into Waitlist table
INSERT INTO Waitlist (LocationID, WaitlistID, WaitName, PhoneNumber, PartySize, HostID)
VALUES
    (5, 94, 'Marco', '(555) 123-4567', 4, 32),
    (6, 95, 'Reyna', '(555) 987-6543', 2, 32),
    (7, 96, 'Stephen', '(555) 456-7890', 3, 32),
    (8, 97, 'Daphne', '(555) 321-0987', 5, 32);

-- Insert data into Reservation table
INSERT INTO Reservation (LocationID, ResID, ResName, ResInfo, ResSize, HostID)
VALUES
    (5, 8, 'Eric', '2025-01-14 18:00:00', 5, 32),
    (6, 9, 'Maria', '2025-01-15 19:00:00', 4, 32), 
    (7, 10, 'Lucas', '2025-01-16 20:00:00', 10, 32),
    (8, 11, 'Nina', '2025-01-17 21:00:00', 2, 32);

-- Insert data into Ingredients table
INSERT INTO Ingredients (IngredientID, IngredientName)
VALUES
    (30, 'Flour'), 
    (31, 'Cheese'), 
    (32, 'Salt'), 
    (33, 'Pepper');

-- Load data into Ingredient_inventory table with IngredientName
INSERT INTO Ingredient_inventory (IngredientID, IngredientName, LocationID, Quantity, Expiration)
VALUES
    (30, 'Flour', 5, 35, '2025-02-17'),
    (31, 'Cheese', 6, 20, '2025-03-10'), 
    (32, 'Salt', 7, 15, '2025-01-30'), 
    (33, 'Pepper', 8, 10, '2025-04-05');

-- Insert data into Menu_item table
INSERT INTO Menu_item (Mname, Price, Recipe, Descr)
VALUES
    ('Pot Pie', 11.99, 'Line pan with dough, pour in filling, and bake.', 'Chicken pot pie with carrots, peas, and a flaky crust.'),
    ('Pizza', 14.99, 'Prepare dough, add sauce and toppings, bake in oven.', 'Classic margherita pizza'), 
    ('Burger', 9.99, 'Grill patty, assemble with toppings and bun.', 'Cheeseburger with lettuce and tomato'), 
    ('Salad', 7.49, 'Mix greens, add dressing and toppings.', 'Fresh garden salad');

-- Insert data into Menu_item_ingredients table
INSERT INTO Menu_item_ingredients (Mname, IngredientID)
VALUES
    ('Pot Pie', 30), ('Pizza', 30), ('Pizza', 31), ('Burger', 32), ('Salad', 33);
