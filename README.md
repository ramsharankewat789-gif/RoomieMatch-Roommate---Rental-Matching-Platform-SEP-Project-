# RoomieMatch — Roommate & Rental Matching Platform

RoomieMatch is a cross-platform application designed to help students, interns, working professionals, and individuals relocating to a new city find suitable roommates and rental properties.

---

## Project Structure

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
├── server/                     # Node.js / Express backend API (planned)
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       ├── validators/
│       └── modules/
│           ├── auth/
│           ├── users/
│           ├── properties/
│           ├── matching/
│           ├── messages/
│           ├── admin/
│           ├── verification/
│           └── notifications/
│
├── database/                   # Migrations, schema, and seed data
│   ├── migrations/
│   ├── schema/
│   └── seeds/
│
├── shared/                     # Shared code between client and admin
│   ├── components/common/      # Reusable UI components
│   ├── constants/
│   ├── context/                # React context providers (Auth, Notifications, Socket)
│   ├── data/                   # Mock data (replaced by API in production)
│   ├── hooks/                  # Shared React hooks
│   ├── styles/                 # Global CSS
│   ├── types/
│   └── utils/
│
├── docs/                       # Project documentation
│
├── vite.client.config.js       # Vite config for the client app
├── vite.admin.config.js        # Vite config for the admin app
├── tailwind.config.js
├── postcss.config.js
├── jsconfig.json
├── package.json
└── RoomieMatch.code-workspace
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install dependencies

```bash
npm install
```

### Run the client app (Tenant & Owner interface)

```bash
npm run dev:client
# → http://localhost:5173
```

### Run the admin app

```bash
npm run dev:admin
# → http://localhost:5174
```

### Build for production

```bash
npm run build          # builds both apps
npm run build:client   # client only
npm run build:admin    # admin only
```

---

## Application Roles

| Role  | Access |
|-------|--------|
| **User** (Tenant / Owner) | Client app at port 5173. Can search properties, list properties, apply to rent, message, and manage their profile. |
| **Admin** | Admin app at port 5174. Can manage users, properties, verifications, reports, and view analytics. |

---

## Tech Stack

- **Frontend**: React 19, React Router 7, Tailwind CSS, Vite
- **Charts**: Chart.js / react-chartjs-2
- **Backend**: Node.js / Express (planned)
- **Database**: TBD (planned)
