# Ticketeer Frontend

A modern React-based frontend for the Ticketeer Community Hub - an event ticketing and management platform.

## Features

- **Event Discovery**: Browse and search events with filtering by category
- **Ticket Purchasing**: Complete checkout flow with multiple payment options
- **Live DJ Integration**: Real-time playlist management and song requests
- **Admin Dashboard**: Event management and analytics for organizers
- **Progressive Disclosure**: Streamlined user experience with step-by-step flows
- **Responsive Design**: Mobile-first design with modern UI components

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Shadcn/ui** for UI components
- **Framer Motion** for animations
- **React Router** for navigation
- **React Query** for data fetching
- **Socket.IO Client** for real-time features

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see ticketeer-backend repository)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ticketeer-frontend.git
cd ticketeer-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── lib/                # Utility functions
└── assets/             # Static assets
```

## Key Features

### Event Management
- Create and manage events with detailed information
- Upload event flyers via Cloudinary integration
- Set ticket prices and availability
- Enable live playlist features

### Payment Processing
- PayPal integration for secure payments
- MCB Juice manual payment with OCR verification
- Progressive payment processing with confidence scoring
- Automatic ticket generation and email delivery

### Live DJ Features
- Real-time song requests and voting
- DJ dashboard for playlist management
- Socket.IO integration for live updates
- Spotify Web API integration for music search

### Admin Features
- Comprehensive analytics dashboard
- Order management and verification
- Event statistics and insights
- Payment verification tools

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
