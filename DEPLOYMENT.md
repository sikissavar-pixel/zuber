# Zuber Frontend - Vercel Deployment Guide

## Environment Variables

Add these environment variables in **Vercel Dashboard → Project Settings → Environment Variables**:

### Required Variables

```bash
NEXT_PUBLIC_API_URL=https://zuber-backend-production-071e.up.railway.app
```

### Optional Variables (if needed)

```bash
NEXT_PUBLIC_SOCKET_URL=https://zuber-backend-production-071e.up.railway.app
NEXT_PUBLIC_SOCKET_PATH=/socket.io
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_key_here
NEXT_PUBLIC_GOOGLE_PRODUCT_ID=vip_ride_001
```

## Deployment Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "fix: Full API integration between Vercel frontend and Railway backend"
   git push
   ```

2. **Import Project to Vercel**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repository
   - **Set Root Directory**: `frontend`
   - Framework Preset: **Next.js**

3. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add `NEXT_PUBLIC_API_URL` with the Railway backend URL
   - Select: **Production**, **Preview**, **Development** (all environments)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your frontend will be live at: `https://zuber-37e2.vercel.app`

## Backend CORS Configuration

Make sure Railway backend has these environment variables:

```bash
CORS_ORIGINS=https://zuber-37e2.vercel.app,http://localhost:3000
SOCKET_CORS_ORIGINS=https://zuber-37e2.vercel.app,http://localhost:3000
```

## Testing

After deployment, test these endpoints:

- `https://zuber-37e2.vercel.app` - Homepage
- `https://zuber-37e2.vercel.app/login` - Login page
- Check browser console - should NOT see "NEXT_PUBLIC_API_URL not set" warning
- Check Network tab - API calls should go to Railway backend

## API Endpoint Mapping

All frontend API calls use the centralized `lib/api.ts` client:

### Authentication
- POST `/api/users/register`
- POST `/api/users/login`
- GET `/api/users/me`
- PATCH `/api/users/me`
- POST `/api/users/me/upload`
- POST `/api/users/change-password`

### Reservations
- GET `/api/reservations/me`
- GET `/api/reservations/admin`
- POST `/api/reservations`
- PATCH `/api/reservations/:id/status`
- PATCH `/api/reservations/:id/assign_driver`

### Applications
- POST `/api/partners/apply`
- POST `/api/drivers/apply`
- GET `/api/applications/partners`
- GET `/api/applications/drivers`
- POST `/api/applications/partners/:id/approve`
- POST `/api/applications/partners/:id/reject`
- POST `/api/applications/drivers/:id/approve`
- POST `/api/applications/drivers/:id/reject`

### Payments
- POST `/api/payments/create_intent`
- POST `/api/payments/googleplay/verify`

### Bookings
- GET `/api/bookings`
- POST `/api/bookings/create`
- POST `/api/bookings/:id/qr_confirm`

### Wallet
- GET `/api/wallet/me`

### Partners
- GET `/api/partners/`
- POST `/api/partners/change-password`

## Troubleshooting

### API calls return 404

**Cause**: Frontend calling wrong URL or env variable not set

**Fix**:
1. Check Vercel environment variables
2. Redeploy after adding env vars
3. Check browser console for "NEXT_PUBLIC_API_URL not set" warning

### CORS errors

**Cause**: Railway backend doesn't have Vercel domain in CORS_ORIGINS

**Fix**:
1. Go to Railway project
2. Add to Variables: `CORS_ORIGINS=https://zuber-37e2.vercel.app`
3. Restart Railway service

### Socket.IO not connecting

**Cause**: Socket URL not configured

**Fix**:
1. Socket.IO uses same `NEXT_PUBLIC_API_URL` by default
2. If backend socket is on different URL, set `NEXT_PUBLIC_SOCKET_URL`

## Local Development

```bash
# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Install dependencies
npm install

# Run dev server
npm run dev
```

Open http://localhost:3000
