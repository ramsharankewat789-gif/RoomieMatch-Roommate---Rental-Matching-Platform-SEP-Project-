# RoomieMatch — Roommate & Rental Matching Platform

RoomieMatch is a full-stack web application that helps university students find compatible roommates and verified rental properties. Any registered user can search for rooms **and** list their own properties — there is one unified account type with access to all features.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router 7, Tailwind CSS, Vite |
| Backend | Node.js 18+, Express 4 |
| Database | MySQL 8 / MariaDB 10.4 (`mysql2/promise`) |
| Authentication | JWT (HS256), Google OAuth 2.0, Email OTP |
| Real-Time Chat | **Socket.io v4.8** (WebSocket + polling fallback) |
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
│   ├── client/                     # User app (port 5173)
│   │   └── src/pages/
│   │       ├── auth/               # Login, Register, OTP, ForgotPassword, ResetPassword,
│   │       │                       # EmailVerification
│   │       ├── tenant/             # Dashboard, PropertySearch, PropertyDetails,
│   │       │                       # Applications, ApplicationDetails, Favorites,
│   │       │                       # Messages, Reviews, RoommateSearch, RoommateProfile,
│   │       │                       # TenantProfile, EditTenantProfile, LifestylePreferences,
│   │       │                       # TenantVerification, Notifications
│   │       └── owner/              # MyProperties, AddProperty, EditProperty,
│   │                               # OwnerPropertyDetails, OwnerApplications,
│   │                               # OwnerApplicationDetails, OwnerMessages, OwnerReviews,
│   │                               # OwnerVerification
│   │
│   └── admin/                      # Admin app (port 5174)
│       └── src/pages/
│           ├── auth/               # LoginPage, OtpVerificationPage
│           └── admin/              # AdminDashboard, UserManagement, UserDetails,
│                                   # PropertyManagement, AdminPropertyDetails,
│                                   # VerificationManagement, ReportsManagement,
│                                   # ReportsDetails, Analytics, AdminNotifications
│
├── server/                         # Express + Socket.io backend API (port 4000)
│   ├── src/
│   │   ├── controllers/            # authController, userController, propertyController,
│   │   │                           # applicationController, uploadController,
│   │   │                           # notificationController, favouriteController,
│   │   │                           # reportController, adminController, messageController,
│   │   │                           # reviewController, compatibilityController,
│   │   │                           # passwordController
│   │   ├── routes/                 # One route file per controller
│   │   ├── socket/
│   │   │   └── socketHandler.js    # Socket.io events: join_conversation, send_message,
│   │   │                           # typing, disconnect — JWT auth middleware
│   │   ├── middleware/
│   │   │   ├── auth.js             # requireAuth, requireAdmin
│   │   │   └── upload.js           # Multer (profiles, properties, verifications)
│   │   ├── services/
│   │   │   ├── emailService.js     # OTP emails + email verification links
│   │   │   └── otpService.js       # CSPRNG OTP + bcrypt hashing
│   │   └── database/
│   │       ├── db.js               # mysql2/promise connection pool
│   │       ├── migrate.js          # Creates all 22 tables (safe to re-run)
│   │       └── seed.js             # Demo data (5 users, 4 properties, applications)
│   └── uploads/                    # Uploaded files (gitignored)
│
├── shared/                         # Code shared between client and admin
│   ├── components/common/          # Avatar, Button, Input, Modal, Select, Textarea,
│   │                               # Badge, StatusBadge, Rating, EmptyState,
│   │                               # ImageUpload, PropertyMap (Leaflet)
│   ├── context/
│   │   ├── AuthContext.jsx         # JWT auth — real API login, register, rehydration
│   │   ├── NotificationContext.jsx # Real-time polling (30s), mark read/delete
│   │   └── SocketContext.jsx       # Socket.io client — real-time chat, typing indicators
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useProperties.js        # Real API — CRUD, search, images
│   │   ├── useApplications.js      # Real API — submit, approve, reject, cancel
│   │   ├── useMessages.js          # Wraps SocketContext
│   │   └── useRoommates.js         # Real API + PRD-weighted compatibility scoring
│   └── services/
│       └── api.js                  # 60+ typed API functions — single source of truth
│
├── .env.example                    # Backend environment variables template
├── .env.client                     # Frontend environment variables template
└── README.md
```

---

## Database Schema — 22 Tables

All tables created automatically by `npm run db:migrate`.

| # | Table | Purpose |
|---|---|---|
| 1 | `users` | All accounts — unified `user`/`admin` role |
| 2 | `user_preferences` | 10 lifestyle fields (smoke, pet, cleanliness, sleep, social, cooking, **drinking, guests, food, working_hours**) |
| 3 | `user_hobbies` | Hobby tags per user |
| 4 | `password_reset_tokens` | Forgot-password secure tokens (bcrypt, 1hr) |
| 5 | `otp_verifications` | Email OTP (CSPRNG, bcrypt, 5min, max 5 attempts) |
| 6 | `email_verification_tokens` | Email address verification tokens (24hr) |
| 7 | `google_auth_pending` | Temporary Google OAuth sessions before OTP |
| 8 | `verification_docs` | Identity document uploads (PENDING/APPROVED/REJECTED) |
| 9 | `properties` | Rental listings with lat/lng coordinates |
| 10 | `property_amenities` | Amenity tags per property |
| 11 | `property_rules` | House rules per property |
| 12 | `property_images` | Property photos (primary flag, sort order) |
| 13 | `applications` | Rental applications with status history |
| 14 | `application_history` | Audit trail for application status changes |
| 15 | `conversations` | Message threads between two users |
| 16 | `conversation_participants` | User ↔ conversation junction |
| 17 | `messages` | Individual messages with read receipts |
| 18 | `notifications` | In-app notifications (auto-created on key events) |
| 19 | `reviews` | Property and user reviews with star ratings |
| 20 | `reports` | Abuse/content reports (PENDING/RESOLVED/DISMISSED) |
| 21 | `favourites` | Saved properties per user |
| 22 | `compatibility_scores` | Persisted roommate compatibility scores (PRD weights) |

---

## Getting Started

### Prerequisites

- **Node.js** 18+ — [nodejs.org](https://nodejs.org)
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
# Root dependencies (frontend + Leaflet)
npm install

# Backend dependencies
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

Edit `server/.env`:

```dotenv
PORT=4000
NODE_ENV=development

