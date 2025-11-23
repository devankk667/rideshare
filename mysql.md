### 1.1 Core User Tables

The User Management module requires tables to store passenger and driver information.

**Table Name: PASSENGERS**
- Purpose: Stores personal details and account information of all registered passengers.
- Key Fields: Passenger_ID (PK), Full_Name, Phone, Email, Avg_Rating

**Table Name: DRIVERS**
- Purpose: Stores personal details, licensing information, and verification status of all registered drivers.
- Key Fields: Driver_ID (PK), Full_Name, License_No, Phone, Email, Status, Join_Date, Avg_Rating

### 1.2 Vehicle Management Tables

**Table Name: VEHICLES**
- Purpose: Stores information about all vehicles registered on the platform.
- Key Fields: Vehicle_ID (PK), Driver_ID (FK), Model, Capacity, Type, Created_At

### 1.3 Route and Ride Management Tables

**Table Name: ROUTES**
- Purpose: Stores predefined route information for efficient ride planning and fare calculation.
- Key Fields: Route_ID (PK), Start_Point, End_Point, Distance_km, Duration_min

**Table Name: RIDES**
- Purpose: Core table managing complete ride lifecycle from request to completion.
- Key Fields: Ride_ID (PK), Passenger_ID (FK), Driver_ID (FK), Route_ID (FK), Vehicle_ID (FK), Applied_Promo_ID (FK), Fare, Status, Created_At

### 1.4 Financial Management Tables

**Table Name: PAYMENTS**
- Purpose: Manages all payment transactions with support for multiple payment methods.
- Key Fields: Payment_ID (PK), Ride_ID (FK), Amount, Mode, Status, Payment_Date

**Table Name: PROMOS**
- Purpose: Manages promotional codes and discount campaigns.
- Key Fields: Promo_ID (PK), Code, Description, Expiry_Date, Discount_Percent, Min_Fare, Created_At

### 1.5 Quality Assurance Tables

**Table Name: FEEDBACK**
- Purpose: Stores ratings and reviews from both passengers and drivers for quality management.
- Key Fields: Feedback_ID (PK), Ride_ID (FK), Passenger_ID (FK), Driver_ID (FK), Rating

### 1.6 Safety and Incident Management Tables

**Table Name: ACCIDENTS**
- Purpose: Records and tracks accident reports and incidents during rides.
- Key Fields: Accident_ID (PK), Ride_ID (FK), Occurred_At, Description, Claim_Status, Severity

**Table Name: INSURANCE**
- Purpose: Manages vehicle insurance information and policy details.
- Key Fields: Insurance_ID (PK), Vehicle_ID (FK), Provider, Issued_On, Valid_Until, Coverage_Details

### 1.7 Traffic and Location Management Tables

**Table Name: TRAFFIC_REPORTS**
- Purpose: Stores real-time traffic conditions and route advisories.
- Key Fields: Report_ID (PK), Route_ID (FK), Reported_At, Severity

**Table Name: ADMINS**
- Purpose: Manages platform administrators with role-based access control.
- Key Fields: Admin_ID (PK), Name, Email, Role, Phone

### SQL for Table Creation

