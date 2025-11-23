import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db';

// Register a new user (passenger or driver)
export const register = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, phone, userType } = req.body;
    
    // Check if user already exists
    const [users] = await db.query(
      'SELECT * FROM PASSENGERS WHERE email = ? UNION SELECT * FROM DRIVERS WHERE email = ?',
      [email, email]
    ) as any[];

    if (users.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert into appropriate table based on user type
    if (userType === 'passenger') {
      const [result] = await db.query(
        'INSERT INTO PASSENGERS (Full_Name, Email, Phone, Password) VALUES (?, ?, ?, ?)',
        [fullName, email, phone, hashedPassword]
      ) as any[];
      
      // Create JWT token
      const payload = {
        user: {
          id: result.insertId,
          type: 'passenger'
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '7d' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } else if (userType === 'driver') {
      const { licenseNo } = req.body;
      const [result] = await db.query(
        'INSERT INTO DRIVERS (Full_Name, Email, Phone, License_No, Password) VALUES (?, ?, ?, ?, ?)',
        [fullName, email, phone, licenseNo, hashedPassword]
      ) as any[];
      
      // Create JWT token
      const payload = {
        user: {
          id: result.insertId,
          type: 'driver'
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '7d' },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } else {
      return res.status(400).json({ message: 'Invalid user type' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Login user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Check if user exists in either passengers or drivers table
    const [users] = await db.query(
      'SELECT * FROM PASSENGERS WHERE email = ? UNION SELECT * FROM DRIVERS WHERE email = ?',
      [email, email]
    ) as any[];

    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.Password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Determine user type
    const userType = 'License_No' in user ? 'driver' : 'passenger';

    // Create JWT payload
    const payload = {
      user: {
        id: user.Passenger_ID || user.Driver_ID,
        type: userType
      }
    };

    // Sign token
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: {
            id: user.Passenger_ID || user.Driver_ID,
            name: user.Full_Name,
            email: user.Email,
            type: userType
          }
        });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

// Get current user
export const getMe = async (req: any, res: Response) => {
  try {
    const userId = req.user.id;
    const userType = req.user.type;
    
    let user;
    if (userType === 'passenger') {
      const [rows] = await db.query(
        'SELECT Passenger_ID as id, Full_Name as name, Email as email, Phone as phone, Avg_Rating as rating FROM PASSENGERS WHERE Passenger_ID = ?',
        [userId]
      ) as any[];
      user = rows[0];
    } else {
      const [rows] = await db.query(
        'SELECT Driver_ID as id, Full_Name as name, Email as email, Phone as phone, Avg_Rating as rating, Status as status FROM DRIVERS WHERE Driver_ID = ?',
        [userId]
      ) as any[];
      user = rows[0];
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ ...user, type: userType });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};
