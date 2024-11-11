-- Team14, CS4347
DROP DATABASE IF EXISTS `Restaurant`;
CREATE DATABASE `Restaurant`;
USE `Restaurant`;

CREATE TABLE Employees (
    ID INT NOT NULL,
    fname VARCHAR(15) NOT NULL,
    minit CHAR(1),
    lname VARCHAR(15) NOT NULL,
    dob DATE,                       -- Added Date of Birth
    position VARCHAR(30),           -- Added Position
    hoursPerWeek INT,               -- Added Hours Per Week
    ManagerID INT DEFAULT NULL,
    Salary INT DEFAULT NULL,
    Rate DECIMAL(4,2) DEFAULT NULL,
    PRIMARY KEY (ID),
    FOREIGN KEY (ManagerID) REFERENCES Employees(ID)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT CHK_HRS CHECK (hoursPerWeek >= 0)
);

CREATE TABLE Manages (
	ManagerID		INT			NOT NULL,
    EmployeeID		INT			NOT NULL,
    PRIMARY KEY(ManagerID, EmployeeID),
	FOREIGN KEY(ManagerID) REFERENCES Employees(ID)
    	ON DELETE CASCADE 		ON UPDATE CASCADE,
	FOREIGN KEY(EmployeeID) REFERENCES Employees(ID)
		ON DELETE CASCADE		ON UPDATE CASCADE
);

CREATE TABLE Schedule (
    EntryID         INT             NOT NULL    AUTO_INCREMENT, 
    EmployeeID      INT             NOT NULL,
    AvDate          DATE            NOT NULL,                   
    StartTime       TIME            NOT NULL,                   
    EndTime         TIME            NOT NULL,                   
    Status          VARCHAR(9)      NOT NULL,    --  'Available' and 'Scheduled' are 9 characters long
    PRIMARY KEY (EntryID),
    FOREIGN KEY (EmployeeID) REFERENCES Employees(ID)
    	ON DELETE CASCADE		ON UPDATE CASCADE,
    CONSTRAINT TIME_CHK CHECK (StartTime < EndTime),
    CONSTRAINT STATUS_CHK CHECK ((Status = 'Available') OR (Status = 'Scheduled'))
);

CREATE TABLE Clocked_Times (
  ClockID			INT 		NOT NULL 	AUTO_INCREMENT,		-- unique identifier generated each time
  EmployeeID		INT			NOT NULL,
  ClockedStart		TIMESTAMP	NOT NULL,
  ClockedEnd		TIMESTAMP	NOT NULL,
  PRIMARY KEY(ClockID),
  FOREIGN KEY(EmployeeID) REFERENCES Employees(ID)
  	ON DELETE CASCADE		ON UPDATE CASCADE,
  CONSTRAINT CHK_TIME CHECK (ClockedStart < ClockedEnd)
);

CREATE TABLE Cook (
  EmployeeID		INT 		NOT NULL,
  Specialty			VARCHAR(15)	NOT NULL,
  FOREIGN KEY(EmployeeID) REFERENCES Employees(ID)
  	ON DELETE CASCADE		ON UPDATE CASCADE
);

CREATE TABLE Server (
  EmployeeID		INT 			NOT NULL,
  Tips				DECIMAL(5,2)	DEFAULT NULL,
  FOREIGN KEY(EmployeeID) REFERENCES Employees(ID)
	ON DELETE CASCADE		ON UPDATE CASCADE
);

CREATE TABLE RTable (
	TableNum		INT		NOT NULL,
    NumSeats		INT		NOT NULL,
    ServerID		INT		NOT NULL,
    PRIMARY KEY(TableNum),
    FOREIGN KEY(ServerID) REFERENCES Server(EmployeeID)
		ON DELETE CASCADE		ON UPDATE CASCADE
);

CREATE TABLE Waitlist (
	WaitlistID		INT 			NOT NULL,
    WaitName		VARCHAR(15)		NOT NULL,
    HostID			INT				NOT NULL,
    PRIMARY KEY(WaitlistID),
    FOREIGN KEY(HostID) REFERENCES Employees(ID)
		ON DELETE CASCADE		ON UPDATE CASCADE
);

CREATE TABLE Reservation (
	ResID		INT		 	NOT NULL,
    ResName		VARCHAR(15)	NOT NULL,
    ResInfo		TIMESTAMP	NOT NULL,
	HostID		INT				NOT NULL,
    PRIMARY KEY(ResID),
    FOREIGN KEY(HostID) REFERENCES Employees(ID)
		ON DELETE CASCADE		ON UPDATE CASCADE
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
	Mname	VARCHAR(25)		NOT NULL,
    Price	DECIMAL(4,2)	NOT NULL,
    Recipe	TEXT			NOT NULL,
    Descr	TEXT			NOT NULL,
    PRIMARY KEY(Mname)
);

CREATE TABLE Menu_item_ingredients (
	Mname				VARCHAR(25)		NOT NULL,
    IngredientID		INT		NOT NULL,
    PRIMARY KEY(Mname, IngredientID),
    FOREIGN KEY(Mname) REFERENCES Menu_item(Mname)
    	ON DELETE CASCADE 		ON UPDATE CASCADE,
    FOREIGN KEY(IngredientID) REFERENCES Ingredients(IngredientID)
    	ON DELETE CASCADE 		ON UPDATE CASCADE
);