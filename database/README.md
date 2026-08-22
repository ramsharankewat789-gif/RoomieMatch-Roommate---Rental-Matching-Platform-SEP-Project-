# RoomieMatch — Database

This directory contains database schema definitions, migrations, and seed data.

## Structure

```
database/
├── migrations/   # Versioned schema change scripts
├── schema/       # Entity definitions and ERD references
└── seeds/        # Initial / test data population scripts
```

> The current frontend uses mock data located in `shared/data/`.
> Backend integration will replace mock data with live API calls.
