import { Request, Response } from 'express';
import db from '../config/db';

// 2.4.1 Processing Payments
export const processPayment = async (req: Request, res: Response) => {
    const { rideId, amount, mode } = req.body;
    try {
        const [result] = await db.query(
            'INSERT INTO PAYMENTS (Ride_ID, Amount, Mode, Status) VALUES (?, ?, ?, ?)',
            [rideId, amount, mode, 'Successful']
        ) as any[];
        res.status(201).json({ message: 'Payment processed successfully', paymentId: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// 2.4.4 Processing Refunds
export const refundPayment = async (req: Request, res: Response) => {
    const { paymentId } = req.params;
    try {
        await db.query(
            'UPDATE PAYMENTS SET Status = ? WHERE Payment_ID = ?',
            ['Refunded', paymentId]
        );
        res.json({ message: 'Payment refunded successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// 2.4.3 Viewing Payment History
export const getPaymentHistory = async (req: any, res: Response) => {
    try {
        const [rows] = await db.query(`
            SELECT p.Payment_ID, p.Amount, p.Mode, p.Status, r.Created_At 
            FROM PAYMENTS p 
            JOIN RIDES r ON p.Ride_ID = r.Ride_ID 
            WHERE r.Passenger_ID = ?
        `, [req.user.id]) as any[];
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
