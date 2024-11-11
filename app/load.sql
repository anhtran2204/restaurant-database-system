INSERT INTO Employees (ID, fname, minit, lname, dob, position, hoursPerWeek, ManagerID, Salary, Rate)
VALUES
    (1, 'Alice', 'A', 'Smith', '1990-02-14', 'Chef', 40, NULL, 70000, NULL),
    (2, 'Bob', 'B', 'Johnson', '1985-06-21', 'Waiter', 35, 1, NULL, 20);

INSERT INTO Manages (ManagerID,EmployeeID)
VALUES	(28, 32), (28, 18), (30, 29), (28, 45);

INSERT INTO Schedule (EntryID, EmployeeID, AvDate, StartTime, EndTime, Status) -- Status is 'Scheduled' or 'Available'
VALUES 	(1, 32, '2024-10-22', '08:30:00', '19:45:00', 'Scheduled'),
		(2, 32, '2024-10-25', '08:00:00', '15:30:00', 'Available'),
        (3, 18, '2024-10-23', '09:15:00', '16:45:00', 'Scheduled'), 
		(4, 45, '2024-10-24', '10:05:00', '18:15:00', 'Available'), 
		(5, 28, '2024-10-25', '12:30:00', '21:45:00', 'Scheduled');

INSERT INTO Clocked_Times (ClockID, EmployeeID, ClockedStart, ClockedEnd)
VALUES	(3, 32, '2024-10-22 08:28:00', '2024-10-22 19:47:00'),
		(4, 18, '2024-10-23 09:10:00', '2024-10-23 16:50:00'), 
		(5, 45, '2024-10-24 10:10:00', '2024-10-24 18:20:00'), 
		(6, 28, '2024-10-25 12:35:00', '2024-10-25 21:50:00');

INSERT INTO Cook (EmployeeID, Specialty)
VALUES	(28, 'Head Chef'), 	(29, 'Pastry Chef'), 
		(30, 'Sous Chef'), 	(31, 'Line Cook');

INSERT INTO Server (EmployeeID, Tips)
VALUES	(18, 42.91), (45, 35.00);  

INSERT INTO RTable (TableNum, NumSeats, ServerID)
VALUES	(1, 4, 18), (2, 4, 18), (3, 2, 18), (4, 6, 45), (5, 2, 45), (6, 2, 45);  

INSERT INTO Waitlist (WaitlistID, WaitName, HostID)
VALUES	(94, 'Marco', 32), (95, 'Reyna', 32), (96, 'Stephen', 32), (97, 'Daphne', 32);

INSERT INTO Reservation (ResID, ResName, ResInfo, HostID)
VALUES	(8, 'Eric', '2025-01-14 18:00:00', 32),
		(9, 'Maria', '2025-01-15 19:00:00', 32), 
		(10, 'Lucas', '2025-01-16 20:00:00', 32),
        (11, 'Nina', '2025-01-17 21:00:00', 32);

INSERT INTO Location (LocationID, Address, Region)
VALUES	(5, '4172 Thrash Trail, Dallas, TX', 'North Texas'),
		(6, '500 Elm St, Austin, TX', 'Central Texas'), 
		(7, '202 Pine Ln, Houston, TX', 'South Texas'), 
		(8, '303 Sunset Blvd, San Antonio, TX', 'West Texas');

INSERT INTO Works_at (EmployeeID, LocationID)
VALUES	(28, 5), (28, 6), (29, 5), (29, 6), (30, 6), 
		(30, 7), (30, 8), (31, 7), (32, 7), (18, 8), (45, 5);

INSERT INTO Ingredients (IngredientID, IngredientName)
VALUES	(30, 'Flour'), 
		(31, 'Cheese'), 
		(32, 'Salt'), 
		(33, 'Pepper');

INSERT INTO Ingredient_inventory (IngredientID, IngredientName, LocationID, Quantity, Expiration)
VALUES	(30, 'Flour', 5, 35, '02025-02-17'),
		(31, 'Cheese', 6, 20, '2025-03-10'), 
		(32, 'Salt', 7, 15, '2025-01-30'), 
		(33, 'Pepper', 8, 10, '2025-04-05');

INSERT INTO Menu_item (Mname, Price, Recipe, Descr)
VALUES	('Pot Pie', 11.99, 'Line pan with dough, pour in filling, and bake.', 'Chicken pot pie with carrots, peas, and a flaky crust.'),
		('Pizza', 14.99, 'Prepare dough, add sauce and toppings, bake in oven.', 'Classic margherita pizza'), 
		('Burger', 9.99, 'Grill patty, assemble with toppings and bun.', 'Cheeseburger with lettuce and tomato'), 
		('Salad', 7.49, 'Mix greens, add dressing and toppings.', 'Fresh garden salad');

INSERT INTO Menu_item_ingredients (Mname, IngredientID)
VALUES	('Pot Pie', 30), ('Pizza', 30), ('Pizza', 31), ('Burger', 32), ('Salad', 33);