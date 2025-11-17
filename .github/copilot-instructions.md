# VIP Istanbul Transfer - AI Coding Guide

This guide helps AI agents understand and work effectively with this codebase.

## Project Overview

A full-stack chauffeur reservation system with web and mobile interfaces:

- **Frontend**: Next.js 14 web app + Capacitor mobile app
- **Backend**: FastAPI + SQLModel + Socket.IO for real-time updates
- **Key Features**: Reservations, live driver tracking, payments (Stripe + Google Play), role-based access

## Architecture

### Backend (`/backend`)

- FastAPI app with role-based auth (guest/driver/partner/admin)
- Real-time updates via Socket.IO (driver locations, reservation status)
- Key models:
  - `User`: Authentication and role management
  - `Reservation`: Core booking entity with status flow
  - `Payment`: Handles Stripe/Google Play transactions
  - `Vehicle`/`Partner`: Supporting entities

Core files:
- `app/main.py` - Entry point and Socket.IO setup
- `app/auth.py` - JWT auth and role middleware
- `app/routers/*` - API endpoint groups

### Frontend (`/frontend`)

- Next.js 14 with App Router structure
- Capacitor for Android mobile app
- Role-specific dashboards under `app/(dashboard)/`
- Real-time updates with socket.io-client

Key components:
- `components/ProtectedRoute.tsx` - Role-based route protection
- `components/mobile/*` - Mobile-specific UI components
- `hooks/useSocket.ts` - Real-time socket management

## Development Workflows

### Backend

1. Setup Python environment:
```bash
pip install -r backend/requirements.txt
```

2. Configure environment:
- Copy `backend/.env.example` to `backend/.env`
- For development, SQLite works: `DATABASE_URL=sqlite:///./dev.db`

3. Run development server:
```bash
cd backend
uvicorn app.main:sio_app --reload
```

4. Seed initial data:
```bash
python seed.py
```

### Frontend

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Development server:
```bash
npm run dev
```

3. Android build:
```bash
npm run build
npx cap sync android
npx cap open android
```

## Key Integration Points

1. **Real-time Updates**
- Backend emits events via `sio.emit()` in routers
- Frontend listens via `useSocket` hook
- Key events: `reservation_updated`, `driver_location_update`

2. **Payments**
- Stripe: Frontend creates intent, backend validates webhook
- Google Play: In-app purchases with backend validation

3. **Mobile Features**
- Location tracking via Capacitor Geolocation plugin
- Native UI elements managed through `MobileAppBridge`

## Conventions & Patterns

1. **API Structure**
- Routes follow `/api/{resource}` pattern
- Role-based access via `@require_role` decorator
- Standard CRUD operations with Socket.IO events

2. **Frontend Organization**
- Page-based routing with role protection
- Shared UI components in `components/ui/`
- Mobile-specific components in `components/mobile/`

3. **State Management**
- React Query for API state
- Context for auth state (`AuthContext.tsx`)
- Socket.IO for real-time updates

## Common Tasks

1. **Adding a New API Endpoint**
- Create route in appropriate `backend/app/routers/*` file
- Add models if needed in `backend/app/models/`
- Include router in `main.py`

2. **Creating New Frontend Pages**
- Add page under appropriate route group in `app/`
- Wrap with `ProtectedRoute` for role checks
- Use shared UI components from `components/ui/`

3. **Working with Mobile Features**
- Android-specific code goes in `android/` directory
- Use Capacitor plugins via hooks/components
- Test on both web and mobile views

## Debugging Tips

1. **Backend Issues**
- Check uvicorn logs for API errors
- Socket.IO events logged in console
- Database issues visible in SQLite/Postgres logs

2. **Frontend Issues**
- React dev tools for component debugging
- Network tab for API/socket issues
- Android logcat for mobile issues

3. **Authentication**
- JWT token stored in localStorage
- Role checks in `ProtectedRoute`
- Backend validates via `get_current_user`