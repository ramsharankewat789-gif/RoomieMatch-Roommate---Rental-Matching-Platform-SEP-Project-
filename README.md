# RoomieMatch — Roommate & Rental Matching Platform

RoomieMatch is a cross-platform application designed to help students, interns, working professionals, and individuals relocating to a new city find suitable roommates and rental properties.

---

## 📋 Project Overview

**Tech Stack:**
- **Frontend**: React 19, React Router 7, Tailwind CSS, Vite
- **Backend**: Node.js, Express.js, MySQL
- **Authentication**: JWT, Google OAuth, Email OTP
- **Charts & Analytics**: Chart.js, react-chartjs-2
- **Form Validation**: express-validator
- **Security**: Helmet, bcryptjs, Rate Limiting
- **File Upload**: Multer

---

## 📁 Project Structure

```
RoomieMatch/
│
├── apps/
│   ├── client/                 # Tenant & Property Owner React app (port 5173)
│   │   ├── public/
│   │   └── src/
│   │       ├── assets/
│   │       ├── components/
│   │       ├── context/
│   │       ├── hooks/
│   │       ├── layouts/
│   │       ├── pages/
│   │       │   ├── auth/
│   │       │   ├── owner/
│   │       │   ├── public/
│   │       │   └── tenant/
│   │       ├── routes/
│   │       ├── services/
│   │       └── utils/
│   │
│   └── admin/                  # Administrator React app (port 5174)
│       ├── public/
│       └── src/
│           ├── components/
│           ├── layouts/
│           ├── pages/
│           └── routes/
│
├── server/                     # Node.js / Express backend API
│   ├── src/
│   │   ├── config/             # Database & environment configuration
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Auth, validation, error handling
│   │   ├── models/             # Database models
│   │   ├── routes/             # Express routes
│   │   ├── services/           # Business logic
│   │   ├── utils/              # Helper utilities
│   │   ├── validators/         # Request validation schemas
│   │   ├── database/           # Database migrations & seed scripts
│   │   └── modules/
│   │       ├── auth/           # Registration, login, JWT, password reset
│   │       ├── users/          # User profiles & preferences
│   │       ├── properties/     # Property listings CRUD
│   │       ├── matching/       # Roommate compatibility matching
│   │       ├── messages/       # Messaging system
│   │       ├── admin/          # Admin operations
│   │       ├── verification/   # Document verification
│   │       └── notifications/  # Notification dispatch
│   └── package.json
│
├── database/                   # Migrations, schema, and seed data
│   ├── migrations/
│   ├── schema/
│   └── seeds/
│
├── shared/                     # Shared code between client and admin
│   ├── components/common/      # Reusable UI components
│   ├── constants/
│   ├── context/                # React context providers
│   ├── data/                   # Mock data
│   ├── hooks/                  # Shared React hooks
│   ├── styles/                 # Global CSS
│   ├── types/
│   └── utils/
│
├── docs/                       # Project documentation
│
├── .env.example               # Backend environment variables template
├── .env.client                # Frontend environment variables template
├── vite.client.config.js      # Vite config for client app
├── vite.admin.config.js       # Vite config for admin app
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── jsconfig.json
├── package.json               # Root dependencies
└── RoomieMatch.code-workspace
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** 9+
- **MySQL** 8.0+ ([Download](https://www.mysql.com/downloads/))

### 1. Clone the Repository

```bash
git clone https://github.com/ramsharankewat789-gif/RoomieMatch-Roommate---Rental-Matching-Platform-SEP-Project-.git
cd RoomieMatch-Roommate---Rental-Matching-Platform-SEP-Project-
```

### 2. Install Dependencies

```bash
# Install root dependencies (frontend frameworks)
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 3. Set Up Environment Variables

#### Backend (.env in `/server` directory)

Copy `.env.example` to `/server/.env` and fill in your configuration:

```bash
cp .env.example server/.env
```

**Key variables to configure:**

