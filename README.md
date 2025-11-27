# Lead Management System (CRM) - Full-Stack Application

A comprehensive, production-ready Customer Relationship Management (CRM) system built with modern web technologies. This full-stack application demonstrates expertise in RESTful API design, real-time data visualization, role-based access control, and scalable architecture patterns.

**Live Demo:** [Frontend on Vercel] | [Backend API on Railway]

---

## 📋 Project Overview

This CRM system enables sales teams to manage leads throughout the entire sales pipeline, from initial contact to conversion. The application features advanced analytics, automated lead scoring, team performance tracking, and comprehensive reporting capabilities.

### Key Highlights

- **Full-Stack Architecture**: Separated frontend and backend with RESTful API communication
- **Production Deployment**: Successfully deployed on Vercel (frontend) and Railway (backend)
- **Real-Time Analytics**: Interactive dashboards with charts and performance metrics
- **Scalable Design**: Built with modern frameworks and best practices
- **Role-Based Security**: Multi-level access control with policy-based authorization

---

## ✨ Core Features

### 🎯 Lead Management
- **Complete CRUD Operations**: Create, read, update, and delete leads with validation
- **Kanban Board View**: Visual pipeline management with drag-and-drop status updates
- **Advanced Filtering**: Filter by status, team, owner, date range, and custom search
- **Status Tracking**: Complete audit trail of status changes with timestamps
- **Lead Scoring**: Automated scoring system based on source, engagement, value, and status
- **Product Associations**: Link multiple products to leads with quantity and pricing
- **Notes & Activities**: Comprehensive activity logging and note-taking system

### 📊 Analytics & Reporting
- **Team Performance Dashboard**: 
  - Per-rep metrics (leads created, owned, converted)
  - Status breakdown visualization
  - Monthly revenue tracking per sales rep
  - Activity counts (notes, interactions)
  - Interactive charts using Recharts
- **Date Range Filtering**: Customizable time periods for analysis
- **Role-Based Views**: Managers see their team; Admins see all teams
- **Export Functionality**: Export leads to CSV/Excel formats

### 👥 User & Team Management
- **Role-Based Access Control (RBAC)**:
  - **Admin**: Full system access, user management, settings
  - **Manager**: Team oversight, team performance reports
  - **Sales Rep**: Own leads only, limited visibility
- **Team Organization**: Hierarchical team structure with territory management
- **User Management**: Create, update, activate/deactivate users
- **Activity Tracking**: Complete audit log of user actions

### 📥 Data Import/Export
- **Bulk Import**: CSV/Excel file upload with validation
- **Import Status Tracking**: Real-time progress monitoring
- **Error Handling**: Detailed error reports for failed imports
- **Export Options**: Export filtered leads with custom date ranges

### 🔐 Security Features
- **Laravel Sanctum Authentication**: Token-based API authentication
- **Policy-Based Authorization**: Granular permissions per resource
- **CORS Configuration**: Secure cross-origin resource sharing
- **Input Validation**: Server-side validation with Laravel Form Requests
- **SQL Injection Protection**: Eloquent ORM with parameterized queries
- **XSS Protection**: React's built-in escaping and sanitization

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Laravel 12 (PHP 8.2+)
- **Authentication**: Laravel Sanctum
- **Database**: MySQL (Production) / SQLite (Development)
- **Validation**: Laravel Form Requests
- **File Processing**: Maatwebsite Excel (CSV/Excel import/export)
- **Architecture**: RESTful API, Service Layer Pattern, Repository Pattern

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **State Management**: Zustand, TanStack Query
- **Styling**: TailwindCSS with shadcn/ui components
- **Data Visualization**: Recharts
- **HTTP Client**: Axios with interceptors
- **Form Handling**: React Hook Form (implicit)

### DevOps & Deployment
- **Frontend Hosting**: Vercel
- **Backend Hosting**: Railway
- **Database**: Railway MySQL
- **Version Control**: Git/GitHub
- **CI/CD**: Automated deployments via Git integration