```sql
-- Core User Tables
CREATE TABLE PASSENGERS (
    Passenger_ID INT AUTO_INCREMENT PRIMARY KEY,
    Full_Name VARCHAR(100) NOT NULL,
    Phone VARCHAR(15) UNIQUE NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Avg_Rating DECIMAL(2,1) NULL
);

CREATE TABLE DRIVERS (
    Driver_ID INT AUTO_INCREMENT PRIMARY KEY,
    Full_Name VARCHAR(100) NOT NULL,
    License_No VARCHAR(20) UNIQUE NOT NULL,
    Phone VARCHAR(15) UNIQUE NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Status ENUM('Active','Inactive','Suspended') DEFAULT 'Active',
    Join_Date DATE DEFAULT CURRENT_DATE,
    Avg_Rating DECIMAL(2,1) NULL
);

-- Vehicle Management Tables
CREATE TABLE VEHICLES (
    Vehicle_ID INT AUTO_INCREMENT PRIMARY KEY,
    Driver_ID INT NOT NULL,
    Model VARCHAR(50) NOT NULL,
    Capacity INT CHECK(Capacity > 0),
    Type ENUM('Car','Bike','Auto','SUV','Luxury'),
    Created_At DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Driver_ID) REFERENCES DRIVERS(Driver_ID)
);

-- Route and Ride Management Tables
CREATE TABLE ROUTES (
    Route_ID INT AUTO_INCREMENT PRIMARY KEY,
    Start_Point VARCHAR(100) NOT NULL,
    End_Point VARCHAR(100) NOT NULL,
    Distance_km DECIMAL(6,2) CHECK(Distance_km > 0),
    Duration_min INT CHECK(Duration_min > 0)
);

CREATE TABLE RIDES (
    Ride_ID INT AUTO_INCREMENT PRIMARY KEY,
    Passenger_ID INT NOT NULL,
    Driver_ID INT NOT NULL,
    Route_ID INT NOT NULL,
    Vehicle_ID INT NULL,
    Applied_Promo_ID INT NULL,
    Fare DECIMAL(10,2) CHECK(Fare >= 0),
    Status ENUM('Requested','Accepted','Ongoing','Completed','Cancelled') DEFAULT 'Requested',
    Created_At DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Passenger_ID) REFERENCES PASSENGERS(Passenger_ID),
    FOREIGN KEY (Driver_ID) REFERENCES DRIVERS(Driver_ID),
    FOREIGN KEY (Route_ID) REFERENCES ROUTES(Route_ID),
    FOREIGN KEY (Vehicle_ID) REFERENCES VEHICLES(Vehicle_ID)
);

-- Financial Management Tables
CREATE TABLE PAYMENTS (
    Payment_ID INT AUTO_INCREMENT PRIMARY KEY,
    Ride_ID INT NOT NULL UNIQUE,
    Amount DECIMAL(10,2) CHECK(Amount >= 0) NOT NULL,
    Mode ENUM('Cash','Card','UPI','Wallet') NOT NULL,
    Status ENUM('Pending','Successful','Failed','Refunded') DEFAULT 'Pending',
    Payment_Date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (Ride_ID) REFERENCES RIDES(Ride_ID)
);

CREATE TABLE PROMOS (
    Promo_ID INT AUTO_INCREMENT PRIMARY KEY,
    Code VARCHAR(20) UNIQUE NOT NULL,
    Description TEXT NULL,
    Expiry_Date DATE NOT NULL,
    Discount_Percent DECIMAL(5,2) CHECK(Discount_Percent BETWEEN 0 AND 100),
    Min_Fare DECIMAL(10,2) NULL,
    Created_At DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Quality Assurance Tables
CREATE TABLE FEEDBACK (
    Feedback_ID INT AUTO_INCREMENT PRIMARY KEY,
    Ride_ID INT NOT NULL,
    Passenger_ID INT NOT NULL,
    Driver_ID INT NOT NULL,
    Rating DECIMAL(2,1) CHECK(Rating BETWEEN 0 AND 5),
    FOREIGN KEY (Ride_ID) REFERENCES RIDES(Ride_ID),
    FOREIGN KEY (Passenger_ID) REFERENCES PASSENGERS(Passenger_ID),
    FOREIGN KEY (Driver_ID) REFERENCES DRIVERS(Driver_ID)
);

-- Safety and Incident Management Tables
CREATE TABLE ACCIDENTS (
    Accident_ID INT AUTO_INCREMENT PRIMARY KEY,
    Ride_ID INT NOT NULL,
    Occurred_At DATETIME NOT NULL,
    Description TEXT NOT NULL,
    Claim_Status ENUM('Open','InProgress','Closed') DEFAULT 'Open',
    Severity ENUM('Minor','Major','Critical') DEFAULT 'Minor',
    FOREIGN KEY (Ride_ID) REFERENCES RIDES(Ride_ID)
);

CREATE TABLE INSURANCE (
    Insurance_ID INT AUTO_INCREMENT PRIMARY KEY,
    Vehicle_ID INT NOT NULL UNIQUE,
    Provider VARCHAR(100) NOT NULL,
    Issued_On DATE NOT NULL,
    Valid_Until DATE NOT NULL,
    Coverage_Details TEXT NULL,
    FOREIGN KEY (Vehicle_ID) REFERENCES VEHICLES(Vehicle_ID)
);

-- Traffic and Location Management Tables
CREATE TABLE TRAFFIC_REPORTS (
    Report_ID INT AUTO_INCREMENT PRIMARY KEY,
    Route_ID INT NOT NULL,
    Reported_At DATETIME NOT NULL,
    Severity ENUM('Low','Medium','High') DEFAULT 'Low',
    FOREIGN KEY (Route_ID) REFERENCES ROUTES(Route_ID)
);

CREATE TABLE ADMINS (
    Admin_ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Role ENUM('SuperAdmin','Support','Manager') NOT NULL,
    Phone VARCHAR(15) UNIQUE NULL
);
```

