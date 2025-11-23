# RideFlow - Smart Ridesharing Platform

A modern, full-stack ridesharing platform built with React, TypeScript, Node.js, and MySQL.

## 🚀 Features

- **User Authentication**: Secure JWT-based authentication for passengers and drivers
- **Live Map Integration**: Real-time ride tracking with OpenStreetMap and Leaflet
- **Ride Booking**: Complete ride booking flow with driver assignment
- **Dashboard**: Comprehensive dashboards for passengers and drivers
- **Ride History**: Track and review past rides
- **Profile Management**: User profile and settings management
- **Responsive Design**: Beautiful, mobile-friendly UI with Tailwind CSS

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for blazing-fast development
- Tailwind CSS for styling
- Framer Motion for animations
- React Leaflet for maps
- Zustand for state management
- React Router for navigation

### Backend
- Node.js with Express
- TypeScript
- MySQL database
- JWT authentication
- bcrypt for password hashing

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MySQL 8.0+
- Git

### Clone the Repository
```bash
git clone https://github.com/devankk667/rideshare.git
cd rideshare
```

### Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Setup database
npm run db:setup

# Start backend server
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app!

## 🌐 Deployment

### Vercel Deployment
See [Vercel Deployment Guide](./docs/vercel_deployment_guide.md) for detailed instructions.

Quick deploy:
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Database Hosting
- **PlanetScale** (recommended): https://planetscale.com
- **Railway**: https://railway.app
- **Vercel Postgres**: https://vercel.com/storage/postgres

## 📁 Project Structure

```
RIDEFLOW/
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth middleware
│   │   ├── config/       # Database config
│   │   └── scripts/      # Database setup scripts
│   └── package.json
│
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── stores/       # Zustand stores
│   │   ├── types/        # TypeScript types
│   │   └── utils/        # Helper functions
│   └── package.json
│
└── mysql.md              # Database schema documentation
```

## 🔐 Environment Variables

### Backend (.env)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=rideshare_db
PORT=5000
JWT_SECRET=your_secret_key
NODE_ENV=development
```

## 🧪 Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd RideFlow
npm run lint
npm run build
```

## 📝 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Rides
- `POST /api/rides` - Create new ride
- `PUT /api/rides/:id/status` - Update ride status
- `GET /api/passengers/rides` - Get user's rides

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Devank**
- GitHub: [@devankk667](https://github.com/devankk667)

## 🙏 Acknowledgments

- OpenStreetMap for map tiles
- Leaflet for map library
- Lucide React for icons
- Tailwind CSS for styling

---

Made with ❤️ by Devank
