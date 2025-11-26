# Deployment Fixes for Backend

## Issues Fixed

### 1. PHP Version Compatibility ✅
- **Problem**: `maennchen/zipstream-php 3.2.0` required PHP 8.3, but deployment had PHP 8.2.29
- **Solution**: Downgraded to `zipstream-php 3.1.2` which is compatible with PHP 8.2
- **Status**: Fixed in `composer.lock`

### 2. Missing GD Extension ⚠️
- **Problem**: `phpoffice/phpspreadsheet` requires `ext-gd` for image processing
- **Solution**: Added `--ignore-platform-req=ext-gd` to build commands
- **Note**: Excel import/export will work, but image features may be limited

## Platform-Specific Instructions

### Railway

1. **Build Command:**
   ```
   composer install --optimize-autoloader --no-dev --ignore-platform-req=ext-gd
   ```

2. **To Enable GD Extension (Optional):**
   - Railway uses Nixpacks by default
   - Create `nixpacks.toml` in backend root:
   ```toml
   [phases.setup]
   nixPkgs = ["php82", "php82Extensions.gd"]
   ```

3. **Or use Railway.json** (already created):
   - Railway will automatically use the build command with `--ignore-platform-req=ext-gd`

### Render

1. **Build Command:**
   ```
   composer install --optimize-autoloader --no-dev --ignore-platform-req=ext-gd
   ```

2. **To Enable GD Extension:**
   - Render's PHP environment should have GD by default
   - If not, contact Render support or use the ignore flag

### Fly.io

1. **Create `Dockerfile` in backend root:**
   ```dockerfile
   FROM php:8.2-fpm
   
   RUN apt-get update && apt-get install -y \
       libpng-dev \
       libjpeg-dev \
       libfreetype6-dev \
       && docker-php-ext-configure gd --with-freetype --with-jpeg \
       && docker-php-ext-install gd
   
   # Rest of your Dockerfile...
   ```

2. **Or use build command with ignore flag**

## Current Configuration

### composer.json
- PHP requirement: `^8.2|^8.3` (flexible)
- Platform config added to ignore GD extension check during install

### Build Commands
All deployment configs now include `--ignore-platform-req=ext-gd` flag.

## Testing

After deployment, test Excel import/export:
- If GD is missing: Basic Excel features work, but image processing won't
- If GD is enabled: Full Excel functionality including images

## Alternative: Remove Excel Dependency

If you don't need Excel import/export, you can remove it:
```bash
composer remove maatwebsite/excel
```

This will eliminate both the PHP version and GD extension requirements.

## Status

✅ **Ready for deployment** - Build should succeed with current configuration.

