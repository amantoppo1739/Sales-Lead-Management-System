# Deployment Checklist for Lead Management System (CRM)

## ✅ Pre-Deployment Verification

### Backend (Laravel)
- [x] All API endpoints implemented and tested
- [x] Authentication & authorization working (Sanctum)
- [x] Database migrations complete
- [x] Seeders working (creates demo data)
- [x] CORS configured for frontend domain
- [x] Error handling in place
- [x] No syntax errors (linting passed)

### Frontend (Next.js)
- [x] All pages implemented
- [x] API client configured
- [x] Authentication flow working
- [x] Error handling in place
- [x] No syntax errors (linting passed)
- [x] Environment variables documented

## 🔧 Environment Configuration

### Backend `.env` Required Variables:
```env
APP_NAME="Lead Management System"
APP_ENV=production
APP_KEY=(generate with: php artisan key:generate)
APP_DEBUG=false
APP_URL=https://your-api-domain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

SANCTUM_STATEFUL_DOMAINS=your-frontend-domain.com,www.your-frontend-domain.com
SESSION_DRIVER=database
SESSION_DOMAIN=.your-domain.com
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=lax

CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

### Frontend `.env.local` Required Variables:
```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api/v1
NEXT_PUBLIC_PUSHER_APP_KEY=your_pusher_key
NEXT_PUBLIC_PUSHER_HOST=your_pusher_host
NEXT_PUBLIC_PUSHER_PORT=443
NEXT_PUBLIC_PUSHER_TLS=true
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster
```

## 📋 Deployment Steps

### Backend Deployment (Laravel)
1. **Server Setup**
   - PHP 8.2+ with required extensions
   - Composer installed
   - MySQL/PostgreSQL database
   - Redis (for cache/queues)
   - Web server (Nginx/Apache)

2. **Application Setup**
   ```bash
   cd backend
   composer install --optimize-autoloader --no-dev
   cp .env.example .env
   php artisan key:generate
   php artisan migrate --force
   php artisan db:seed
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

3. **Permissions**
   ```bash
   chmod -R 775 storage bootstrap/cache
   chown -R www-data:www-data storage bootstrap/cache
   ```

4. **Queue Worker** (if using queues)
   ```bash
   php artisan queue:work --daemon
   # Or use supervisor/systemd
   ```

### Frontend Deployment (Next.js)
1. **Build**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Deploy Options**
   - **Vercel** (recommended): Connect GitHub repo, set env vars, deploy
   - **Netlify**: Similar to Vercel
   - **Self-hosted**: Use `npm start` with PM2 or similar

3. **Environment Variables**
   - Set all `NEXT_PUBLIC_*` variables in deployment platform
   - Ensure API URL points to production backend

## 🔒 Security Checklist

- [ ] `APP_DEBUG=false` in production
- [ ] Strong database passwords
- [ ] HTTPS enabled (SSL certificates)
- [ ] CORS configured for production domains only
- [ ] Sanctum stateful domains set correctly
- [ ] Session secure cookies enabled
- [ ] API rate limiting configured (if needed)
- [ ] File upload size limits set
- [ ] Environment variables not committed to git

## 🧪 Post-Deployment Testing

### Functional Tests
- [ ] Login/logout works
- [ ] Dashboard loads with data
- [ ] Leads CRUD operations
- [ ] Team Performance reports load
- [ ] User management (admin only)
- [ ] Settings page (admin only)
- [ ] Import/Export functionality
- [ ] Date range filters work

### Performance Tests
- [ ] Page load times < 3 seconds
- [ ] API response times < 500ms
- [ ] Database queries optimized
- [ ] Images/assets optimized

### Security Tests
- [ ] Unauthorized access blocked
- [ ] CSRF protection working
- [ ] XSS protection working
- [ ] SQL injection protection (using Eloquent)

## 📝 Known Issues & Notes

### Current Implementation Status
- ✅ All core features implemented
- ✅ Team Performance metrics working
- ✅ Role-based access control
- ✅ Error handling in place
- ✅ Responsive UI

### Potential Improvements (Future)
- Add API rate limiting
- Add request validation middleware
- Add comprehensive test suite
- Add monitoring/logging (Sentry, etc.)
- Add backup automation
- Add CI/CD pipeline

## 🚀 Quick Start Commands

### Local Development
```bash
# Backend
cd backend
composer install
php artisan migrate:fresh --seed
php artisan serve

# Frontend
cd frontend
npm install
npm run dev
```

### Production Build
```bash
# Backend
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache

# Frontend
npm install
npm run build
npm start
```

## 📞 Support

For deployment issues, check:
1. Laravel logs: `storage/logs/laravel.log`
2. Next.js build logs
3. Browser console for frontend errors
4. Network tab for API errors

## ✅ Final Checklist Before Going Live

- [ ] All environment variables set
- [ ] Database migrated and seeded
- [ ] SSL certificates installed
- [ ] CORS configured correctly
- [ ] Error pages customized (optional)
- [ ] Analytics tracking added (optional)
- [ ] Backup strategy in place
- [ ] Monitoring set up (optional)
- [ ] Documentation updated
- [ ] Demo credentials documented (see DEMO_USERS.md)