# MySQL / MariaDB — leave DB_PASSWORD empty for XAMPP default
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=roomiematch

# JWT — change this to a long random string in production
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

Edit `.env`:

```dotenv
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_API_URL=http://localhost:4000/api
```

---

### 4. Start MySQL

**Using XAMPP (Windows):**
1. Open XAMPP Control Panel
2. Click **Start** next to MySQL

**Command line:**
```powershell
C:\xampp\mysql\bin\mysqld.exe --console
```

---

### 5. Run Database Migration and Seed

```bash
cd server
npm run db:migrate    # Creates all 22 tables
npm run db:seed       # Inserts demo users, properties, applications
cd ..
```

---

### 6. Start the Application

Open **three separate terminals**:

```bash
# Terminal 1 — Backend API
cd server && npm run dev
# → http://localhost:4000/api
# → http://localhost:4000/api/health

# Terminal 2 — Client App
npm run dev:client
# → http://localhost:5173

# Terminal 3 — Admin App
npm run dev:admin
# → http://localhost:5174
```

---

## Login Credentials

### Client App (`http://localhost:5173`)

All demo accounts use password: **`password123`**

| Email | Notes |
|---|---|
| `alex@user.com` | Verified user — can search AND list properties |
| `sarah@user.com` | Verified user — has 3 listed properties |
| `marcus@user.com` | Verified user |
| `chloe@user.com` | Unverified user (pending ID review) |