---

## Chapter 2: Data Manipulation Language (DML)

Data Manipulation Language (DML) operations form the functional backbone of the Ridesharing Application. They handle the dynamic interaction between the user interface and the database, enabling the addition, retrieval, modification, and removal of data records in real time. Each module implements these operations to maintain up-to-date and consistent records.

### 2.1 User Management System

The User Management System allows passengers and drivers to register, update profiles, and manage their accounts.

#### 2.1.1 Adding New Passengers
When a new passenger registers, an entry is added to the PASSENGERS table.
```sql
INSERT INTO PASSENGERS (Full_Name, Phone, Email) 
VALUES ('John Doe', '9876543210', 'john.doe@example.com');
```

#### 2.1.2 Adding New Drivers
When a new driver registers, an entry is added to the DRIVERS table.
```sql
INSERT INTO DRIVERS (Full_Name, License_No, Phone, Email) 
VALUES ('Jane Smith', 'DL123456789', '9876543211', 'jane.smith@example.com');
```

#### 2.1.3 Updating Driver Status
When a driver's status changes, the DRIVERS table is updated:
```sql
UPDATE DRIVERS SET Status = 'Suspended' WHERE Driver_ID = 101;
```

#### 2.1.4 Deleting Passenger Accounts
When a passenger requests account deletion:
```sql
DELETE FROM PASSENGERS WHERE Passenger_ID = 201;
```

### 2.2 Vehicle Management System

The Vehicle Management System tracks all vehicles registered on the platform.

#### 2.2.1 Adding New Vehicles
When a driver adds a new vehicle:
```sql
INSERT INTO VEHICLES (Driver_ID, Model, Capacity, Type) 
VALUES (101, 'Toyota Camry', 4, 'Car');
```

#### 2.2.2 Updating Vehicle Information
When vehicle details need to be updated:
```sql
UPDATE VEHICLES SET Model = 'Honda Accord' WHERE Vehicle_ID = 301;
```

#### 2.2.3 Viewing Driver Vehicles
Retrieving all vehicles for a specific driver:
```sql
SELECT * FROM VEHICLES WHERE Driver_ID = 101;
```

#### 2.2.4 Deleting Vehicle Records
When a vehicle is no longer available:
```sql
DELETE FROM VEHICLES WHERE Vehicle_ID = 302;
```

### 2.3 Ride Booking & Management System

This module handles ride requests, matching, and status updates.

#### 2.3.1 Creating New Ride Requests
When a passenger requests a ride:
```sql
INSERT INTO RIDES (Passenger_ID, Driver_ID, Route_ID, Vehicle_ID, Fare) 
VALUES (201, 101, 401, 301, 150.00);
```

#### 2.3.2 Updating Ride Status
When a ride status changes:
```sql
UPDATE RIDES SET Status = 'Ongoing' WHERE Ride_ID = 501;
```

#### 2.3.3 Viewing Active Rides
Retrieving all ongoing rides:
```sql
SELECT * FROM RIDES WHERE Status = 'Ongoing';
```

#### 2.3.4 Canceling Ride Requests
When a passenger cancels a ride:
```sql
UPDATE RIDES SET Status = 'Cancelled' WHERE Ride_ID = 502;
```

### 2.4 Payment & Financial System

This module handles all financial transactions and promotional activities.

#### 2.4.1 Processing Payments
When a ride payment is processed:
```sql
INSERT INTO PAYMENTS (Ride_ID, Amount, Mode, Status) 
VALUES (501, 150.00, 'Card', 'Successful');
```

