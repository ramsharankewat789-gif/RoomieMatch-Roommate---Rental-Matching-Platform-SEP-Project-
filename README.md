# RoomieMatch — Roommate & Rental Matching Platform

RoomieMatch is a full-stack web application that helps university students find compatible roommates and verified rental properties. Any registered user can search for rooms **and** list their own properties — there is **one unified User account** with access to all features. There is no separate Tenant or Property Owner role.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Tailwind CSS, Vite 8 |
| Backend | Node.js 18+, Express 4 |
| Database | MySQL 8 / MariaDB 10.4+ (`mysql2/promise`) |
| Authentication | JWT (HS256), Google OAuth 2.0, Email OTP |
| Real-Time Chat | Socket.io v4.8 (WebSocket + polling fallback) |
| Maps | Leaflet + OpenStreetMap (no API key required) |
| File Uploads | Multer (profile images, property photos, verification docs) |
| Email | Nodemailer (SMTP / Gmail App Password) |
| Security | Helmet, bcryptjs (salt 10), express-rate-limit, CORS |
| Charts | Chart.js, react-chartjs-2 |

---

## Project Structure

```
RoomieMatch/
├── apps/
│   ├── client/                     # Unified User App (port 5173)
│   │   └── src/pages/
│   │       ├── auth/               # Login, Register, OTP, ForgotPassword,
│   │       │                       # ResetPassword, EmailVerification
│   │       ├── tenant/             # Dashboard, PropertySearch, PropertyDetails,
│   │       │                       # Applications, ApplicationDetails, Favorites,
│   │       │                       # Messages, Reviews, RoommateSearch,
│   │       │                       # RoommateProfile, TenantProfile,
│   │       │                       # EditTenantProfile, LifestylePreferences,
│   │       │                       # TenantVerification, Notifications
│   │       └── owner/              # MyProperties, AddProperty, EditProperty,
│   │                               # OwnerPropertyDetails, OwnerApplications,
│   │                               # OwnerApplicationDetails, OwnerMessages,
│   │                               # OwnerReviews, OwnerVerification
│   │
│   └── admin/                      # Admin Console (port 5174)
│       └── src/pages/
│           ├── auth/               # LoginPage, OtpVerificationPage
│           └── admin/              # AdminDashboard, UserManagement, UserDetails,
│                                   # PropertyManagement, AdminPropertyDetails,
│                                   # VerificationManagement, ReportsManagement,
│                                   # ReportsDetails, Analytics, AdminNotifications
│
├── server/                         # Express + Socket.io API (port 4000)
│   ├── src/
│   │   ├── controllers/            # 13 controllers covering all modules
│   │   ├── routes/                 # One route file per controller
│   │   ├── socket/socketHandler.js # Real-time chat events + JWT auth
│   │   ├── middleware/             # auth.js (requireAuth/requireAdmin),
│   │   │                           # upload.js (Multer)
│   │   ├── services/               # emailService.js, otpService.js
│   │   └── database/
│   │       ├── db.js               # mysql2/promise connection pool
│   │       ├── migrate.js          # Creates all 22 tables (safe to re-run)
│   │       └── seed.js             # Demo data — 5 users, 4 properties,
│   │                               # 2 applications, 6 reviews, 9 compatibility
│   │                               # scores, 10 notifications, 5 favourites
│   └── uploads/                    # Uploaded files (gitignored)
│
├── shared/                         # Code shared between client and admin
│   ├── components/common/          # Avatar, Button, Input, Modal, Select,
│   │                               # Textarea, Badge, StatusBadge, Rating,
│   │                               # EmptyState, ImageUpload,
│   │                               # PropertyMap (Leaflet), ThemeToggle,
│   │                               # LoadingSpinner
│   ├── context/
│   │   ├── AuthContext.jsx         # JWT auth — login, register, rehydration
│   │   ├── NotificationContext.jsx # 30s polling, mark read/delete
│   │   ├── SocketContext.jsx       # Socket.io — real-time chat, typing
│   │   └── ThemeContext.jsx        # Dark/light mode toggle
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useProperties.js        # Real API — CRUD, search, images
│   │   ├── useApplications.js      # Real API — submit, approve, reject, cancel
│   │   ├── useMessages.js          # Wraps SocketContext
│   │   └── useRoommates.js         # Real API + PRD-weighted compatibility
│   ├── services/api.js             # 60+ typed API functions
│   ├── utils/currency.js           # formatCurrency helper
│   └── styles/                     # index.css, globals.css, dark-theme.css
│
├── .env.example                    # Backend environment template
├── .env.client                     # Frontend environment template
└── README.md
```

