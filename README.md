# Lead Management System (CRM)

A full-stack CRM application built with **Laravel 12** (backend API) and **Next.js 16** (frontend), featuring lead management, team performance analytics, and role-based access control.

## 🚀 Features

- **Lead Management**: Complete CRUD operations with status tracking
- **Team Performance Metrics**: Comprehensive analytics dashboard with per-rep KPIs
- **User Management**: Role-based access control (Admin, Manager, Sales Rep)
- **Import/Export**: CSV/Excel import and export functionality
- **Lead Scoring**: Automated lead scoring system
- **Activity Tracking**: Real-time activity logs and notes
- **Kanban Board**: Visual lead pipeline management
- **Reports & Analytics**: Team performance reports with charts and metrics

## 📁 Project Structure

```
├── backend/          # Laravel API (PHP 8.2+)
│   ├── app/         # Application logic
│   ├── database/    # Migrations and seeders
│   └── routes/       # API routes
├── frontend/         # Next.js application (React 19)
│   ├── src/
│   │   ├── app/     # Pages and routes
│   │   ├── components/  # React components
│   │   └── lib/     # Utilities and API client
├── ARCHITECTURE.md   # System architecture documentation
├── DEPLOYMENT_CHECKLIST.md  # Deployment guide
├── DEMO_USERS.md    # Demo account credentials
└── PROJECT_STATUS.md # Project status and features

```

## 🛠️ Tech Stack

### Backend
- Laravel 12
- PHP 8.2+
- Laravel Sanctum (Authentication)
- MySQL/PostgreSQL/SQLite
- Maatwebsite Excel (Import/Export)

### Frontend
- Next.js 16 (App Router)
- React 19
- TanStack Query (Data fetching)
- Recharts (Data visualization)
- TailwindCSS (Styling)
- Zustand (State management)

## 🚀 Quick Start

### Prerequisites
- PHP 8.2+ with Composer
- Node.js 20+ with npm
- MySQL/PostgreSQL (or SQLite for development)
- Redis (optional, for caching/queues)

### Backend Setup

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```

Backend will run on `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
npm run dev
```

Frontend will run on `http://localhost:3000`

## 🔐 Demo Credentials

After running seeders, you can use these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@example.com` | `password` |
| Manager | `manager@example.com` | `password` |
| Sales Rep | `rep.na@example.com` | `password` |

See [DEMO_USERS.md](DEMO_USERS.md) for more details.

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user

### Leads
- `GET /api/v1/leads` - List leads (with filters)
- `POST /api/v1/leads` - Create lead
- `GET /api/v1/leads/{id}` - Get lead details
- `PUT /api/v1/leads/{id}` - Update lead
- `DELETE /api/v1/leads/{id}` - Delete lead
- `GET /api/v1/leads/export` - Export leads
- `POST /api/v1/leads/{id}/notes` - Add note

### Metrics
- `GET /api/v1/metrics/teams/{team}/users` - Team performance metrics

See [PROJECT_STATUS.md](PROJECT_STATUS.md) for complete API documentation.

## 🧪 Testing

```bash
# Backend tests
cd backend
php artisan test

# Frontend (if tests are set up)
cd frontend
npm test
```

## 📦 Deployment

See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for detailed deployment instructions.

### Quick Deploy

**Backend:**
- Deploy to Laravel Forge, Vapor, or any PHP hosting
- Set environment variables
- Run migrations and seeders

**Frontend:**
- Deploy to Vercel (recommended) or Netlify
- Set `NEXT_PUBLIC_API_BASE_URL` environment variable
- Build and deploy

## 📝 Documentation

- [Architecture](ARCHITECTURE.md) - System design and architecture
- [Deployment Guide](DEPLOYMENT_CHECKLIST.md) - Production deployment steps
- [Project Status](PROJECT_STATUS.md) - Feature list and implementation status
- [Demo Users](DEMO_USERS.md) - Test account information

## 🎯 Key Features

### Team Performance Reports
- Per-rep lead metrics (created, owned)
- Status breakdown by rep
- Monthly revenue tracking
- Activity counts (notes, activities)
- Interactive charts and visualizations

### Lead Management
- Kanban board view
- Advanced filtering and search
- Status history tracking
- Automated lead scoring
- Product associations

### User Management
- Role-based permissions
- Team assignments
- User activation/deactivation
- Activity tracking

## 🔒 Security

- Laravel Sanctum authentication
- Role-based authorization
- CORS configuration
- SQL injection protection (Eloquent ORM)
- XSS protection (React auto-escaping)
- CSRF protection

## 📄 License

This project is open-sourced software licensed under the MIT license.

## 👤 Author

Built as a portfolio project demonstrating full-stack development skills.

---