#### 2.4.2 Adding Promotional Codes
When new promotions are created:
```sql
INSERT INTO PROMOS (Code, Description, Expiry_Date, Discount_Percent, Min_Fare) 
VALUES ('SUMMER20', '20% off on all rides', '2025-12-31', 20.00, 100.00);
```

#### 2.4.3 Viewing Payment History
Retrieving payment history for a passenger:
```sql
SELECT p.Payment_ID, p.Amount, p.Mode, p.Status, r.Created_At 
FROM PAYMENTS p 
JOIN RIDES r ON p.Ride_ID = r.Ride_ID 
WHERE r.Passenger_ID = 201;
```

#### 2.4.4 Processing Refunds
When a refund is issued:
```sql
UPDATE PAYMENTS SET Status = 'Refunded' WHERE Payment_ID = 601;
```

### 2.5 Feedback & Quality Management System

This module manages ratings, reviews, and incident reports.

#### 2.5.1 Adding Feedback
When a passenger provides feedback after a ride:
```sql
INSERT INTO FEEDBACK (Ride_ID, Passenger_ID, Driver_ID, Rating) 
VALUES (501, 201, 101, 4.5);
```

#### 2.5.2 Reporting Accidents
When an accident is reported:
```sql
INSERT INTO ACCIDENTS (Ride_ID, Occurred_At, Description, Severity) 
VALUES (501, '2025-07-15 14:30:00', 'Minor collision at intersection', 'Minor');
```

#### 2.5.3 Viewing Driver Ratings
Retrieving average rating for a driver:
```sql
SELECT AVG(Rating) AS Avg_Rating 
FROM FEEDBACK 
WHERE Driver_ID = 101;
```

#### 2.5.4 Updating Accident Status
When an accident claim is processed:
```sql
UPDATE ACCIDENTS SET Claim_Status = 'Closed' WHERE Accident_ID = 701;
```

### 2.6 Summary

Across all five modules, DML operations ensure smooth interaction between frontend forms and the backend database. Every INSERT, UPDATE, and DELETE action is synchronized with triggers to maintain data integrity and consistency throughout the system.

---

## Chapter 3: Operations on Database

This chapter details the enforcement of data integrity, the establishment of relationships, and the use of query logic (Joins and Subqueries) within the Ridesharing Application database.

### 3.1 Constraints and Relationships

Database constraints are essential for maintaining the consistency and reliability of data. The system utilizes Primary Keys (PK), Foreign Keys (FK), NOT NULL, and ENUM constraints to govern data structure and relationships.

#### A. Referential Integrity and Cascading Actions

The system employs different ON DELETE actions to handle data dependency gracefully:

| Table Relationship | Action Used | Justification |
|-------------------|-------------|---------------|
| VEHICLES.Driver_ID → DRIVERS | ON DELETE RESTRICT | Prevents deletion of drivers who have registered vehicles |
| RIDES.Passenger_ID → PASSENGERS | ON DELETE CASCADE | Removes ride history when a passenger account is deleted |
| RIDES.Driver_ID → DRIVERS | ON DELETE RESTRICT | Prevents deletion of drivers with active or completed rides |
| PAYMENTS.Ride_ID → RIDES | ON DELETE CASCADE | Removes payment records when a ride is deleted |
| FEEDBACK.Ride_ID → RIDES | ON DELETE CASCADE | Removes feedback when a ride is deleted |
| INSURANCE.Vehicle_ID → VEHICLES | ON DELETE CASCADE | Removes insurance when a vehicle is deleted |

#### B. Domain Constraints (ENUM and CHECK)

ENUM constraints restrict a column's value to a predefined list, ensuring standardized status values:
- DRIVERS.Status: ('Active', 'Inactive', 'Suspended')
- VEHICLES.Type: ('Car', 'Bike', 'Auto', 'SUV', 'Luxury')
- RIDES.Status: ('Requested', 'Accepted', 'Ongoing', 'Completed', 'Cancelled')
- PAYMENTS.Mode: ('Cash', 'Card', 'UPI', 'Wallet')
- PAYMENTS.Status: ('Pending', 'Successful', 'Failed', 'Refunded')
- ACCIDENTS.Claim_Status: ('Open', 'InProgress', 'Closed')
- ACCIDENTS.Severity: ('Minor', 'Major', 'Critical')
- TRAFFIC_REPORTS.Severity: ('Low', 'Medium', 'High')
- ADMINS.Role: ('SuperAdmin', 'Support', 'Manager')