### Admin Panel (`http://localhost:5174`)

| Email | Notes |
|---|---|
| `admin@roomiematch.com` | Full admin access — use on port 5174 only |

> **Important:** Admin accounts are blocked on the client app (port 5173). Regular user accounts are blocked on the admin panel (port 5174). Role enforcement happens both in the frontend (redirect with error) and backend (`requireAdmin` middleware → 403).

---

## How to Access the Database

**Option 1 — phpMyAdmin (browser, visual)**
1. Start MySQL via XAMPP
2. Open `http://localhost/phpmyadmin`
3. Click **roomiematch** in the left sidebar

**Option 2 — MySQL command line**
```powershell
C:\xampp\mysql\bin\mysql.exe -u root roomiematch
```
```sql
SHOW TABLES;
SELECT * FROM users;
SELECT name, email, role FROM users;
SELECT title, price, city, latitude, longitude FROM properties;
```

**Option 3 — VS Code**
Install **Database Client** (by Weijan Chen), connect:
- Host: `localhost` · Port: `3306` · User: `root` · Password: *(blank)* · Database: `roomiematch`

**Reset to demo data:**
```bash
cd server
npm run db:migrate   # safe — uses CREATE IF NOT EXISTS
npm run db:seed      # idempotent — uses INSERT ON DUPLICATE KEY UPDATE
```

---

## Login Flow — How It Works

### Email / Password (Both Apps)

1. User submits email + password to `POST /api/auth/login`
2. Backend verifies bcrypt hash, returns JWT + full user object
3. `AuthContext` stores JWT in `localStorage('roomiematch_jwt')`
4. On page reload, `AuthContext` calls `GET /api/auth/me` to rehydrate session
5. Expired or revoked JWTs return 401 — user is redirected to login

### Google OAuth

1. User clicks "Continue with Google" → Google One Tap popup
2. Google returns an ID token (signed JWT)
3. Frontend sends token to `POST /api/auth/google`
4. Backend validates token server-side via `google-auth-library`
5. Backend generates a 6-digit OTP and emails it to the verified Gmail address
6. User is redirected to `/verify-otp` to enter the code
7. `POST /api/auth/otp/verify` returns JWT on success

### Forgot Password

1. User submits email to `POST /api/auth/forgot-password`
2. Backend always returns 200 (prevents email enumeration)
3. If email exists, a reset link is sent: `/reset-password?token=...&email=...`
4. User clicks link → `ResetPasswordPage` calls `POST /api/auth/reset-password`
5. Token is bcrypt-hashed, single-use, expires in 1 hour

---

## API Reference

All endpoints are served from `http://localhost:4000/api`.

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Register (unified role) |
| POST | `/auth/login` | — | Email/password login |
| POST | `/auth/google` | — | Google ID token → OTP |
| POST | `/auth/otp/verify` | — | OTP → JWT |
| POST | `/auth/otp/resend` | — | Resend OTP (60s cooldown) |
| GET | `/auth/me` | JWT | Current user + preferences + hobbies |
| POST | `/auth/forgot-password` | — | Send reset email |
| POST | `/auth/reset-password` | — | Reset with token |
| PATCH | `/auth/change-password` | JWT | Change while authenticated |
| POST | `/auth/send-verification` | JWT | Send email verification link |
| GET | `/auth/verify-email` | — | Confirm email from link |

### Users
| Method | Endpoint | Auth | Notes |
|---|---|---|---|
| GET | `/users` | JWT | Admin: full list with emails. Non-admin: public-safe subset for roommate matching (no emails) |
| GET | `/users/:id` | JWT | Full profile with preferences + hobbies |
| PATCH | `/users/:id` | JWT | Update profile — own only (admin: any) |
| DELETE | `/users/:id` | Admin | Delete user |

