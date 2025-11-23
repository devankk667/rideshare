import { Request, Response } from 'express';
import db from '../config/db';

// 2.1.2 Adding New Drivers
export const registerDriver = async (req: Request, res: Response) => {
    const { fullName, licenseNo, phone, email } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO DRIVERS (Full_Name, License_No, Phone, Email) VALUES (?, ?, ?, ?)',
            [fullName, licenseNo, phone, email]
        ) as any[];
        res.status(201).json({ message: 'Driver registered successfully', driverId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error', error: err });
    }
};

// 2.1.3 Updating Driver Status
export const updateDriverStatus = async (req: any, res: Response) => {
    const { status } = req.body; // 'Active', 'Inactive', 'Suspended'
    try {
        await db.query(
            'UPDATE DRIVERS SET Status = ? WHERE Driver_ID = ?',
            [status, req.user.id]
        );
        res.json({ message: 'Driver status updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// 2.2.1 Adding New Vehicles
export const addVehicle = async (req: any, res: Response) => {
    const { model, capacity, type } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO VEHICLES (Driver_ID, Model, Capacity, Type) VALUES (?, ?, ?, ?)',
            [req.user.id, model, capacity, type]
        ) as any[];
        res.status(201).json({ message: 'Vehicle added successfully', vehicleId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// 2.2.3 Viewing Driver Vehicles
export const getDriverVehicles = async (req: any, res: Response) => {
    try {
        const [vehicles] = await db.query(
            'SELECT * FROM VEHICLES WHERE Driver_ID = ?',
            [req.user.id]
        ) as any[];
        res.json(vehicles);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// 3.2.B Identifying High-Performing Drivers
export const getHighPerformingDrivers = async (req: Request, res: Response) => {
    try {
        const [drivers] = await db.query(`
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
    `) as any[];
        res.json(drivers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getDriverProfile = async (req: any, res: Response) => {
    try {
        const [rows] = await db.query('SELECT * FROM DRIVERS WHERE Driver_ID = ?', [req.user.id]) as any[];
        if (rows.length === 0) return res.status(404).json({ message: 'Driver not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
