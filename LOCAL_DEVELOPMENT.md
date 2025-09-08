# Local Development Setup

This guide helps you run the Ticketeer project locally with both frontend and backend.

## Prerequisites

- Node.js (v16 or higher)
- npm
- MongoDB (local or cloud connection)

## Quick Start (Recommended)

### 1. Start Backend Server
```bash
cd ticketeer-backend
PORT=5001 npm start
```

### 2. Start Frontend with Local Configuration
```bash
# In the root directory
npm run dev:local
```

This will:
- Set `VITE_API_URL=http://localhost:5001`
- Set `VITE_SOCKET_URL=http://localhost:5001`
- Start the frontend development server

## Manual Setup (Alternative)

### Option 1: Using Environment Variables
Create a `.env.local` file in the root directory:
```env
VITE_API_URL=http://localhost:5001
VITE_SOCKET_URL=http://localhost:5001
```

Then run:
```bash
npm run dev
```

### Option 2: Using the Automatic Script
```bash
npm run start:local
```
This script should start both backend and frontend automatically.

## Port Configuration

- **Backend**: Runs on port 5001 (`http://localhost:5001`)
- **Frontend**: Runs on port 5173 or next available port (`http://localhost:5173`)
- **Important**: Backend must use port 5001 to avoid conflicts with macOS Control Center (port 5000)

## Backend Requirements

Ensure your backend has:
- MongoDB connection established
- All required environment variables in `.env` file
- CORS configured for frontend ports: `5173`, `5174`, `5175`, `5176`

## Verification Steps

### 1. Check Backend is Running
```bash
curl http://localhost:5001/api/events
```
Should return JSON data with events.

### 2. Check Frontend is Running
Navigate to `http://localhost:5173` (or the port shown in terminal)

### 3. Verify Connection
Open browser console and check for successful API calls to `localhost:5001`

## Troubleshooting

### Backend Not Connecting
1. **Check backend status**: `lsof -i :5001`
2. **Test API directly**: `curl http://localhost:5001/api/events`
3. **Verify CORS settings** in backend allow frontend ports
4. **Check environment variables** are properly set

### Port Conflicts
- **Port 5000 occupied**: Use `PORT=5001` for backend (macOS Control Center uses 5000)
- **Frontend port in use**: Vite will automatically use next available port
- **Check running processes**: `lsof -i :5001` and `lsof -i :5173`

### Common Issues
- **MongoDB not connected**: Check backend logs for database connection errors
- **Environment variables not loaded**: Ensure `.env` files are in correct locations
- **CORS errors**: Update backend CORS settings to include your frontend port

### API Endpoints
The app will log the current API configuration in the browser console:
```
🔗 API Configuration: {
  environment: 'development',
  isLocalhost: true,
  apiUrl: 'http://localhost:5001',
  socketUrl: 'http://localhost:5001'
}
```

## Social Media Sharing Testing

The social media sharing features are now integrated:

1. **Event Pages**: Click the "Share" button on any event
2. **Order Confirmation**: Social sharing is automatically included after purchase
3. **Platforms Supported**:
   - Facebook
   - Instagram (opens web version)
   - WhatsApp
   - Copy Link
   - Native Share API (mobile devices)

## Switching Between Environments

- **Local Backend**: `npm run dev:local`
- **Production Backend**: `npm run dev`
- **Build for Production**: `npm run build`