### Properties
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/properties` | Optional | Search with filters: search, city, type, minPrice, maxPrice, bedrooms, verified, ownerId |
| POST | `/properties` | JWT | Create listing (any user) |
| GET | `/properties/:id` | Optional | Full detail with images, amenities, rules, owner, lat/lng |
| PUT | `/properties/:id` | JWT | Update (owner only) |
| DELETE | `/properties/:id` | JWT | Delete (owner or admin) |
| PATCH | `/properties/:id/verify` | Admin | Approve listing |
| PATCH | `/properties/:id/status` | JWT | Toggle active/inactive/rented |
| POST | `/properties/:id/images` | JWT | Upload images (up to 6) |
| DELETE | `/properties/images/:id` | JWT | Delete image |
| PATCH | `/properties/images/:id/primary` | JWT | Set cover photo |

### Applications
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/applications` | JWT | Tenant: own. Owner: received. Admin: all. Includes `history[]`, `owner_name`, `tenant_name` |
| POST | `/applications` | JWT | Submit (tenant only, not to own property) |
| GET | `/applications/:id` | JWT | Full detail with history, tenant, owner info |
| PATCH | `/applications/:id/status` | JWT | Approve/reject (owner) |
| DELETE | `/applications/:id` | JWT | Cancel (tenant) |

### File Uploads
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/profile` | JWT | Upload profile photo (5MB max) |
| DELETE | `/profile` | JWT | Remove profile photo |
| POST | `/verification` | JWT | Upload ID document (10MB max, PDF/image) |
| GET | `/verification/status` | JWT | Own verification status |
| GET | `/verification/doc/:userId` | JWT | View document (admin-gated) |
| POST | `/verification/:userId/approve` | Admin | Approve with `is_verified=1` |
| POST | `/verification/:userId/reject` | Admin | Reject with reason |
| GET | `/verification/pending` | Admin | List pending submissions |

### Messaging
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/messages/unread-count` | JWT | Total unread across all threads |
| GET | `/messages/conversations` | JWT | List threads (last message + unread count) |
| POST | `/messages/conversations` | JWT | Get or create thread (idempotent) |
| GET | `/messages/conversations/:id` | JWT | Conversation detail |
| GET | `/messages/conversations/:id/messages` | JWT | Messages (auto-marks incoming as read) |
| POST | `/messages/conversations/:id/messages` | JWT | Send message (rate limited 60/min) |
| PATCH | `/messages/conversations/:id/read` | JWT | Mark conversation as read |

### Notifications
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/notifications` | JWT | List (snake_case fields: `is_read`, `created_at`, `reference_id`) |
| PATCH | `/notifications/:id/read` | JWT | Mark one read |
| PATCH | `/notifications/read-all` | JWT | Mark all read |
| DELETE | `/notifications/:id` | JWT | Delete |

### Favourites, Reviews, Reports
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/favourites` | JWT | Saved properties (with `cover_image`) |
| POST | `/favourites` | JWT | Save (INSERT IGNORE — idempotent) |
| GET | `/favourites/:propertyId/status` | JWT | `{ isFavourited: bool }` |
| DELETE | `/favourites/:propertyId` | JWT | Remove |
| GET | `/reviews` | — | Filter by `targetProperty`, `targetUser`, `reviewerId` |
| POST | `/reviews` | JWT | Submit (rating 1–5, cannot self-review) |
| POST | `/reports` | JWT | Submit abuse report |
| GET | `/reports` | Admin | List with status filter |
| GET | `/reports/:id` | Admin | Single report detail |
| PATCH | `/reports/:id` | Admin | Resolve or dismiss |