CHECK constraints ensure data validity:
- VEHICLES.Capacity > 0
- ROUTES.Distance_km > 0
- ROUTES.Duration_min > 0
- RIDES.Fare >= 0
- PAYMENTS.Amount >= 0
- PROMOS.Discount_Percent BETWEEN 0 AND 100
- FEEDBACK.Rating BETWEEN 0 AND 5

### 3.2 Joins and Subqueries

Complex operations, like generating comprehensive reports or analytics, require joining multiple tables.

#### A. Generating Comprehensive Ride History (Multi-Table Join)

This query uses a JOIN to link the RIDES, PASSENGERS, DRIVERS, VEHICLES, and ROUTES tables, showing the full details of a ride.

```sql
SELECT
    r.Ride_ID,
    p.Full_Name AS Passenger_Name,
    d.Full_Name AS Driver_Name,
    v.Model AS Vehicle_Model,
    rt.Start_Point,
    rt.End_Point,
    r.Fare,
    r.Status,
    r.Created_At
FROM
    RIDES r
JOIN
    PASSENGERS p ON r.Passenger_ID = p.Passenger_ID
JOIN
    DRIVERS d ON r.Driver_ID = d.Driver_ID
JOIN
    VEHICLES v ON r.Vehicle_ID = v.Vehicle_ID
JOIN
    ROUTES rt ON r.Route_ID = rt.Route_ID
WHERE
    r.Status = 'Completed'
ORDER BY
    r.Created_At DESC;
```

#### B. Identifying High-Performing Drivers (Date Comparison and Join)

This JOIN retrieves drivers with high average ratings and a significant number of completed rides.

```sql
SELECT
    d.Driver_ID,
    d.Full_Name,
    COUNT(r.Ride_ID) AS Total_Rides,
    AVG(f.Rating) AS Avg_Rating
FROM
    DRIVERS d
JOIN
    RIDES r ON d.Driver_ID = r.Driver_ID
JOIN
    FEEDBACK f ON r.Ride_ID = f.Ride_ID
WHERE
    r.Status = 'Completed' AND r.Created_At >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY
    d.Driver_ID, d.Full_Name
HAVING
    Total_Rides >= 20 AND Avg_Rating >= 4.5
ORDER BY
    Avg_Rating DESC;
```

#### C. Finding Expired Promotions (Subquery)

This query uses a Subquery to identify promotions that have expired but are still referenced in rides.

```sql
SELECT
    p.Promo_ID,
    p.Code,
    p.Description,
    p.Expiry_Date,
    COUNT(r.Ride_ID) AS Usage_Count
FROM
    PROMOS p
JOIN
    RIDES r ON p.Promo_ID = r.Applied_Promo_ID
WHERE
    p.Expiry_Date < CURDATE()
    AND r.Created_At > p.Expiry_Date
GROUP BY
    p.Promo_ID, p.Code, p.Description, p.Expiry_Date;
```

#### D. Analyzing Traffic Impact on Ride Duration (Complex Join)

This query analyzes how traffic conditions affect actual ride duration compared to estimated duration.

```sql
SELECT
    rt.Route_ID,
    rt.Start_Point,
    rt.End_Point,
    rt.Duration_min AS Estimated_Duration,
    AVG(TIMESTAMPDIFF(MINUTE, r.Created_At, r.Updated_At)) AS Actual_Avg_Duration,
    tr.Severity
FROM
    ROUTES rt
JOIN
    RIDES r ON rt.Route_ID = r.Route_ID
JOIN
    TRAFFIC_REPORTS tr ON rt.Route_ID = tr.Route_ID
WHERE
    r.Status = 'Completed'
    AND tr.Reported_At BETWEEN r.Created_At AND r.Updated_At
GROUP BY
    rt.Route_ID, rt.Start_Point, rt.End_Point, rt.Duration_min, tr.Severity
ORDER BY
    rt.Route_ID, tr.Severity;
```

---

## Chapter 4: Views

