import { Request, Response } from 'express';
import db from '../config/db';

// 2.3.1 Creating New Ride Requests (Alternative/General)
export const createRide = async (req: any, res: Response) => {
    const { passengerId, driverId, pickup, destination, distance, duration, fare, vehicleType } = req.body;

    console.log('Create Ride Request:', { passengerId, driverId, pickup, destination, vehicleType });

    try {
        // 1. Create Route
        const [routeResult] = await db.query(
            'INSERT INTO ROUTES (Start_Point, End_Point, Distance_km, Duration_min) VALUES (?, ?, ?, ?)',
            [pickup.address, destination.address, distance, duration]
        ) as any[];
        const routeId = routeResult.insertId;

        // 2. Validate/Find Driver
        // Frontend might send a mock driver ID (string) which fails FK constraint (INT).
        // We need to ensure we have a valid REAL driver ID.
        let realDriverId = parseInt(driverId);

        if (isNaN(realDriverId)) {
            console.log(`Driver ID ${driverId} is not a number. Finding any available driver.`);
            realDriverId = 0; // Trigger lookup
        } else {
            // Check if this driver exists
            const [driverCheck] = await db.query('SELECT Driver_ID FROM DRIVERS WHERE Driver_ID = ?', [realDriverId]) as any[];
            if (driverCheck.length === 0) {
                console.log(`Driver ID ${realDriverId} not found in DB. Finding any available driver.`);
                realDriverId = 0;
            }
        }

        if (realDriverId === 0) {
            // Find any active driver
            const [anyDriver] = await db.query('SELECT Driver_ID FROM DRIVERS LIMIT 1') as any[];
            if (anyDriver.length > 0) {
                realDriverId = anyDriver[0].Driver_ID;
                console.log(`Using existing driver ID: ${realDriverId}`);
            } else {
                // Create a placeholder driver if DB is empty
                console.log('No drivers in DB. Creating a placeholder driver.');
                const [newDriver] = await db.query(
                    'INSERT INTO DRIVERS (Full_Name, Email, Phone, Password, License_No, Status) VALUES (?, ?, ?, ?, ?, ?)',
                    ['System Driver', 'driver@system.com', '0000000000', 'hashedpass', 'SYS-LIC-001', 'Active']
                ) as any[];
                realDriverId = newDriver.insertId;
            }
        }

        // 3. Find or Create Vehicle for Driver
        let vehicleId = null;
        const [vehicles] = await db.query(
            'SELECT Vehicle_ID FROM VEHICLES WHERE Driver_ID = ?',
            [realDriverId]
        ) as any[];

        if (vehicles.length > 0) {
            vehicleId = vehicles[0].Vehicle_ID;
        } else {
            // Create a default vehicle for the driver if none exists
            const [vehResult] = await db.query(
                'INSERT INTO VEHICLES (Driver_ID, Model, Capacity, Type) VALUES (?, ?, ?, ?)',
                [realDriverId, 'Default Vehicle', 4, vehicleType === 'bike' ? 'Bike' : 'Car']
            ) as any[];
            vehicleId = vehResult.insertId;
        }

        // 4. Create Ride
        const [result] = await db.query(
            'INSERT INTO RIDES (Passenger_ID, Driver_ID, Route_ID, Vehicle_ID, Fare, Status) VALUES (?, ?, ?, ?, ?, ?)',
            [passengerId, realDriverId, routeId, vehicleId, fare, 'Accepted']
        ) as any[];

        const newRideId = result.insertId;

        // 5. Fetch the created ride details to return
        const [rideDetails] = await db.query(`
            SELECT 
                r.Ride_ID as id,
                r.Passenger_ID as passengerId,
                r.Driver_ID as driverId,
                r.Vehicle_ID as vehicleId,
                r.Fare as fare,
                r.Status as status,
                r.Created_At as createdAt,
                rt.Start_Point as pickupAddress,
                rt.End_Point as destinationAddress,
                rt.Distance_km as distance,
                rt.Duration_min as duration
            FROM RIDES r
            JOIN ROUTES rt ON r.Route_ID = rt.Route_ID
            WHERE r.Ride_ID = ?
        `, [newRideId]) as any[];

        const ride = rideDetails[0];

        // Format response to match frontend expectation
        const formattedRide = {
            id: ride.id,
            passengerId: ride.passengerId,
            driverId: ride.driverId,
            vehicleId: ride.vehicleId,
            fare: ride.fare,
            status: ride.status.toLowerCase(),
            createdAt: ride.createdAt,
            pickup: { address: ride.pickupAddress, lat: 0, lng: 0 }, // Lat/Lng not stored in DB yet
            destination: { address: ride.destinationAddress, lat: 0, lng: 0 },
            distance: ride.distance,
            duration: ride.duration
        };

        res.status(201).json(formattedRide);
    } catch (err) {
        console.error('Create ride error:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// 2.3.2 Updating Ride Status
export const updateRideStatus = async (req: Request, res: Response) => {
    const { rideId } = req.params;
    const { status } = req.body; // 'Accepted', 'Ongoing', 'Completed', 'Cancelled'
    try {
        await db.query(
            'UPDATE RIDES SET Status = ? WHERE Ride_ID = ?',
            [status, rideId]
        );
        res.json({ message: `Ride status updated to ${status}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// 2.3.3 Viewing Active Rides
export const getActiveRides = async (req: Request, res: Response) => {
    try {
        const [rides] = await db.query("SELECT * FROM RIDES WHERE Status = 'Ongoing'") as any[];
        res.json(rides);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// 3.2.A Generating Comprehensive Ride History (Multi-Table Join)
export const getRideDetails = async (req: Request, res: Response) => {
    const { rideId } = req.params;
    try {
        const [rows] = await db.query(`
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
          r.Ride_ID = ?
    `, [rideId]) as any[];

        if (rows.length === 0) return res.status(404).json({ message: 'Ride not found' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// 3.2.D Analyzing Traffic Impact on Ride Duration
export const getTrafficImpactAnalysis = async (req: Request, res: Response) => {
    try {
        const [analysis] = await db.query(`
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
    `) as any[];
        res.json(analysis);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