### Admin & Compatibility
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/admin/stats` | Admin | Users, properties, verifications, reports, revenue counts |
| GET | `/admin/activity` | Admin | Recent users, properties, applications, reports |
| GET | `/compatibility` | JWT | Stored compatibility scores for current user |
| POST | `/compatibility/save` | JWT | Persist batch of computed scores to MySQL |

---

## Compatibility Matching — PRD Weights

The roommate compatibility algorithm uses the weights specified in the PRD:

| Factor | Weight | Source |
|---|---|---|
| Budget overlap | 30% | `budget_min` / `budget_max` range comparison |
| Lifestyle preferences | 30% | smoke, pet, cleanliness, sleep, social, cooking, drinking, guests |
| Shared interests/hobbies | 20% | Jaccard overlap of `user_hobbies` |
| Location (city match) | 10% | `users.city` field |
| Occupation (university/major) | 10% | `users.university` + `users.major` |

Scores are computed client-side by `useRoommates.js` and **persisted to MySQL** via `POST /api/compatibility/save` after each calculation. Stored scores can be retrieved via `GET /api/compatibility`.

---

## Real-Time Chat — Socket.io

The messaging system uses **Socket.io v4.8** running on the same port 4000 as the REST API. Messages are delivered instantly with no polling delay.

### How it works

1. On login, the frontend connects to `ws://localhost:4000` with the JWT in `handshake.auth.token`
2. Server validates the JWT — invalid tokens are rejected at the WebSocket handshake
3. When a user opens a conversation, the client emits `join_conversation` to join the Socket.io room
4. When a message is sent, the client emits `send_message` — the server saves it to MySQL then broadcasts `new_message` to the entire room
5. Both sender and recipient receive the message instantly via the same room broadcast
6. On logout, the socket disconnects automatically

### Socket.io events

| Direction | Event | Payload | Description |
|---|---|---|---|
| Client → Server | `join_conversation` | `{ conversationId }` | Join room, mark messages read |
| Client → Server | `send_message` | `{ conversationId, body }` | Save to DB + broadcast |
| Client → Server | `typing` | `{ conversationId, isTyping }` | Broadcast typing indicator |
| Client → Server | `leave_conversation` | `{ conversationId }` | Leave room |
| Server → Client | `new_message` | `{ message }` | New message in room |
| Server → Client | `message_read` | `{ conversationId, readBy }` | Read receipt |
| Server → Client | `user_typing` | `{ conversationId, userId, userName, isTyping }` | Typing indicator |
| Server → Client | `connected` | `{ userId }` | Connection confirmed |
| Server → Client | `error` | `{ message }` | Error feedback |

### Chat UI features
- **Instant delivery** — no polling, no refresh needed
- **Live / Offline badge** — shows socket connection status in header
- **Typing indicators** — animated dots when the other person is typing
- **Read receipts** — single tick (sent), double blue tick (read by recipient)
- **REST fallback** — if socket disconnects temporarily, falls back to REST POST
- **Message history** — loaded via REST on conversation open for reliability

---

## Maps

Property listings include **latitude** and **longitude** coordinates. The `PropertyMap` component (`shared/components/common/PropertyMap.jsx`) renders an OpenStreetMap map using **Leaflet** — no API key required.

- **PropertySearch** — shows all search results on an interactive map above the property cards
- **PropertyDetails** — shows the property's location on a map below house rules

---

## Features

### All Users (both apps)
- **Public landing page** — hero, features, stats, how-it-works, compatibility showcase, CTA
- Register with email/password or Google OAuth
- Email address verification via secure link
- Verify student identity by uploading ID document
- Search and filter properties (city, price, type, bedrooms, amenities)
- View properties on an interactive Leaflet map with markers
- Save favourite properties
- Apply for a rental with a personal message
- Track application status with full history timeline
- List and manage own rental properties with photos
- Accept or reject applications received for own listings
- **Real-time messaging via Socket.io** — instant delivery, typing indicators, read receipts
- Rate and review properties and roommates (1–5 stars)
- Find compatible roommates using PRD-weighted scoring (persisted to MySQL)
- Receive in-app notifications (messages, applications, verifications — auto-created)
- Forgot/reset password via secure email link

### Administrators
- View platform statistics (users, properties, verifications, reports, revenue)
- Approve or reject identity verification documents (with rejection reason)
- Approve or reject property listings before they go live
- Manage all user accounts (search, view, delete)
- Review and resolve/dismiss abuse reports
- View analytics overview and recent activity feed

