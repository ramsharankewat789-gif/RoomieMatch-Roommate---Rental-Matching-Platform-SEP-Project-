# RoomieMatch — Roommate & Rental Matching Platform

RoomieMatch is a full-stack web application built for university students to find compatible roommates and rental properties near campus. Any registered user can both search for rooms **and** list their own properties — there is one unified account type with access to all features.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Tailwind CSS, Vite |
| Backend | Node.js 18+, Express 4 |
| Database | MySQL 8 / MariaDB 10.4 (via mysql2/promise) |
| Authentication | JWT (HS256), Google OAuth 2.0, Email OTP |
| File Uploads | Multer (profile images, property photos, verification docs) |
| Email | Nodemailer (SMTP / Gmail App Password) |
| Security | Helmet, bcryptjs, express-rate-limit, CORS |
| Charts | Chart.js, react-chartjs-2 |

---

## Project Structure

```
RoomieMatch/
├── apps/
│   ├── client/                     # User-facing React app (port 5173)
│   │   └── src/
│   │       ├── components/layout/  # Navbar, UserSidebar
│   │       ├── layouts/            # PublicLayout, UserLayout
│   │       ├── pages/
│   │       │   ├── auth/           # Login, Register, OTP, ForgotPassword, ResetPassword
│   │       │   ├── tenant/         # Dashboard, PropertySearch, PropertyDetails,
│   │       │   │                   # Applications, Favorites, Messages, Reviews,
│   │       │   │                   # RoommateSearch, RoommateProfile, TenantProfile,
│   │       │   │                   # EditTenantProfile, TenantVerification, Notifications
│   │       │   ├── owner/          # MyProperties, AddProperty, EditProperty,
│   │       │   │                   # OwnerApplications, OwnerMessages, OwnerReviews
│   │       │   └── public/         # LandingPage
│   │       └── routes/             # UserRoutes (all routes unified — no role split)
│   │
│   └── admin/                      # Admin React app (port 5174)
│       └── src/
│           ├── layouts/            # AdminLayout
│           └── pages/
│               ├── auth/           # Admin LoginPage, OtpVerificationPage
│               └── admin/          # Dashboard, UserManagement, UserDetails,
│                                   # PropertyManagement, AdminPropertyDetails,
│                                   # VerificationManagement, ReportsManagement,
│                                   # ReportsDetails, Analytics, AdminNotifications
│
├── server/                         # Express backend API (port 4000)
│   ├── src/
│   │   ├── controllers/            # authController, userController, propertyController,
│   │   │                           # applicationController, uploadController,
│   │   │                           # notificationController, favouriteController,
│   │   │                           # reportController, adminController,
│   │   │                           # messageController, reviewController,
│   │   │                           # passwordController
│   │   ├── routes/                 # One route file per controller
│   │   ├── middleware/
│   │   │   ├── auth.js             # requireAuth, requireAdmin JWT middleware
│   │   │   └── upload.js           # Multer config (profiles, properties, verifications)
│   │   ├── services/
│   │   │   ├── emailService.js     # Nodemailer SMTP wrapper
│   │   │   └── otpService.js       # CSPRNG OTP generation + bcrypt hashing
│   │   └── database/
│   │       ├── db.js               # mysql2/promise connection pool
│   │       ├── init.js             # Startup connectivity test
│   │       ├── migrate.js          # Creates all 20 tables (safe to re-run)
│   │       └── seed.js             # Inserts demo data
│   ├── uploads/                    # Uploaded files (gitignored)
│   │   ├── profiles/
│   │   ├── properties/
│   │   └── verifications/
│   └── package.json
│
├── shared/                         # Code shared between client and admin apps
│   ├── components/common/          # Avatar, Button, Input, Modal, Select, Textarea,
│   │                               # Badge, StatusBadge, Rating, EmptyState, ImageUpload
│   ├── context/
│   │   ├── AuthContext.jsx         # JWT auth — login, register, Google OAuth, rehydration
│   │   ├── NotificationContext.jsx # Real-time notification polling (30s interval)
│   │   └── SocketContext.jsx       # Messaging context (15s/8s conversation polling)
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useProperties.js        # GET/POST/PUT/DELETE /api/properties
│   │   ├── useApplications.js      # GET/POST/PATCH/DELETE /api/applications
│   │   ├── useMessages.js          # Wraps SocketContext for message pages
│   │   └── useRoommates.js         # Fetches users + computes compatibility score
│   ├── services/
│   │   └── api.js                  # All 50+ API functions — single source of truth
│   └── data/                       # Legacy mock files (no longer imported by any page)
│
├── .env.example                    # Backend environment variables template
├── .env.client                     # Frontend environment variables template
├── package.json                    # Root — frontend scripts and shared dependencies
└── README.md
```