```dotenv
# Server
PORT=4000
NODE_ENV=development

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=roomiematch

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Email (for OTP delivery)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password_here

# Frontend URLs (CORS)
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

#### Frontend (.env in root directory)

Copy `.env.client` to `.env.local` and configure:

```bash
cp .env.client .env.local
```

```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_API_URL=http://localhost:4000/api
```

### 4. Create MySQL Database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE roomiematch;
EXIT;
```

### 5. Run Database Migrations & Seeds

```bash
cd server
npm run db:migrate    # Create all tables
npm run db:seed       # Populate demo data
cd ..
```

---

## 📍 Development

### Run Frontend (Client App)

```bash
npm run dev:client
# → http://localhost:5173
```

### Run Frontend (Admin App)

```bash
npm run dev:admin
# → http://localhost:5174
```

### Run Backend Server

```bash
cd server
npm run dev
# → http://localhost:4000/api
```

### Run All Simultaneously

In separate terminals:
1. `npm run dev:client`
2. `npm run dev:admin`
3. `cd server && npm run dev`

---

## 🏗️ Production Build

### Build Frontend Apps

```bash
npm run build          # Builds both client and admin apps
npm run build:client   # Client only
npm run build:admin    # Admin only
```

### Build Backend

```bash
cd server
npm start              # Runs production server
```

---

## 👤 Application Roles

| Role | Access | Features |
|------|--------|----------|
| **Tenant/Owner** | Client app (port 5173) | Search properties, list properties, apply to rent, messaging, profile management |
| **Administrator** | Admin app (port 5174) | Manage users, properties, verify documents, view reports, analytics |

---

## 🔐 Key Features

### Authentication
- ✅ User registration & login
- ✅ JWT-based authentication
- ✅ Google OAuth integration
- ✅ Email OTP verification
- ✅ Password reset functionality

### Properties
- ✅ List properties with images & details
- ✅ Advanced search & filtering
- ✅ Property verification workflow

### Matching
- ✅ Roommate compatibility algorithm
- ✅ Preferences-based recommendations

### Messaging
- ✅ Real-time messaging between users
- ✅ Message history

### Admin Panel
- ✅ User management
- ✅ Property moderation
- ✅ Document verification
- ✅ Analytics & reporting

---

## 🛠️ API Documentation

Backend API endpoints are available at:

```
Base URL: http://localhost:4000/api
```

Key endpoints:
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/properties` - List all properties
- `POST /api/properties` - Create new property
- `GET /api/users/{id}` - Get user profile
- `POST /api/messages` - Send message

---

## 📦 Dependencies

### Frontend
- React 19.2.8
- React Router DOM 7.18.2
- Tailwind CSS 3.4.19
- Chart.js 4.5.1
- Vite 8.2.0

### Backend
- Express.js 4.18.3
- MySQL2 3.9.7
- JWT (jsonwebtoken 9.0.2)
- Bcryptjs 2.4.3
- Nodemailer 6.9.13
- Helmet 7.1.0

---

## 📝 Environment Variables

All sensitive configuration is managed through `.env` files. See `.env.example` for a complete list.

**Never commit real `.env` files to Git.**

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Frontend (port 5173)
lsof -i :5173
kill -9 <PID>

# Admin (port 5174)
lsof -i :5174
kill -9 <PID>

# Backend (port 4000)
lsof -i :4000
kill -9 <PID>
```

### Database Connection Error
- Verify MySQL is running
- Check `DB_HOST`, `DB_USER`, `DB_PASSWORD` in `/server/.env`
- Ensure database `roomiematch` exists

### CORS Errors
- Verify `CLIENT_URL` and `ADMIN_URL` are correctly set in `/server/.env`
- Check that frontend is running on the correct port

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

## 👥 Team

- **Project**: RoomieMatch — SEP Project
- **Maintained by**: ramsharankewat789-gif

---

## 📄 License

This project is proprietary and for educational purposes.

---

## 🤝 Contributing

For contributing guidelines, please see the project documentation.

---

**Last Updated**: August 2026
