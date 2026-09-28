# TeenSpend Backend API

Production-ready REST API for **TeenSpend — Teenager Expense Tracker**, built with Node.js, Express, MVC architecture, bcrypt, JWT authentication, and Supabase PostgreSQL.

## Features
- **Strict MVC Architecture**: Clear separation of Routes, Controllers, Services, Models, and Database adapter.
- **Secure Authentication**: 12-round bcrypt password hashing, JWT bearer token verification, and security isolation.
- **Expense CRUD**: Add, edit, delete, list, filter by category/date/necessity, and full-text search.
- **Smart Analytics Engine**: Monthly trends, category breakdowns, necessary vs. discretionary ratios, budget comparisons.
- **Intelligent Recommendations**: Measurable rule-based advice for teens (budget pace alerts, high category spending, frequent small purchase detection).
- **Savings Goals**: Goal tracking with automatic required weekly/monthly savings pace calculation and quick contributions.
- **Multi-Environment Supabase Adapter**: Connects to live Supabase PostgreSQL instances or runs with a local data store during offline evaluation.

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation
```bash
cd backend
npm install
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_long_random_jwt_secret
FRONTEND_URL=http://localhost:5173
```

### Run Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### Run Tests
```bash
npm test
```