Views provide a layer of abstraction over the base tables, simplifying complex, frequently used queries for administrators and ensuring that sensitive data is only accessed on a need-to-know basis.

### 4.1 User Management Views

The admin needs consolidated views to quickly track user statistics and account statuses.

#### A. View for Active Driver Summary

This view provides a quick dashboard metric for all active drivers, showing their performance metrics.

```sql
CREATE VIEW V_Active_Drivers_Summary AS
SELECT
    d.Driver_ID,
    d.Full_Name,
    d.Join_Date,
    COUNT(DISTINCT r.Ride_ID) AS Total_Rides,
    AVG(f.Rating) AS Avg_Rating,
    COUNT(DISTINCT v.Vehicle_ID) AS Vehicle_Count
FROM
    DRIVERS d
LEFT JOIN
    RIDES r ON d.Driver_ID = r.Driver_ID
LEFT JOIN
    FEEDBACK f ON r.Ride_ID = f.Ride_ID
LEFT JOIN
    VEHICLES v ON d.Driver_ID = v.Driver_ID
WHERE
    d.Status = 'Active'
GROUP BY
    d.Driver_ID, d.Full_Name, d.Join_Date
ORDER BY
    Avg_Rating DESC;
```

#### B. View for Passenger Activity

This view tracks passenger activity levels for marketing and engagement strategies.

```sql
CREATE VIEW V_Passenger_Activity AS
SELECT
    p.Passenger_ID,
    p.Full_Name,
    p.Email,
    COUNT(DISTINCT r.Ride_ID) AS Total_Rides,
    SUM(r.Fare) AS Total_Spent,
    MAX(r.Created_At) AS Last_Ride_Date
FROM
    PASSENGERS p
LEFT JOIN
    RIDES r ON p.Passenger_ID = r.Passenger_ID
GROUP BY
    p.Passenger_ID, p.Full_Name, p.Email
ORDER BY
    Total_Rides DESC;
```

### 4.2 Ride Operations Views

The primary administrative need is a real-time summary of ride operations and performance metrics.

#### A. View for Daily Ride Statistics

This view provides daily ride statistics for operational planning.

```sql
CREATE VIEW V_Daily_Ride_Statistics AS
SELECT
    DATE(Created_At) AS Ride_Date,
    COUNT(Ride_ID) AS Total_Rides,
    SUM(CASE WHEN Status = 'Completed' THEN 1 ELSE 0 END) AS Completed_Rides,
    SUM(CASE WHEN Status = 'Cancelled' THEN 1 ELSE 0 END) AS Cancelled_Rides,
    SUM(Fare) AS Total_Revenue,
    AVG(Fare) AS Average_Fare
FROM
    RIDES
GROUP BY
    DATE(Created_At)
ORDER BY
    Ride_Date DESC;
```

#### B. View for Popular Routes

This view identifies the most frequently used routes for resource allocation.

```sql
CREATE VIEW V_Popular_Routes AS
SELECT
    rt.Route_ID,
    rt.Start_Point,
    rt.End_Point,
    COUNT(r.Ride_ID) AS Usage_Count,
    AVG(r.Fare) AS Average_Fare,
    MAX(r.Created_At) AS Last_Used
FROM
    ROUTES rt
JOIN
    RIDES r ON rt.Route_ID = r.Route_ID
WHERE
    r.Status = 'Completed'
GROUP BY
    rt.Route_ID, rt.Start_Point, rt.End_Point
ORDER BY
    Usage_Count DESC;
```

### 4.3 Financial Management Views

Administrators require consolidated views to monitor financial performance and payment trends.

#### A. View for Payment Method Analysis

This view analyzes payment method preferences and success rates.

```sql
CREATE VIEW V_Payment_Method_Analysis AS
SELECT
    Mode,
    COUNT(Payment_ID) AS Total_Transactions,
    SUM(CASE WHEN Status = 'Successful' THEN 1 ELSE 0 END) AS Successful_Transactions,
    SUM(CASE WHEN Status = 'Failed' THEN 1 ELSE 0 END) AS Failed_Transactions,
    SUM(Amount) AS Total_Amount,
    AVG(Amount) AS Average_Amount
FROM
    PAYMENTS
GROUP BY
    Mode
ORDER BY
    Total_Transactions DESC;
```

