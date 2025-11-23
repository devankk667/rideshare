import { Request, Response } from 'express';
import db from '../config/db';

export const getActiveDriversSummary = async (req: Request, res: Response) => {
    try {
        const [rows] = await db.query('SELECT * FROM V_Active_Drivers_Summary') as any[];
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getPassengerActivity = async (req: Request, res: Response) => {
    try {
        const [rows] = await db.query('SELECT * FROM V_Passenger_Activity') as any[];
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getDailyRideStats = async (req: Request, res: Response) => {
    try {
        const [rows] = await db.query('SELECT * FROM V_Daily_Ride_Statistics') as any[];
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getPopularRoutes = async (req: Request, res: Response) => {
    try {
        const [rows] = await db.query('SELECT * FROM V_Popular_Routes') as any[];
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getPaymentAnalysis = async (req: Request, res: Response) => {
    try {
        const [rows] = await db.query('SELECT * FROM V_Payment_Method_Analysis') as any[];
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getDriverPerformance = async (req: Request, res: Response) => {
    try {
        const [rows] = await db.query('SELECT * FROM V_Driver_Performance') as any[];
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getIncidentAnalysis = async (req: Request, res: Response) => {
    try {
        const [rows] = await db.query('SELECT * FROM V_Incident_Analysis') as any[];
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
