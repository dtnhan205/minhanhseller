# Reseller Frontend

Modern React + TypeScript frontend for the Reseller Dashboard.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Zustand** - State management
- **Axios** - HTTP client
- **Lucide React** - Icons

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Update `.env` with your API URL:
```
VITE_API_URL=http://localhost:3000/api
```

4. Start development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   └── ui/          # Base components (Button, Input, Card)
├── pages/           # Page components
│   ├── auth/        # Login, Register
│   ├── GeneratePage.tsx
│   ├── StatsPage.tsx
│   ├── HistoryPage.tsx
│   ├── TransactionsPage.tsx
│   └── TopupPage.tsx
├── layouts/         # Layout components
├── services/        # API services
├── store/           # Zustand stores
├── types/           # TypeScript types
├── utils/           # Utility functions
└── App.tsx          # Main app component
```

## Features

- ✅ Admin registration (admin only)
- ✅ Seller login
- ✅ Key purchase (generate keys)
- ✅ Statistics dashboard
- ✅ Purchase history
- ✅ Topup history
- ✅ Wallet topup
- ✅ Modern dark theme UI
- ✅ Responsive design

## API Endpoints

The frontend connects to the backend API. Make sure the backend is running and the `VITE_API_URL` in `.env` is correct.