#### B. View for Promotion Effectiveness

This view measures the effectiveness of promotional campaigns.

```sql
CREATE VIEW V_Promotion_Effectiveness AS
SELECT
    p.Promo_ID,
    p.Code,
    p.Description,
    p.Discount_Percent,
    COUNT(r.Ride_ID) AS Usage_Count,
    SUM(r.Fare) AS Total_Revenue,
    AVG(r.Fare) AS Average_Fare_With_Promo
FROM
    PROMOS p
LEFT JOIN
    RIDES r ON p.Promo_ID = r.Applied_Promo_ID
WHERE
    p.Expiry_Date >= CURDATE() OR r.Ride_ID IS NOT NULL
GROUP BY
    p.Promo_ID, p.Code, p.Description, p.Discount_Percent
ORDER BY
    Usage_Count DESC;
```

### 4.4 Quality Assurance Views

These views help monitor service quality and identify areas for improvement.

#### A. View for Driver Performance

This view provides a comprehensive performance rating for all drivers.

```sql
CREATE VIEW V_Driver_Performance AS
SELECT
    d.Driver_ID,
    d.Full_Name,
    COUNT(DISTINCT r.Ride_ID) AS Total_Rides,
    AVG(f.Rating) AS Avg_Rating,
    COUNT(DISTINCT a.Accident_ID) AS Accident_Count,
    COUNT(DISTINCT CASE WHEN a.Severity = 'Critical' THEN a.Accident_ID END) AS Critical_Accidents
FROM
    DRIVERS d
LEFT JOIN
    RIDES r ON d.Driver_ID = r.Driver_ID
LEFT JOIN
    FEEDBACK f ON r.Ride_ID = f.Ride_ID
LEFT JOIN
    ACCIDENTS a ON r.Ride_ID = a.Ride_ID
GROUP BY
    d.Driver_ID, d.Full_Name
ORDER BY
    Avg_Rating DESC;
```

#### B. View for Incident Analysis

This view analyzes accident patterns for safety improvements.

```sql
CREATE VIEW V_Incident_Analysis AS
SELECT
    rt.Route_ID,
    rt.Start_Point,
    rt.End_Point,
    COUNT(a.Accident_ID) AS Total_Accidents,
    COUNT(DISTINCT CASE WHEN a.Severity = 'Critical' THEN a.Accident_ID END) AS Critical_Accidents,
    COUNT(DISTINCT CASE WHEN a.Claim_Status = 'Open' THEN a.Accident_ID END) AS Open_Claims
FROM
    ROUTES rt
LEFT JOIN
    RIDES r ON rt.Route_ID = r.Route_ID
LEFT JOIN
    ACCIDENTS a ON r.Ride_ID = a.Ride_ID
GROUP BY
    rt.Route_ID, rt.Start_Point, rt.End_Point
HAVING
    Total_Accidents > 0
ORDER BY
    Total_Accidents DESC;
```

---

## Chapter 5: Triggers

Triggers are automated stored procedures that execute implicitly when a specified event (INSERT, UPDATE, DELETE) occurs on a table. They are essential for enforcing business logic, maintaining data consistency, and automating actions across the Ridesharing Application.

### 5.1 User Management System Triggers

#### A. Trigger to Update Driver Average Rating

This trigger automatically updates the driver's average rating whenever new feedback is submitted.

```sql
CREATE TRIGGER TRG_Update_Driver_Rating
AFTER INSERT ON FEEDBACK
FOR EACH ROW
BEGIN
    UPDATE DRIVERS
    SET Avg_Rating = (
        SELECT AVG(Rating)
        FROM FEEDBACK
        WHERE Driver_ID = NEW.Driver_ID
    )
    WHERE Driver_ID = NEW.Driver_ID;
END;
```

#### B. Trigger to Update Passenger Average Rating

This trigger automatically updates the passenger's average rating whenever new feedback is submitted.

```sql
CREATE TRIGGER TRG_Update_Passenger_Rating
AFTER INSERT ON FEEDBACK
FOR EACH ROW
BEGIN
    UPDATE PASSENGERS
    SET Avg_Rating = (
        SELECT AVG(Rating)
        FROM FEEDBACK
        WHERE Passenger_ID = NEW.Passenger_ID
    )
    WHERE Passenger_ID = NEW.Passenger_ID;
END;
```