---

## Security

| Feature | Implementation |
|---|---|
| Password hashing | bcrypt, salt rounds 10 |
| JWT | HS256, validated against DB on every request (deleted users auto-rejected) |
| Google tokens | Server-side `verifyIdToken` via `google-auth-library` |
| OTP | `crypto.randomInt` (CSPRNG), bcrypt-hashed, 5min expiry, max 5 attempts |
| Socket.io auth | JWT validated at WebSocket handshake — invalid tokens rejected before connection |
| Rate limiting | Auth: 20/15min, OTP: 10/5min, Password: 5/15min, Messages: 60/min |
| Verification docs | Auth-gated endpoint — never served as static files |
| SQL injection | Parameterised queries throughout — zero string interpolation |
| Role separation | `requireAuth` + `requireAdmin` middleware; non-admins cannot access admin endpoints |
| Privacy | Non-admin user list never exposes email addresses |
| CORS | Restricted to known origins (`CLIENT_URL`, `ADMIN_URL`) |
| Upload validation | MIME type + file extension both checked; UUID filenames |

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

**Server fails to start**
- Ensure MySQL/MariaDB is running **before** starting `node src/index.js`
- Check `server/.env` has correct `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- Run `npm run db:migrate` if tables are missing

**"Failed to fetch" or CORS error on login**
- Start the backend **first** (`cd server && npm run dev`) before opening the browser
- Vite may start on a different port (5175, 5176, etc.) if 5173 is busy — this is fine, the server accepts any `localhost:*` port in development
- If the error persists, check that port 4000 is free: `netstat -ano | findstr :4000`

**Login not working**
- Client app: use `alex@user.com` / `password123` (not the admin account)
- Admin panel: use `admin@roomiematch.com` / `password123` (not a regular user account)
- Admin accounts are **blocked** on the client app; regular users are **blocked** on the admin panel

**`npm install` fails**
- Make sure Node.js 18+ is installed: `node --version`
- Delete `node_modules` and retry:
  ```powershell
  # Windows
  Remove-Item -Recurse -Force node_modules; npm install
  cd server; Remove-Item -Recurse -Force node_modules; npm install; cd ..
  ```

**Database connection error**
- Make sure XAMPP MySQL is started (green in control panel)
- Run `npm run db:migrate` again from the `server` folder
- Default XAMPP root password is blank — `DB_PASSWORD=` in `server/.env`

**Google OAuth not working**
- Google OAuth is **optional** — email/password login works without it
- To enable: add `http://localhost:5173` and `http://localhost:5174` as authorised JavaScript origins in [Google Cloud Console](https://console.cloud.google.com)
- Ensure `VITE_GOOGLE_CLIENT_ID` in root `.env` matches `GOOGLE_CLIENT_ID` in `server/.env`

**Emails (OTP / forgot password) not sending**
- SMTP is **optional** — the app works without it for demo purposes
- To enable: generate a Gmail App Password at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
- Use the 16-char App Password as `SMTP_PASSWORD` in `server/.env`

**Port already in use (Windows)**
```powershell
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

**Rate limit hit**
- Auth endpoints are limited to 20 requests per 15 minutes per IP
- If blocked, wait 15 minutes or restart the server

---

## Running on Another Device

Follow the exact same steps above. The only requirement is:
1. Node.js 18+ installed
2. XAMPP (or any MySQL 8 / MariaDB 10.4+ installation) running
3. The repository cloned from GitHub

Everything else (tables, demo data, dependencies) is set up by the commands in Steps 2–5 above.
---

## Project Info

- **University**: University of Wolverhampton
- **Module**: Software Engineering Project (SEP)
- **Repository**: [GitHub](https://github.com/ramsharankewat789-gif/RoomieMatch-Roommate---Rental-Matching-Platform-SEP-Project-)
- **Last Updated**: August 2026
