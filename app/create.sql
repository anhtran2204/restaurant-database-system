DROP DATABASE IF EXISTS `Restaurant`;
CREATE DATABASE `Restaurant`;
USE `Restaurant`;

-- Create Employees table
CREATE TABLE Employees (
    ID INT NOT NULL,
    fname VARCHAR(15) NOT NULL,
    minit CHAR(1),
    lname VARCHAR(15) NOT NULL,
    dob DATE,
    AvailableDays VARCHAR(100) NOT NULL, -- Comma-separated days (e.g., "Monday,Tuesday")
    position VARCHAR(20),
    ShiftType VARCHAR(20) NOT NULL,
    hoursPerWeek INT,
    Salary INT,
    Rate DECIMAL(5, 2),
    PRIMARY KEY (ID),
    INDEX (position) -- Add an index for the `position` column
);

-- Create Manages table
CREATE TABLE Manages (
    ManagerID INT NOT NULL,
    EmployeeID INT NOT NULL,
    PRIMARY KEY (ManagerID, EmployeeID),
    FOREIGN KEY (ManagerID) REFERENCES Employees(ID) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (EmployeeID) REFERENCES Employees(ID) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create Schedule table
CREATE TABLE Schedule (
    EntryID INT AUTO_INCREMENT PRIMARY KEY,
    EmployeeID INT NOT NULL,
    WeekStartDate DATE NOT NULL,
    DayOfWeek VARCHAR(10) NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    ShiftType VARCHAR(20),
    position VARCHAR(20),
    FOREIGN KEY (EmployeeID) REFERENCES Employees(ID) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (position) REFERENCES Employees(position)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Location (
	LocationID		INT 		NOT NULL,
    Address			VARCHAR(45)	NOT NULL,
    Region			VARCHAR(25)	NOT NULL,
    PRIMARY KEY(LocationID)
);	

CREATE TABLE Works_at (
  EmployeeID		INT 		NOT NULL,
  LocationID		INT			NOT NULL,
  PRIMARY KEY(EmployeeID, LocationID),
  FOREIGN KEY(EmployeeID) REFERENCES Employees(ID)
	ON DELETE CASCADE		ON UPDATE CASCADE,
  FOREIGN KEY(LocationID) REFERENCES Location(LocationID)
	ON DELETE CASCADE		ON UPDATE CASCADE
);

CREATE TABLE Clocked_Times (
    LocationID INT NOT NULL,
    EmployeeID INT NOT NULL,
    ClockedStart TIMESTAMP NOT NULL,
    ClockedEnd TIMESTAMP NOT NULL,
    PRIMARY KEY(EmployeeID, LocationID),
    FOREIGN KEY(EmployeeID) REFERENCES Employees(ID)
        ON DELETE CASCADE		ON UPDATE CASCADE,
    FOREIGN KEY(LocationID) REFERENCES Location(LocationID)
        ON DELETE CASCADE		ON UPDATE CASCADE,
    CONSTRAINT CHK_TIME CHECK (ClockedStart < ClockedEnd)
);

CREATE TABLE Cook (
    EmployeeID INT NOT NULL,
    fname VARCHAR(15) NOT NULL,      -- Adding fname
    lname VARCHAR(15) NOT NULL,      -- Adding lname
    Specialty VARCHAR(15) NOT NULL,
    PRIMARY KEY (EmployeeID),
    FOREIGN KEY (EmployeeID) REFERENCES Employees(ID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Server (
    EmployeeID INT NOT NULL,
    fname VARCHAR(15) NOT NULL,      -- Adding fname
    lname VARCHAR(15) NOT NULL,      -- Adding lname
    Tips DECIMAL(5,2) DEFAULT NULL,
    PRIMARY KEY (EmployeeID),
    FOREIGN KEY (EmployeeID) REFERENCES Employees(ID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE RTable (
    TableNum INT NOT NULL,
    NumSeats INT NOT NULL,
    ServerID INT NOT NULL,
    PRIMARY KEY (TableNum),
    FOREIGN KEY (ServerID) REFERENCES Server(EmployeeID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Waitlist (
    LocationID INT NOT NULL,
    WaitlistID INT NOT NULL,
    WaitName VARCHAR(15) NOT NULL,
    PhoneNumber VARCHAR(14) NOT NULL, -- For formatted phone numbers like (###) ###-####
    PartySize INT NOT NULL, -- To store the size of the party
    HostID INT NOT NULL,
    PRIMARY KEY (WaitlistID, LocationID),
    FOREIGN KEY (LocationID) REFERENCES Location(LocationID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (HostID) REFERENCES Employees(ID)
        ON DELETE CASCADE ON UPDATE CASCADE
);


CREATE TABLE Reservation (
    LocationID INT NOT NULL,
    ResID INT NOT NULL,
    ResName VARCHAR(15) NOT NULL,
    ResInfo TIMESTAMP NOT NULL,
    ResSize INT NOT NULL,
    HostID INT NOT NULL,
    PRIMARY KEY (ResID, LocationID),
    FOREIGN KEY (LocationID) REFERENCES Location(LocationID)
        ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (HostID) REFERENCES Employees(ID)
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE Ingredients (
	IngredientID	INT 		NOT NULL,
    IngredientName	VARCHAR(15)	NOT NULL,
    PRIMARY KEY(IngredientID),
    UNIQUE(IngredientName)
);

CREATE TABLE Ingredient_inventory (
	IngredientID	INT 		NOT NULL,
    IngredientName	VARCHAR(15)	NOT NULL,
    LocationID		INT			NOT NULL,
    Quantity		INT			DEFAULT 0,
    Expiration		DATE		NOT NULL,
    PRIMARY KEY(IngredientID, LocationID),
    FOREIGN KEY(IngredientID) REFERENCES Ingredients(IngredientID)
		ON DELETE CASCADE		ON UPDATE CASCADE,
    FOREIGN KEY(IngredientName) REFERENCES Ingredients(IngredientName)
		ON DELETE CASCADE 		ON UPDATE CASCADE,
    FOREIGN KEY(LocationID) REFERENCES Location(LocationID)
    	ON DELETE CASCADE 		ON UPDATE CASCADE
);

CREATE TABLE Menu_item (
    ItemID  INT AUTO_INCREMENT,
	Mname	VARCHAR(25)		NOT NULL,
    Price	DECIMAL(4,2)	NOT NULL,
    Recipe	TEXT			NOT NULL,
    Descr	TEXT			NOT NULL,
    PRIMARY KEY(ItemID),
    UNIQUE(Mname)
);

CREATE TABLE Menu_item_ingredients (
    Mname				VARCHAR(25)	NOT NULL,
    IngredientID		INT		NOT NULL,
    PRIMARY KEY(Mname, IngredientID),
    FOREIGN KEY(Mname) REFERENCES Menu_item(Mname)
    	ON DELETE CASCADE 		ON UPDATE CASCADE,
    FOREIGN KEY(IngredientID) REFERENCES Ingredients(IngredientID)
    	ON DELETE CASCADE 		ON UPDATE CASCADE
);