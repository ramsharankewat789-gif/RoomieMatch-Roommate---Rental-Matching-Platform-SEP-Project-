# RoomieMatch — Server

This directory will contain the Node.js / Express backend API.

## Planned Structure

```
server/
└── src/
    ├── config/          # Environment, database, and app configuration
    ├── controllers/     # Route handler functions
    ├── middleware/      # Auth, validation, error-handling middleware
    ├── models/          # Database models (Mongoose / Sequelize / Prisma)
    ├── routes/          # Express router definitions
    ├── services/        # Business logic layer
    ├── utils/           # Helper utilities
    ├── validators/      # Request validation schemas (Zod / Joi)
    └── modules/
        ├── auth/            # Registration, login, JWT, password reset
        ├── users/           # User profiles and preferences
        ├── properties/      # Property listings CRUD
        ├── matching/        # Roommate compatibility matching
        ├── messages/        # Real-time messaging (Socket.io)
        ├── admin/           # Admin-specific operations
        ├── verification/    # Document verification workflows
        └── notifications/   # Push / in-app notification dispatch
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
