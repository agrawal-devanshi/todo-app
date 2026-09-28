# TeenSpend — Teenager Expense Tracker 💸✨

> A modern, friendly, and non-judgmental expense tracker and budget planner built specifically for teenagers to understand where their money goes, visualize spending habits, set budgets, and achieve their savings goals.

---

## 🌟 Application Objective

Teenagers often struggle to understand where their pocket money or earnings go. **TeenSpend** empowers teens to build lifelong financial literacy by:
- Tracking every purchase with categorized details and payment methods.
- Distinguishing between **Essential Needs** vs. **Discretionary Wants**.
- Visualizing spending through interactive **Recharts** (bar, donut, trendline, and comparison charts).
- Managing monthly overall and category-specific budgets with **Safe**, **Warning**, **Critical**, and **Over-budget** thresholds.
- Setting visual **Savings Goals** (for headphones, tech, trips, or gifts) with auto-calculated weekly and monthly saving targets.
- Receiving **smart, measurable, non-judgmental spending recommendations** that guide without shaming.

---

## 🛠️ Required Technology Stack

### Frontend
- **React.js 18** (SPA)
- **Vite** (Next-generation frontend tooling)
- **React Router v6** (Client-side routing with protected routes)
- **Axios** (Centralized API client with JWT interceptors)
- **Recharts** (Interactive responsive data visualization)
- **Tailwind CSS** (Vibrant teen-friendly aesthetic with glassmorphism and rounded cards)
- **Lucide React** (Clean, modern financial and category icons)
- **JavaScript ES6+**

### Backend
- **Node.js** & **Express.js**
- **Strict MVC Architecture** (Routes → Controllers → Services → Models → Supabase)
- **bcrypt** (12-round password hashing)
- **JSON Web Tokens (JWT)** (Secure token-based authorization)
- **dotenv** (Secure environment configuration)
- **CORS** (Configured cross-origin resource sharing)

### Database
- **Supabase** (Managed PostgreSQL)
- Foreign keys with `ON DELETE CASCADE`
- Auto-updating `updated_at` triggers and performance indexes

---

## 📂 Project Folder Structure

The project strictly isolates the frontend and backend into two independent, runnable applications:

```
teen-spend/
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── ExpenseForm.jsx
│   │   │   ├── ExpenseTable.jsx
│   │   │   ├── ExpenseCard.jsx
│   │   │   ├── BudgetCard.jsx
│   │   │   ├── BudgetProgress.jsx
│   │   │   ├── RecommendationCard.jsx
│   │   │   ├── SavingsGoalCard.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Expenses.jsx
│   │   │   ├── AddExpense.jsx
│   │   │   ├── EditExpense.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── Budget.jsx
│   │   │   ├── SavingsGoals.jsx
│   │   │   └── Profile.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── utils/
│   │   │   └── formatters.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── expenseController.js
│   │   │   ├── budgetController.js
│   │   │   ├── analyticsController.js
│   │   │   └── savingsController.js
│   │   ├── models/
│   │   │   ├── userModel.js
│   │   │   ├── expenseModel.js
│   │   │   ├── budgetModel.js
│   │   │   └── savingsModel.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── expenseRoutes.js
│   │   │   ├── budgetRoutes.js
│   │   │   ├── analyticsRoutes.js
│   │   │   └── savingsRoutes.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorMiddleware.js
│   │   │   └── validationMiddleware.js
│   │   ├── services/
│   │   │   ├── recommendationService.js
│   │   │   └── analyticsService.js
│   │   ├── utils/
│   │   │   └── jwt.js
│   │   └── server.js
│   ├── tests/
│   │   └── api.test.js
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── supabase_schema.sql
├── README.md
└── .gitignore
```

---

## 🗄️ Database Setup & Supabase Configuration