---

## Database — 22 Tables

All tables are created automatically by `npm run db:migrate`.

| # | Table | Purpose |
|---|---|---|
| 1 | `users` | All accounts — unified `user` / `admin` role |
| 2 | `user_preferences` | 10 lifestyle fields (smoke, pet, cleanliness, sleep, social, cooking, drinking, guests, food, working_hours) |
| 3 | `user_hobbies` | Hobby tags per user |
| 4 | `password_reset_tokens` | Forgot-password tokens (bcrypt, 1 hr) |
| 5 | `otp_verifications` | Email OTP (CSPRNG, bcrypt, 5 min, max 5 attempts) |
| 6 | `email_verification_tokens` | Email address verification links (24 hr) |
| 7 | `google_auth_pending` | Temporary Google OAuth sessions before OTP |
| 8 | `verification_docs` | Identity documents (PENDING / APPROVED / REJECTED) |
| 9 | `properties` | Rental listings with lat/lng coordinates |
| 10 | `property_amenities` | Amenity tags per property |
| 11 | `property_rules` | House rules per property |
| 12 | `property_images` | Property photos (primary flag, sort order, up to 6) |
| 13 | `applications` | Rental applications (pending/approved/rejected/cancelled) |
| 14 | `application_history` | Audit trail for status changes |
| 15 | `conversations` | Message threads between two users |
| 16 | `conversation_participants` | User ↔ conversation junction |
| 17 | `messages` | Individual messages with read receipts |
| 18 | `notifications` | In-app notifications (auto-created on key events) |
| 19 | `reviews` | Property and user reviews with star ratings (1–5) |
| 20 | `reports` | Abuse/content reports (PENDING / RESOLVED / DISMISSED) |
| 21 | `favourites` | Saved properties per user |
| 22 | `compatibility_scores` | Persisted roommate compatibility scores |

---

## Getting Started

### Prerequisites

- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **MySQL 8** or **MariaDB 10.4+** — [XAMPP](https://www.apachefriends.org) recommended on Windows
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
# Root — installs React, Leaflet, Chart.js, Vite and all frontend deps
npm install

# Backend
cd server
npm install
cd ..
```

---

### 3. Configure Environment Variables

#### Backend — create `server/.env`

```bash
cp .env.example server/.env
```

Then edit `server/.env`:

```dotenv
PORT=4000
NODE_ENV=development

# MySQL / MariaDB (XAMPP default — leave DB_PASSWORD blank)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=roomiematch

# JWT — generate with:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_long_random_secret_here
JWT_EXPIRES_IN=7d

# Google OAuth (optional — app works without it)
# https://console.cloud.google.com/apis/credentials
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# SMTP email (optional — Gmail App Password recommended)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_16_char_app_password
EMAIL_FROM=RoomieMatch <no-reply@roomiematch.com>

# CORS — allow both Vite apps
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174

# Upload limits (bytes)
PROFILE_IMAGE_MAX_SIZE=5242880
PROPERTY_IMAGE_MAX_SIZE=8388608
VERIFICATION_DOC_MAX_SIZE=10485760
MAX_PROPERTY_IMAGES=6
```

#### Frontend — create root `.env`

```bash
cp .env.client .env
```

Edit `.env`:

```dotenv
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_API_URL=http://localhost:4000/api
```

> Vite proxies all `/api` requests to `http://localhost:4000` in dev mode, so `VITE_API_URL` is only needed if you change the backend port.

---

### 4. Start MySQL

**XAMPP (Windows — recommended):**
1. Open XAMPP Control Panel
2. Click **Start** next to MySQL

**Command line:**
```powershell
C:\xampp\mysql\bin\mysqld.exe --defaults-file="C:\xampp\mysql\bin\my.ini"
```

---

### 5. Run Database Migration and Seed

```bash
cd server
npm run db:migrate    # Creates all 22 tables (safe to re-run)
npm run db:seed       # Inserts demo users, properties, reviews, scores
cd ..
```

---

### 6. Run the Application

Open **three separate terminals**:

```bash
# Terminal 1 — Backend API
cd server
npm run dev
# → http://localhost:4000/api
# → http://localhost:4000/api/health

# Terminal 2 — Client / User App
npm run dev:client
# → http://localhost:5173

# Terminal 3 — Admin Panel
npm run dev:admin
# → http://localhost:5174
```

---

## Demo Accounts

All demo accounts use password: **`password123`**

### Client App — `http://localhost:5173`

| Email | Notes |
|---|---|
| `alex@user.com` | Verified — can search AND list properties |
| `sarah@user.com` | Verified — has 3 listed properties |
| `marcus@user.com` | Verified user |
| `chloe@user.com` | Unverified (pending ID review) |

### Admin Panel — `http://localhost:5174`

| Email | Notes |
|---|---|
| `admin@roomiematch.com` | Full admin access |

> **Note:** Admin accounts are blocked on the client app. Regular user accounts are blocked on the admin panel. Role enforcement is applied in both the frontend (redirect) and backend (`requireAdmin` middleware → 403).

---

## Accessing the Database

**phpMyAdmin (visual, browser):**
1. Start MySQL via XAMPP
2. Open `http://localhost/phpmyadmin`
3. Select the **roomiematch** database

**MySQL CLI:**
```powershell
C:\xampp\mysql\bin\mysql.exe -u root roomiematch
```
```sql
SHOW TABLES;
SELECT name, email, role, is_verified FROM users;
SELECT title, price, city, status, is_verified FROM properties;
SELECT * FROM reviews;
SELECT * FROM compatibility_scores;
```

**Reset to clean demo data:**
```bash
cd server
npm run db:migrate   # CREATE TABLE IF NOT EXISTS — always safe
npm run db:seed      # INSERT ... ON DUPLICATE KEY UPDATE — idempotent
```

---

## API Reference

All endpoints are served from `http://localhost:4000/api`.

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Create account |
| POST | `/auth/login` | — | Email/password login → JWT |
| POST | `/auth/google` | — | Google ID token → OTP sent to Gmail |
| POST | `/auth/otp/verify` | — | OTP → JWT |
| POST | `/auth/otp/resend` | — | Resend OTP (60 s cooldown) |
| GET | `/auth/me` | JWT | Current user + preferences + hobbies |
| POST | `/auth/forgot-password` | — | Send reset link (enumeration-safe) |
| POST | `/auth/reset-password` | — | Reset using token from email |
| PATCH | `/auth/change-password` | JWT | Change while authenticated |
| POST | `/auth/send-verification` | JWT | Send email verification link |
| GET | `/auth/verify-email` | — | Confirm email from link |

### Users

| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| GET | `/users` | JWT | Admin: full list. Non-admin: public subset for roommate matching (no emails exposed) |
| GET | `/users/:id` | JWT | Profile + preferences + hobbies |
| PATCH | `/users/:id` | JWT | Update own profile (admin: any) |
| DELETE | `/users/:id` | Admin | Delete user account |

### Properties

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/properties` | Optional | Search/filter: `search`, `city`, `type`, `minPrice`, `maxPrice`, `bedrooms`, `ownerId`, `verified` |
| POST | `/properties` | JWT | Create listing |
| GET | `/properties/:id` | Optional | Full detail with images, amenities, rules, owner |
| PUT | `/properties/:id` | JWT | Update (owner only) |
| DELETE | `/properties/:id` | JWT | Delete (owner or admin) |
| PATCH | `/properties/:id/verify` | Admin | Approve listing |
| PATCH | `/properties/:id/status` | JWT | Toggle active / inactive / rented |
| POST | `/properties/:id/images` | JWT | Upload photos (up to 6) |
| DELETE | `/properties/images/:id` | JWT | Delete photo |
| PATCH | `/properties/images/:id/primary` | JWT | Set cover photo |

### Applications

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/applications` | JWT | Own as tenant + received as owner (admin: all). Includes `history[]` |
| POST | `/applications` | JWT | Submit (not to own property) |
| GET | `/applications/:id` | JWT | Full detail with history |
| PATCH | `/applications/:id/status` | JWT | Approve / reject (property owner) |
| DELETE | `/applications/:id` | JWT | Cancel (applicant only) |

### File Uploads

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/profile` | JWT | Upload profile photo (5 MB max) |
| DELETE | `/profile` | JWT | Remove profile photo |
| POST | `/verification` | JWT | Upload ID document (PDF / image, 10 MB max) |
| GET | `/verification/status` | JWT | Own verification status |
| GET | `/verification/doc/:userId` | JWT | View document (auth-gated) |
| POST | `/verification/:userId/approve` | Admin | Approve + set `is_verified=1` |
| POST | `/verification/:userId/reject` | Admin | Reject with reason |
| GET | `/verification/pending` | Admin | List pending submissions |

### Messaging

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/messages/unread-count` | JWT | Total unread across all threads |
| GET | `/messages/conversations` | JWT | Thread list with last message + unread count |
| POST | `/messages/conversations` | JWT | Get or create thread (idempotent) |
| GET | `/messages/conversations/:id` | JWT | Thread detail |
| GET | `/messages/conversations/:id/messages` | JWT | Paginated messages (marks incoming as read) |
| POST | `/messages/conversations/:id/messages` | JWT | Send message (rate-limited 60/min) |
| PATCH | `/messages/conversations/:id/read` | JWT | Mark thread as read |

### Notifications, Favourites, Reviews, Reports

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/notifications` | JWT | List notifications |
| PATCH | `/notifications/:id/read` | JWT | Mark one read |
| PATCH | `/notifications/read-all` | JWT | Mark all read |
| DELETE | `/notifications/:id` | JWT | Delete notification |
| GET | `/favourites` | JWT | Saved properties |
| POST | `/favourites` | JWT | Save (idempotent) |
| GET | `/favourites/:propertyId/status` | JWT | `{ isFavourited: bool }` |
| DELETE | `/favourites/:propertyId` | JWT | Remove |
| GET | `/reviews` | — | Filter by `targetProperty`, `targetUser`, `reviewerId` |
| POST | `/reviews` | JWT | Submit review (rating 1–5) |
| POST | `/reports` | JWT | Submit abuse report |
| GET | `/reports` | Admin | List reports |
| GET | `/reports/:id` | Admin | Report detail |
| PATCH | `/reports/:id` | Admin | Resolve or dismiss |

### Admin & Compatibility

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/admin/stats` | Admin | Platform-wide counts and metrics |
| GET | `/admin/activity` | Admin | Recent users, properties, applications, reports |
| GET | `/compatibility` | JWT | Stored scores for current user |
| POST | `/compatibility/save` | JWT | Persist batch of computed scores |

---

## Compatibility Matching — PRD Weights

| Factor | Weight | Source |
|---|---|---|
| Budget overlap | **30%** | `budget_min` / `budget_max` range comparison |
| Lifestyle preferences | **30%** | smoke, pet, cleanliness, sleep, social, cooking, drinking, guests |
| Shared hobbies / interests | **20%** | Jaccard overlap of `user_hobbies` |
| Location (city match) | **10%** | `users.city` field |
| Occupation (university/major) | **10%** | `users.university` + `users.major` |

Scores are computed in `useRoommates.js` and **saved to MySQL** via `POST /api/compatibility/save` after each computation.

---

## Real-Time Chat — Socket.io

Socket.io v4.8 runs on the **same port 4000** as the REST API. Messages are delivered instantly with no polling.

### Event Reference

| Direction | Event | Payload | Description |
|---|---|---|---|
| Client → Server | `join_conversation` | `{ conversationId }` | Join room, mark messages read |
| Client → Server | `send_message` | `{ conversationId, body }` | Save to DB + broadcast |
| Client → Server | `typing` | `{ conversationId, isTyping }` | Typing indicator |
| Client → Server | `leave_conversation` | `{ conversationId }` | Leave room |
| Server → Client | `new_message` | `{ message }` | New message in room |
| Server → Client | `message_read` | `{ conversationId, readBy }` | Read receipt |
| Server → Client | `user_typing` | `{ conversationId, userId, userName, isTyping }` | Typing indicator |
| Server → Client | `connected` | `{ userId }` | Connection confirmed |
| Server → Client | `error` | `{ message }` | Error feedback |

### Chat Features
- Instant delivery — no polling or page refresh
- Live / Offline badge showing connection status
- Typing indicators with animated dots
- Read receipts
- REST fallback if socket temporarily disconnects
- Full message history loaded via REST on conversation open

---

## Maps

Property listings store `latitude` and `longitude`. The `PropertyMap` component uses **Leaflet + OpenStreetMap** — no API key needed.

- **PropertySearch** — all search results shown on an interactive map above the property cards
- **PropertyDetails** — property location shown on a map below house rules

---

## Security

| Feature | Implementation |
|---|---|
| Password hashing | bcrypt, salt rounds 10 |
| JWT | HS256, validated against DB on every request |
| Google tokens | Server-side `verifyIdToken` via `google-auth-library` |
| OTP | `crypto.randomInt` (CSPRNG), bcrypt-hashed, 5 min, max 5 attempts |
| Socket.io auth | JWT validated at WebSocket handshake |
| Rate limiting | Auth: 20/15 min · OTP: 10/5 min · Password: 5/15 min · Messages: 60/min |
| Verification docs | Auth-gated endpoint — never served as static files |
| SQL injection | Parameterised queries throughout — zero string interpolation |
| Role enforcement | `requireAuth` + `requireAdmin` middleware on all protected routes |
| Privacy | Non-admin user list never exposes email addresses |
| CORS | Restricted to known origins (`CLIENT_URL`, `ADMIN_URL`) |
| File uploads | MIME type + extension both checked; UUID filenames prevent path traversal |
| Crash prevention | `unhandledRejection` + `uncaughtException` handlers in `server/src/index.js` |

---

## PRD Compliance Summary

All Version 1 modules from the PRD are implemented:

| Module | Status |
|---|---|
| Authentication (register, login, logout, forgot/reset password, email verification, Google OTP) | ✅ |
| User Profile (photo, bio, university, major, age, gender, city, budget, contact) | ✅ |
| Lifestyle Preferences (all 10 fields + hobbies) | ✅ |
| Compatibility Matching (PRD weights: 30/30/20/10/10, scores persisted) | ✅ |
| Property Listing (create, edit, delete, images, availability, location, status) | ✅ |
| Smart Search (city, price, type, bedrooms, amenities, university for roommates) | ✅ |
| Maps (Leaflet + OpenStreetMap, property markers on search + details pages) | ✅ |
| Reviews & Ratings (property reviews, roommate reviews, avg rating display) | ✅ |
| Notifications (6 types: message, application, verification, general) | ✅ |
| Verification (Student ID, Government ID, Property docs — admin approve/reject) | ✅ |
| Dashboard (user dashboard + admin dashboard with real-time stats) | ✅ |
| Report System (report users + properties, admin resolve/dismiss) | ✅ |

All features marked **Out of Scope in PRD Section Q** (payments, video calls, AI, mobile app, etc.) are intentionally not implemented in Version 1.

---

## Production Build

```bash
# Build both frontend apps
npm run build

# Start backend in production mode
cd server && npm start
```

---

## Troubleshooting

**Server fails to start / DB connection error**
- Start MySQL via XAMPP **before** running `npm run dev` in the server folder
- Check `server/.env` — `DB_PORT=3306`, `DB_PASSWORD=` (empty, no quotes)
- Run `npm run db:migrate` if tables are missing

**"Failed to fetch" / CORS error on login**
- Start the backend first — then open the browser
- Vite may use port 5175/5176 if 5173 is busy — this is fine in dev mode

**Login not working**
- Client app (5173): use `alex@user.com` / `password123` — NOT the admin account
- Admin panel (5174): use `admin@roomiematch.com` / `password123` — NOT a user account

**Sidebar not scrolling / items cut off**
- Hard refresh the browser: **Ctrl + Shift + R**
- The layout uses `height: 100vh` on the root container with independent scroll on sidebar and main — this is intentional

**`npm install` fails**
- Node.js 18+ required: `node --version`
- Delete `node_modules` and retry:
  ```powershell
  Remove-Item -Recurse -Force node_modules; npm install
  cd server; Remove-Item -Recurse -Force node_modules; npm install; cd ..
  ```

**Google OAuth not working**
- Google OAuth is optional — email/password login works without it
- To enable: add `http://localhost:5173` and `http://localhost:5174` as authorised JS origins in [Google Cloud Console](https://console.cloud.google.com)

**Emails not sending**
- SMTP is optional for demo use
- To enable: generate a Gmail App Password at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) and set `SMTP_PASSWORD` in `server/.env`

**Port already in use**
```powershell
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

---

## Running on Another Machine

1. Install Node.js 18+ and XAMPP (or any MySQL 8 / MariaDB 10.4+)
2. Clone the repo
3. Follow steps 2–6 above exactly
4. All tables and demo data are created by `npm run db:migrate` and `npm run db:seed`

---

## Project Info

| | |
|---|---|
| **University** | University of Wolverhampton |
| **Module** | Software Engineering Project (SEP) |
| **Type** | Full-Stack Web Application |
| **Version** | 1.0.0 |
| **Repository** | [GitHub](https://github.com/ramsharankewat789-gif/RoomieMatch-Roommate---Rental-Matching-Platform-SEP-Project-) |
| **Last Updated** | September 2026 |