---

## 🏗️ Architecture Highlights

### Backend Architecture
- **API Versioning**: `/api/v1` prefix for future compatibility
- **Resource Controllers**: RESTful endpoints following Laravel conventions
- **Service Layer**: Business logic separated from controllers
  - `LeadAssignmentService`: Automated lead distribution
  - `LeadScoringService`: Dynamic scoring calculations
- **Repository Pattern**: Data access abstraction for reference data
- **Event-Driven**: Laravel events for activity logging and broadcasting
- **Queue Jobs**: Background processing for lead scoring and imports
- **Policies**: Authorization logic encapsulated in policy classes

### Frontend Architecture
- **Component-Based**: Reusable React components with composition
- **Server Components**: Next.js App Router for optimal performance
- **Client Components**: Interactive features with React hooks
- **API Client**: Centralized HTTP client with error handling
- **State Management**: 
  - TanStack Query for server state
  - Zustand for client state (authentication)
- **Responsive Design**: Mobile-first approach with TailwindCSS

### Database Design
- **Normalized Schema**: Proper relationships and foreign keys
- **Polymorphic Relations**: Flexible activity and notes system
- **Soft Deletes**: Data retention with soft deletion
- **Indexes**: Optimized queries with strategic indexing
- **Migrations**: Version-controlled database schema

---

## 🚀 Getting Started

### Prerequisites
- PHP 8.2+ with Composer
- Node.js 20+ with npm
- MySQL 8.0+ (or SQLite for development)
- Git

### Installation

#### Backend Setup
```bash
# Clone repository
git clone <repository-url>
cd "Lead Management System(CRM)/backend"

# Install dependencies
composer install

# Environment configuration
cp .env.example .env
php artisan key:generate

# Database setup
php artisan migrate:fresh --seed

# Start development server
php artisan serve
```

Backend API will be available at `http://localhost:8000`

#### Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Environment configuration
cp .env.example .env.local
# Set NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

### Demo Credentials

After running seeders, use these accounts to explore different roles:

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@example.com` | `password` |
| Manager | `manager@example.com` | `password` |
| Sales Rep | `rep.north@example.com` | `password` |

---

## 📡 API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/login` - User authentication
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user

### Lead Management
- `GET /api/v1/leads` - List leads (with filters: status, team_id, owner_id, search)
- `POST /api/v1/leads` - Create new lead
- `GET /api/v1/leads/{id}` - Get lead details
- `PUT /api/v1/leads/{id}` - Update lead
- `DELETE /api/v1/leads/{id}` - Delete lead
- `GET /api/v1/leads/export` - Export leads (CSV/Excel)
- `POST /api/v1/leads/{id}/notes` - Add note to lead

### Analytics & Metrics
- `GET /api/v1/metrics/teams/{team}/users` - Team performance metrics
  - Query params: `from` (date), `to` (date)
  - Returns: Leads per rep, status breakdown, monthly revenue, activity counts

### User Management
- `GET /api/v1/users` - List users
- `POST /api/v1/users` - Create user
- `GET /api/v1/users/{id}` - Get user details
- `PUT /api/v1/users/{id}` - Update user
- `DELETE /api/v1/users/{id}` - Deactivate user

### Data Import
- `POST /api/v1/imports/leads` - Upload CSV/Excel file
- `GET /api/v1/imports/{id}` - Get import status

All endpoints require authentication via Bearer token (except login).

---

## 🎨 Frontend Pages

- `/` - Login page
- `/dashboard` - Overview dashboard with KPIs
- `/dashboard/leads` - Lead list with filters
- `/dashboard/leads/new` - Create new lead
- `/dashboard/leads/[id]` - Lead detail view with edit
- `/dashboard/leads/board` - Kanban board view
- `/dashboard/imports` - Import management
- `/dashboard/reports` - Team performance reports
- `/dashboard/users` - User management (admin only)
- `/dashboard/settings` - System settings (admin only)

---

## 🧪 Testing