### 5.2 Ride Operations Triggers

#### A. Trigger to Update Vehicle Availability

This trigger updates vehicle availability when a ride is accepted or completed.

```sql
CREATE TRIGGER TRG_Update_Vehicle_Availability
AFTER UPDATE ON RIDES
FOR EACH ROW
BEGIN
    IF NEW.Status = 'Accepted' AND OLD.Status = 'Requested' THEN
        UPDATE VEHICLES
        SET Status = 'In Use'
        WHERE Vehicle_ID = NEW.Vehicle_ID;
    ELSEIF NEW.Status = 'Completed' AND OLD.Status = 'Ongoing' THEN
        UPDATE VEHICLES
        SET Status = 'Available'
        WHERE Vehicle_ID = NEW.Vehicle_ID;
    END IF;
END;
```

#### B. Trigger to Log Ride Status Changes

This trigger logs all status changes for audit purposes.

```sql
CREATE TRIGGER TRG_Log_Ride_Status_Changes
AFTER UPDATE ON RIDES
FOR EACH ROW
BEGIN
    IF NEW.Status <> OLD.Status THEN
        INSERT INTO RIDE_STATUS_LOG (Ride_ID, Old_Status, New_Status, Changed_At)
        VALUES (NEW.Ride_ID, OLD.Status, NEW.Status, NOW());
    END IF;
END;
```

### 5.3 Payment Processing Triggers

#### A. Trigger to Apply Promotional Discounts

This trigger automatically applies promotional discounts when a ride is created with a valid promo code.

```sql
CREATE TRIGGER TRG_Apply_Promo_Discount
BEFORE INSERT ON RIDES
FOR EACH ROW
BEGIN
    DECLARE discount_amount DECIMAL(10,2);
    
    IF NEW.Applied_Promo_ID IS NOT NULL THEN
        SELECT Discount_Percent INTO discount_amount
        FROM PROMOS
        WHERE Promo_ID = NEW.Applied_Promo_ID AND Expiry_Date >= CURDATE();
        
        IF discount_amount IS NOT NULL THEN
            SET NEW.Fare = NEW.Fare * (1 - discount_amount / 100);
        END IF;
    END IF;
END;
```

#### B. Trigger to Update Promo Usage Count

This trigger increments the usage count of a promotional code when it's applied to a ride.

```sql
CREATE TRIGGER TRG_Update_Promo_Usage
AFTER INSERT ON RIDES
FOR EACH ROW
BEGIN
    IF NEW.Applied_Promo_ID IS NOT NULL THEN
        UPDATE PROMOS
        SET Usage_Count = Usage_Count + 1
        WHERE Promo_ID = NEW.Applied_Promo_ID;
    END IF;
END;
```
### 5.4 Quality Assurance Triggers
#### A. Trigger to Auto-Generate Accident Report
This trigger automatically creates an incident report when a ride status is updated to 'Accident'.
```sql
CREATE TRIGGER TRG_Auto_Generate_Accident_Report
AFTER UPDATE ON RIDES
FOR EACH ROW
BEGIN
    IF NEW.Status = 'Accident' AND OLD.Status <> 'Accident' THEN
        INSERT INTO ACCIDENTS (Ride_ID, Occurred_At, Description, Severity)
        VALUES (NEW.Ride_ID, NOW(), 'Auto-generated accident report', 'Unknown');
    END IF;
END;
```
#### B. Trigger to Notify Admins of Critical Incidents
This trigger sends notifications to administrators when critical accidents are reported.
```sql
CREATE TRIGGER TRG_Notify_Critical_Incidents
AFTER INSERT ON ACCIDENTS
FOR EACH ROW
BEGIN
    IF NEW.Severity = 'Critical' THEN
        INSERT INTO ADMIN_NOTIFICATIONS (Admin_ID, Message, Created_At)
        SELECT Admin_ID, CONCAT('Critical accident reported for ride ID: ', NEW.Ride_ID), NOW()
        FROM ADMINS
        WHERE Role = 'SuperAdmin';
    END IF;
END;
