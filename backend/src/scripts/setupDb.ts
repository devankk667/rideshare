import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const createTables = async () => {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            multipleStatements: true
        });

        console.log('Connected to MySQL server.');

        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
        await connection.query(`USE ${process.env.DB_NAME}`);
        console.log(`Using database: ${process.env.DB_NAME}`);

        const schema = `
      -- Drop existing tables (in reverse order of dependencies)
      DROP TABLE IF EXISTS ADMINS;
      DROP TABLE IF EXISTS TRAFFIC_REPORTS;
      DROP TABLE IF EXISTS INSURANCE;
      DROP TABLE IF EXISTS ACCIDENTS;
      DROP TABLE IF EXISTS FEEDBACK;
      DROP TABLE IF EXISTS PAYMENTS;
      DROP TABLE IF EXISTS RIDES;
      DROP TABLE IF EXISTS ROUTES;
      DROP TABLE IF EXISTS VEHICLES;
      DROP TABLE IF EXISTS PROMOS;
      DROP TABLE IF EXISTS DRIVERS;
      DROP TABLE IF EXISTS PASSENGERS;

      -- Core User Tables
      CREATE TABLE PASSENGERS (
          Passenger_ID INT AUTO_INCREMENT PRIMARY KEY,
          Full_Name VARCHAR(100) NOT NULL,
          Phone VARCHAR(15) UNIQUE NOT NULL,
          Email VARCHAR(100) UNIQUE NOT NULL,
          Password VARCHAR(255) NOT NULL,
          Avg_Rating DECIMAL(2,1) NULL
      );

      CREATE TABLE DRIVERS (
          Driver_ID INT AUTO_INCREMENT PRIMARY KEY,
          Full_Name VARCHAR(100) NOT NULL,
          License_No VARCHAR(20) UNIQUE NOT NULL,
          Phone VARCHAR(15) UNIQUE NOT NULL,
          Email VARCHAR(100) UNIQUE NOT NULL,
          Password VARCHAR(255) NOT NULL,
          Status ENUM('Active','Inactive','Suspended') DEFAULT 'Active',
          Join_Date DATE DEFAULT (CURRENT_DATE),
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

      -- Views
      CREATE OR REPLACE VIEW V_Active_Drivers_Summary AS
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

      CREATE OR REPLACE VIEW V_Passenger_Activity AS
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

      CREATE OR REPLACE VIEW V_Daily_Ride_Statistics AS
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

      CREATE OR REPLACE VIEW V_Popular_Routes AS
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

      CREATE OR REPLACE VIEW V_Payment_Method_Analysis AS
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

      CREATE OR REPLACE VIEW V_Promotion_Effectiveness AS
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

      CREATE OR REPLACE VIEW V_Driver_Performance AS
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

      CREATE OR REPLACE VIEW V_Incident_Analysis AS
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

      -- Triggers
      DROP TRIGGER IF EXISTS TRG_Update_Driver_Rating;
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

      DROP TRIGGER IF EXISTS TRG_Update_Passenger_Rating;
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

      DROP TRIGGER IF EXISTS TRG_Update_Vehicle_Availability;
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
    `;

        await connection.query(schema);
        console.log('Tables created successfully.');

    } catch (error) {
        console.error('Error creating tables:', error);
    } finally {
        if (connection) await connection.end();
    }
};

createTables();