```bash
# Backend tests
cd backend
php artisan test

# Run specific test suite
php artisan test --filter LeadPermissionsTest
```

Test coverage includes:
- Authorization policies
- API endpoint validation
- Permission checks
- Import functionality

---

## 📦 Deployment

### Production Deployment

**Backend (Railway)**
- Environment variables configured
- MySQL database provisioned
- Automatic migrations on deploy
- Database seeding for demo data

**Frontend (Vercel)**
- Environment variables set
- Automatic builds on Git push
- Optimized production builds
- CORS configured for API access

### Environment Variables

**Backend (.env)**
```env
APP_URL=https://your-backend.railway.app
DB_CONNECTION=mysql
DB_HOST=...
DB_DATABASE=...
DB_USERNAME=...
DB_PASSWORD=...
SANCTUM_STATEFUL_DOMAINS=your-frontend.vercel.app
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

**Frontend (.env.local)**
```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend.railway.app/api/v1
```

---

## 🎯 Key Achievements

- ✅ **Full-Stack Development**: Built complete application from database to UI
- ✅ **Production Deployment**: Successfully deployed to cloud platforms
- ✅ **RESTful API Design**: Well-structured, versioned API endpoints
- ✅ **Real-Time Analytics**: Interactive charts and performance dashboards
- ✅ **Security Implementation**: Role-based access control and authentication
- ✅ **Data Processing**: CSV/Excel import with validation and error handling
- ✅ **Scalable Architecture**: Service layer, repositories, and policies
- ✅ **Modern UI/UX**: Responsive design with TailwindCSS and shadcn/ui

---

## 📚 Technical Skills Demonstrated

### Backend Development
- Laravel framework (MVC, Eloquent ORM, Migrations)
- RESTful API design and versioning
- Authentication & Authorization (Sanctum, Policies)
- Service layer architecture
- Queue jobs and background processing
- File upload and processing
- Database design and optimization

### Frontend Development
- Next.js App Router and Server Components
- React hooks and state management
- Data visualization with Recharts
- Responsive design with TailwindCSS
- Form handling and validation
- Error handling and user feedback

### DevOps & Tools
- Git version control
- Cloud deployment (Vercel, Railway)
- Environment configuration
- Database migrations
- CI/CD pipelines

---

## 📄 Project Structure

```
├── backend/                 # Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/    # API controllers
│   │   │   ├── Requests/      # Form validation
│   │   │   └── Resources/      # API resources
│   │   ├── Models/             # Eloquent models
│   │   ├── Policies/           # Authorization policies
│   │   ├── Services/           # Business logic
│   │   └── Jobs/               # Queue jobs
│   ├── database/
│   │   ├── migrations/         # Database schema
│   │   └── seeders/            # Demo data
│   └── routes/api.php          # API routes
│
├── frontend/                # Next.js application
│   ├── src/
│   │   ├── app/              # Pages (App Router)
│   │   ├── components/       # React components
│   │   ├── lib/              # Utilities & API client
│   │   └── store/            # State management
│   └── public/               # Static assets
│
└── README.md                 # This file
```

---

## 🔒 Security Considerations

- **Authentication**: Laravel Sanctum token-based auth
- **Authorization**: Policy-based access control
- **Input Validation**: Server-side validation on all inputs
- **SQL Injection**: Protected via Eloquent ORM
- **XSS Protection**: React's automatic escaping
- **CORS**: Configured for specific origins
- **CSRF**: Laravel's built-in CSRF protection

---

## 📝 License

This project is open-sourced software licensed under the MIT license.

---

## 👤 Author

Built as a portfolio project to demonstrate full-stack development capabilities, modern web technologies, and production deployment experience.

**Technologies**: Laravel • Next.js • React • MySQL • TailwindCSS • Vercel • Railway

---

## 📞 Contact & Links

- **GitHub Repository**: [Your GitHub URL]
- **Live Demo**: [Your Vercel URL]
- **API Documentation**: See API section above

---

*Last Updated: November 2025*
