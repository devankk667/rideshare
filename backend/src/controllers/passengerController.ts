import { Request, Response } from 'express';
import db from '../config/db';

export const getPassengerProfile = async (req: any, res: Response) => {
  try {
    const [rows] = await db.query(
      'SELECT Passenger_ID as id, Full_Name as name, Email as email, Phone as phone, Avg_Rating as rating FROM PASSENGERS WHERE Passenger_ID = ?',
      [req.user.id]
    ) as any[];

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Passenger not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

export const updatePassengerProfile = async (req: any, res: Response) => {
  const { name, phone } = req.body;
  
  try {
    await db.query(
      'UPDATE PASSENGERS SET Full_Name = ?, Phone = ? WHERE Passenger_ID = ?',
      [name, phone, req.user.id]
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

export const getRideHistory = async (req: any, res: Response) => {
  try {
    const [rides] = await db.query(
      `SELECT 
        r.Ride_ID as id, 
        r.Fare as fare, 
        r.Status as status, 
        r.Created_At as date,
        d.Full_Name as driverName,
        v.Model as vehicleModel,
        ro.Start_Point as startPoint,
        ro.End_Point as endPoint
      FROM RIDES r
      JOIN DRIVERS d ON r.Driver_ID = d.Driver_ID
      JOIN VEHICLES v ON r.Vehicle_ID = v.Vehicle_ID
      JOIN ROUTES ro ON r.Route_ID = ro.Route_ID
      WHERE r.Passenger_ID = ?
      ORDER BY r.Created_At DESC`,
      [req.user.id]
    ) as any[];

    res.json(rides);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

export const requestRide = async (req: any, res: Response) => {
  const { startPoint, endPoint, vehicleType } = req.body;
  
  try {
    // 1. Find a route or create a new one
    const [routes] = await db.query(
      'SELECT * FROM ROUTES WHERE Start_Point = ? AND End_Point = ?',
      [startPoint, endPoint]
    ) as any[];

    let routeId;
    if (routes.length === 0) {
      // In a real app, you would calculate distance and duration using a mapping service
      const [result] = await db.query(
        'INSERT INTO ROUTES (Start_Point, End_Point, Distance_km, Duration_min) VALUES (?, ?, ?, ?)',
        [startPoint, endPoint, 10, 20] // Example values
      ) as any[];
      routeId = result.insertId;
    } else {
      routeId = routes[0].Route_ID;
    }

    // 2. Find an available driver (simplified)
    const [availableDrivers] = await db.query(
      `SELECT d.Driver_ID, v.Vehicle_ID 
       FROM DRIVERS d
       JOIN VEHICLES v ON d.Driver_ID = v.Driver_ID
       WHERE d.Status = 'Active' 
       AND v.Type = ?
       LIMIT 1`,
      [vehicleType || 'Car']
    ) as any[];

    if (availableDrivers.length === 0) {
      return res.status(404).json({ message: 'No drivers available' });
    }

    const { Driver_ID, Vehicle_ID } = availableDrivers[0];

    // 3. Calculate fare (simplified)
    const baseFare = 50; // Base fare in your currency
    const perKmRate = 10; // Rate per km
    const [route] = await db.query(
      'SELECT Distance_km FROM ROUTES WHERE Route_ID = ?',
      [routeId]
    ) as any[];
    
    const distance = route[0].Distance_km;
    const fare = baseFare + (distance * perKmRate);

    // 4. Create ride request
    const [result] = await db.query(
      `INSERT INTO RIDES 
       (Passenger_ID, Driver_ID, Route_ID, Vehicle_ID, Fare, Status)
       VALUES (?, ?, ?, ?, ?, 'Requested')`,
      [req.user.id, Driver_ID, routeId, Vehicle_ID, fare]
    ) as any[];

    // 5. Notify driver (in a real app, you would use WebSocket or push notifications)
    // For now, we'll just return the ride details
    const [newRide] = await db.query(
      `SELECT r.Ride_ID as id, r.Fare as fare, r.Status as status, 
              d.Full_Name as driverName, v.Model as vehicleModel,
              ro.Start_Point as startPoint, ro.End_Point as endPoint
       FROM RIDES r
       JOIN DRIVERS d ON r.Driver_ID = d.Driver_ID
       JOIN VEHICLES v ON r.Vehicle_ID = v.Vehicle_ID
       JOIN ROUTES ro ON r.Route_ID = ro.Route_ID
       WHERE r.Ride_ID = ?`,
      [result.insertId]
    ) as any[];

    res.status(201).json(newRide[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

export const cancelRide = async (req: any, res: Response) => {
  const { rideId } = req.params;
  
  try {
    // Check if ride exists and belongs to the passenger
    const [rides] = await db.query(
      'SELECT * FROM RIDES WHERE Ride_ID = ? AND Passenger_ID = ?',
      [rideId, req.user.id]
    ) as any[];

    if (rides.length === 0) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    const ride = rides[0];
    
    // Only allow cancellation if ride is not already completed or cancelled
    if (['Completed', 'Cancelled'].includes(ride.Status)) {
      return res.status(400).json({ message: `Cannot cancel a ${ride.Status.toLowerCase()} ride` });
    }

    // Update ride status to cancelled
    await db.query(
      'UPDATE RIDES SET Status = ? WHERE Ride_ID = ?',
      ['Cancelled', rideId]
    );

    // In a real app, you might want to notify the driver and handle any refunds
    
    res.json({ message: 'Ride cancelled successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

export const rateRide = async (req: any, res: Response) => {
  const { rideId } = req.params;
  const { rating, feedback } = req.body;
  
  try {
    // Check if ride exists and belongs to the passenger
    const [rides] = await db.query(
      `SELECT r.*, d.Driver_ID 
       FROM RIDES r 
       JOIN DRIVERS d ON r.Driver_ID = d.Driver_ID 
       WHERE r.Ride_ID = ? AND r.Passenger_ID = ?`,
      [rideId, req.user.id]
    ) as any[];

    if (rides.length === 0) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    const ride = rides[0];
    
    // Only allow rating for completed rides
    if (ride.Status !== 'Completed') {
      return res.status(400).json({ message: 'Can only rate completed rides' });
    }

    // Check if already rated
    const [existingFeedback] = await db.query(
      'SELECT * FROM FEEDBACK WHERE Ride_ID = ?',
      [rideId]
    ) as any[];

    if (existingFeedback.length > 0) {
      return res.status(400).json({ message: 'You have already rated this ride' });
    }

    // Create feedback
    await db.query(
      'INSERT INTO FEEDBACK (Ride_ID, Passenger_ID, Driver_ID, Rating, Comment) VALUES (?, ?, ?, ?, ?)',
      [rideId, req.user.id, ride.Driver_ID, rating, feedback || '']
    );

    // Update driver's average rating
    const [ratings] = await db.query(
      'SELECT AVG(Rating) as avgRating FROM FEEDBACK WHERE Driver_ID = ?',
      [ride.Driver_ID]
    ) as any[];

    await db.query(
      'UPDATE DRIVERS SET Avg_Rating = ? WHERE Driver_ID = ?',
      [ratings[0].avgRating, ride.Driver_ID]
    );

    // Update passenger's average rating
    const [passengerRatings] = await db.query(
      'SELECT AVG(Rating) as avgRating FROM FEEDBACK WHERE Passenger_ID = ?',
      [req.user.id]
    ) as any[];

    await db.query(
      'UPDATE PASSENGERS SET Avg_Rating = ? WHERE Passenger_ID = ?',
      [passengerRatings[0].avgRating, req.user.id]
    );

    res.json({ message: 'Thank you for your feedback!' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