---

## Database Schema

The database contains **20 tables**. All created automatically by `npm run db:migrate`.

| Table | Purpose |
|---|---|
| `users` | All accounts — unified role (`user` or `admin`) |
| `user_preferences` | Lifestyle preferences (smoke, pets, sleep, etc.) |
| `user_hobbies` | Hobby tags per user |
| `password_reset_tokens` | Forgot-password secure tokens |
| `otp_verifications` | Email OTP codes (hashed, 5-min expiry) |
| `google_auth_pending` | Temporary Google OAuth sessions before OTP |
| `verification_docs` | Identity document uploads |
| `properties` | Rental listings |
| `property_amenities` | Amenity tags per property |
| `property_rules` | House rules per property |
| `property_images` | Property photos (primary flag) |
| `applications` | Rental applications with history |
| `application_history` | Audit trail for application status changes |
| `conversations` | Message threads between two users |
| `conversation_participants` | User ↔ conversation junction |
| `messages` | Individual messages with read receipts |
| `notifications` | In-app notifications |
| `reviews` | Property and user reviews with ratings |
| `reports` | Abuse / content reports |
| `favourites` | Saved properties per user |

---

## Getting Started

### Prerequisites

- **Node.js** 18+ — [nodejs.org](https://nodejs.org)
- **MySQL** 8.0+ or **MariaDB** 10.4+ — [XAMPP](https://www.apachefriends.org) is the easiest option on Windows
- **Git**

---

### 1. Clone the Repository

```bash
git clone https://github.com/ramsharankewat789-gif/RoomieMatch-Roommate---Rental-Matching-Platform-SEP-Project-.git
cd RoomieMatch-Roommate---Rental-Matching-Platform-SEP-Project-
```

---

### 2. Install Dependencies

```bash
# Root dependencies (frontend)
npm install

# Backend dependencies
cd server
npm install
cd ..
```

---

### 3. Configure Environment Variables

#### Backend — create `server/.env`

Copy the example file and fill in your values:

```bash
cp .env.example server/.env
```

```dotenv
PORT=4000
NODE_ENV=development

# MySQL / MariaDB
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=roomiematch

# JWT
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d

# Google OAuth (https://console.cloud.google.com)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# SMTP — Gmail App Password recommended
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_16_char_app_password
EMAIL_FROM=RoomieMatch <no-reply@roomiematch.com>

# CORS
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174

# Upload size limits (bytes)
PROFILE_IMAGE_MAX_SIZE=5242880
PROPERTY_IMAGE_MAX_SIZE=8388608
VERIFICATION_DOC_MAX_SIZE=10485760
MAX_PROPERTY_IMAGES=6
```

#### Frontend — create root `.env`

```bash
cp .env.client .env
```

```dotenv
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_API_URL=http://localhost:4000/api
```

---

### 4. Start MySQL

**Using XAMPP (Windows):**
1. Open XAMPP Control Panel
2. Click **Start** next to MySQL
3. MySQL will be running on `localhost:3306`

**Using command line:**
```bash
C:\xampp\mysql\bin\mysqld.exe --console
```

---

### 5. Run Database Migration and Seed

```bash
cd server
npm run db:migrate    # Creates all 20 tables
npm run db:seed       # Inserts demo accounts and properties
cd ..
```

---

### 6. Start the Application

Open **three separate terminals**:

**Terminal 1 — Backend API:**
```bash
cd server
npm run dev
# → http://localhost:4000/api
# → http://localhost:4000/api/health
```

**Terminal 2 — Client App (Users):**
```bash
npm run dev:client
# → http://localhost:5173
```

**Terminal 3 — Admin App:**
```bash
npm run dev:admin
# → http://localhost:5174
```

---

## Demo Accounts

All demo accounts use the password: **`password123`**

| Email | Role | Notes |
|---|---|---|
| `admin@roomiematch.com` | Administrator | Admin panel (port 5174) |
| `alex@user.com` | User | Verified — can search and list |
| `sarah@user.com` | User | Verified — has 3 listed properties |
| `marcus@user.com` | User | Verified |
| `chloe@user.com` | User | Unverified — pending ID review |

> Every user account has access to **all features** — searching for rooms, applying, listing properties, and messaging. There is no separate tenant or owner role.

---

## How to Access the Database

**Option 1 — phpMyAdmin (visual, browser-based)**
1. Start MySQL via XAMPP
2. Open `http://localhost/phpmyadmin` in your browser
3. Click **roomiematch** in the left panel

**Option 2 — MySQL Command Line**
```bash
C:\xampp\mysql\bin\mysql.exe -u root roomiematch
```
```sql
SHOW TABLES;
SELECT * FROM users;
SELECT * FROM properties;
```

**Option 3 — VS Code Extension**
Install **Database Client** (by Weijan Chen), connect with:
- Host: `localhost` · Port: `3306` · User: `root` · Password: *(blank)* · Database: `roomiematch`

---

## API Reference

All endpoints are served from `http://localhost:4000/api`.

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Register new account |
| POST | `/auth/login` | — | Email/password login |
| POST | `/auth/google` | — | Google OAuth → OTP dispatch |
| POST | `/auth/otp/verify` | — | Verify OTP → receive JWT |
| POST | `/auth/otp/resend` | — | Resend OTP (60s cooldown) |
| GET | `/auth/me` | JWT | Current user profile |
| POST | `/auth/forgot-password` | — | Send reset email |
| POST | `/auth/reset-password` | — | Reset with token |
| PATCH | `/auth/change-password` | JWT | Change password |

### Users
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/users` | Admin | List users (paginated, searchable) |
| GET | `/users/:id` | JWT | Get user profile |
| PATCH | `/users/:id` | JWT | Update profile |
| DELETE | `/users/:id` | Admin | Delete user |

### Properties
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/properties` | Optional | Search / list properties |
| POST | `/properties` | JWT | Create a listing |
| GET | `/properties/:id` | Optional | Property detail |
| PUT | `/properties/:id` | JWT | Update listing |
| DELETE | `/properties/:id` | JWT | Delete listing |
| PATCH | `/properties/:id/verify` | Admin | Approve listing |
| PATCH | `/properties/:id/status` | JWT | Toggle active/inactive |
| POST | `/properties/:id/images` | JWT | Upload property images |
| DELETE | `/properties/images/:id` | JWT | Delete an image |

### Applications
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/applications` | JWT | List own applications |
| POST | `/applications` | JWT | Submit application |
| PATCH | `/applications/:id/status` | JWT | Approve / reject |
| DELETE | `/applications/:id` | JWT | Cancel application |

### Uploads
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/profile` | JWT | Upload profile photo |
| DELETE | `/profile` | JWT | Remove profile photo |
| POST | `/verification` | JWT | Upload ID document |
| GET | `/verification/status` | JWT | Own verification status |
| GET | `/verification/doc/:userId` | JWT | View document (admin-gated) |
| POST | `/verification/:userId/approve` | Admin | Approve verification |
| POST | `/verification/:userId/reject` | Admin | Reject with reason |
| GET | `/verification/pending` | Admin | List pending verifications |

### Messaging
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/messages/conversations` | JWT | List conversations |
| POST | `/messages/conversations` | JWT | Get or create thread |
| GET | `/messages/conversations/:id/messages` | JWT | Get messages (marks read) |
| POST | `/messages/conversations/:id/messages` | JWT | Send message |
| PATCH | `/messages/conversations/:id/read` | JWT | Mark conversation read |
| GET | `/messages/unread-count` | JWT | Total unread count |

### Notifications, Favourites, Reviews, Reports
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/notifications` | JWT | List notifications |
| PATCH | `/notifications/read-all` | JWT | Mark all read |
| GET | `/favourites` | JWT | Saved properties |
| POST | `/favourites` | JWT | Save a property |
| DELETE | `/favourites/:propertyId` | JWT | Remove saved |
| GET | `/reviews` | — | List reviews |
| POST | `/reviews` | JWT | Submit a review |
| POST | `/reports` | JWT | Submit a report |
| GET | `/reports` | Admin | List all reports |
| PATCH | `/reports/:id` | Admin | Resolve / dismiss |

### Admin
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/admin/stats` | Admin | Dashboard statistics |
| GET | `/admin/activity` | Admin | Recent activity feed |

---

## Features

### For All Users
- Register and log in with email/password or Google account
- Verify identity by uploading a student ID or passport
- Search properties by location, price, bedroom count, and type
- Save favourite properties
- Apply for a rental with a personal message
- List your own properties with photos, amenities, and rules
- Manage received applications (approve or reject)
- Message any other user directly
- Rate and review properties and roommates
- Find compatible roommates based on lifestyle preferences (smoking, pets, sleep schedule, cleanliness, cooking habits)
- Receive in-app notifications for applications, messages, and verifications

### For Administrators
- View platform-wide statistics (users, properties, pending verifications, reports)
- Approve or reject identity verification documents
- Approve or reject property listings before they go live
- Manage user accounts
- Review and resolve abuse reports
- View analytics overview

---

## Security

- Passwords hashed with **bcrypt** (salt rounds: 10)
- JWTs signed with HS256 — validated against the database on every request
- Google ID tokens verified server-side via `google-auth-library`
- OTPs generated with `crypto.randomInt` (CSPRNG), stored as bcrypt hashes, expire in 5 minutes, max 5 attempts
- Rate limiting on all auth routes
- Verification documents served through an auth-gated endpoint — never exposed as static files
- All database queries use parameterised statements (no SQL injection)
- CORS restricted to known origins only
- `Helmet` sets security headers on all responses

---

## Production Build

```bash
# Build both frontend apps
npm run build

# Start backend in production mode
cd server
npm start
```

---

## Troubleshooting

**Server fails to start**
- Make sure MySQL/MariaDB is running before starting the server
- Check `server/.env` has correct `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- Run `npm run db:migrate` to ensure all tables exist

**CORS errors in browser**
- Confirm `CLIENT_URL=http://localhost:5173` and `ADMIN_URL=http://localhost:5174` in `server/.env`

**Google OAuth not working**
- Add `http://localhost:5173` and `http://localhost:5174` as authorised origins in Google Cloud Console
- Make sure `VITE_GOOGLE_CLIENT_ID` in root `.env` matches `GOOGLE_CLIENT_ID` in `server/.env`

**OTP emails not arriving**
- For Gmail: enable 2-factor authentication and generate an App Password at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
- Use the 16-character App Password as `SMTP_PASSWORD`

**Port already in use (Windows)**
```powershell
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

---

## Project Info

- **University**: University of Wolverhampton
- **Module**: Software Engineering Project (SEP)
- **Repository**: [GitHub](https://github.com/ramsharankewat789-gif/RoomieMatch-Roommate---Rental-Matching-Platform-SEP-Project-)
- **Last Updated**: August 2026