### Step 1: Create Supabase Project
1. Log in to [Supabase](https://supabase.com).
2. Create a new project (e.g., `teen-spend`).

### Step 2: Run the Database Schema SQL
1. Open the **SQL Editor** tab in your Supabase dashboard.
2. Open [`supabase_schema.sql`](./supabase_schema.sql) from the project root.
3. Paste the contents into the SQL Editor and click **Run**.

This script sets up:
- `users` table (ID, Name, Email, bcrypt password hash, timestamps)
- `expenses` table (ID, user_id foreign key, amount > 0, category, description, date, payment method, is_necessary boolean)
- `budgets` table (ID, user_id, category, amount, month, year, unique constraint per user/category/month/year)
- `savings_goals` table (ID, user_id, name, target_amount, current_amount, target_date)
- Foreign keys with `ON DELETE CASCADE`
- Performance indexes on `(user_id, expense_date)`, `(category)`, `(user_id, year, month)`
- Triggers to keep `updated_at` timestamps accurate

### Step 3: Supabase Client & Fallback Engine
The backend initializes Supabase via `@supabase/supabase-js`. If live credentials are provided in `backend/.env`, it communicates with the PostgreSQL cloud database. If evaluating locally without Supabase keys, the adapter automatically activates a local store so developers can test immediately!

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_long_random_jwt_secret_key_teenspend
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Installation & Running

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```
Backend runs on `http://localhost:5000`.

To run test suites:
```bash
npm test
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

---

## 📡 REST API Summary

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user (bcrypt 12 rounds) | No |
| `POST` | `/api/auth/login` | Login user and issue JWT | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes (Bearer) |
| `PUT` | `/api/auth/profile` | Update profile name or password | Yes (Bearer) |

### Expenses (`/api/expenses`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/expenses` | Add new expense | Yes |
| `GET` | `/api/expenses` | List expenses (with search, category, date, type filters) | Yes |
| `GET` | `/api/expenses/:id` | Get expense details (isolated to owner) | Yes |
| `PUT` | `/api/expenses/:id` | Update expense | Yes |
| `DELETE` | `/api/expenses/:id` | Delete expense | Yes |

### Budgets (`/api/budgets`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/budgets` | Get budgets for month/year | Yes |
| `POST` | `/api/budgets` | Set or update overall/category budget | Yes |
| `GET` | `/api/budgets/summary`| Get budget vs actual comparison with thresholds | Yes |
| `DELETE` | `/api/budgets/:id` | Delete category budget | Yes |

### Analytics (`/api/analytics`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/analytics/summary` | Dashboard summary cards metrics | Yes |
| `GET` | `/api/analytics/categories` | Spending by category & percentage distribution | Yes |
| `GET` | `/api/analytics/monthly` | 6-month historical spending trend | Yes |
| `GET` | `/api/analytics/necessary` | Necessary (Needs) vs Discretionary (Wants) | Yes |
| `GET` | `/api/analytics/budget` | Budget vs Actual comparison across categories | Yes |

### Smart Recommendations (`/api/recommendations`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/recommendations` | Real-data driven friendly suggestions | Yes |

### Savings Goals (`/api/savings-goals`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/savings-goals` | List goals with auto-calculated weekly/monthly pace | Yes |
| `POST` | `/api/savings-goals` | Create savings goal | Yes |
| `PUT` | `/api/savings-goals/:id` | Update savings goal | Yes |
| `POST` | `/api/savings-goals/:id/contribute` | Quick deposit money into goal | Yes |
| `DELETE` | `/api/savings-goals/:id` | Delete savings goal | Yes |

---

## 🔒 Security Architecture
1. **Password Hashing**: User passwords are never stored as plain text. 12-round `bcrypt` hashing is strictly enforced.
2. **JWT Authorization**: Requests to protected routes require a `Bearer <token>` header containing a signed user ID payload.
3. **Data Isolation**: Database queries strictly filter by `user_id === req.userId`. Users cannot access, modify, or delete another user's expenses, budgets, or savings goals.
4. **Validation on Both Tiers**: Input parameters (amounts > 0, dates, categories, payment methods) are validated in both React forms and Express middleware.
5. **No Secret Leakage**: The Supabase Service Role Key is exclusively contained in `backend/.env`. React only talks to Express REST API endpoints.

---

## 🧪 Testing Instructions

Run the backend test suite:
```bash
cd backend
npm test
```
The test suite verifies:
- Health check `GET /api/health`
- Registration, validation, and bcrypt hashing
- Duplicate email conflict handling (`409 Conflict`)
- Login with password verification and JWT token return
- Invalid password rejection (`401 Unauthorized`)
- Token extraction in `authMiddleware`
- Expense CRUD operations
- **Security Isolation**: User B cannot view, modify, or delete User A's expenses (returns 404, leaves User A data intact)
- Budget creation, tracking, and threshold calculation
- Analytics and chart aggregations
- Smart spending recommendation engine
- Savings goals with progress calculations and quick contributions.
#   t o d o - a p p  
 