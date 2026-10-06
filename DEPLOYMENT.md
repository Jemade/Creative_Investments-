# WebZim / cPanel Deployment

This version is built for inexpensive shared hosting using PHP and MySQL.

## 1. Hosting

The WebZim Bronze plan is sufficient for the current site footprint. Connect the Creative Wing domain to the hosting account and wait for DNS to resolve.

## 2. Select PHP

In cPanel, open Select PHP Version and use a supported PHP 8.x release. Ensure PDO, pdo_mysql, json and fileinfo are enabled.

## 3. Create MySQL database

In cPanel open MySQL Databases. Create a database and user, add the user to the database with ALL PRIVILEGES, and record the full cPanel-prefixed database/user names.

## 4. Upload the site

Upload the repository contents into the domain document root, normally public_html/. The included .htaccess routes /api requests to api/index.php while static pages and images are served normally.

## 5. Configure secrets

Copy config.example.php to config.local.php and enter the database details.

Generate the admin password hash in cPanel Terminal/SSH:

    php -r "echo password_hash('PUT-A-NEW-STRONG-PASSWORD-HERE', PASSWORD_DEFAULT), PHP_EOL;"

Paste only the resulting hash into password_hash. Do not store the plain password.

Recommended permissions:

    chmod 600 config.local.php
    chmod 755 images images/cars images/sportswear

If PHP cannot write uploaded images, use the least-permissive setting supported by the account, commonly 775. Avoid 777.

## 6. Import the existing catalogue

From cPanel Terminal/SSH in the site root:

    php scripts/import-json.php

This creates the tables and imports data/vehicles.json, data/sportswear.json and business settings. The importer can be rerun for the seeded IDs.

## 7. SSL

Use cPanel SSL/AutoSSL. Confirm the public website and /admin.html load over HTTPS before using admin credentials.

## 8. Verification

Check all public pages, both inventory API endpoints, failed and successful admin login, vehicle CRUD, sportswear CRUD, image upload, logout, and that public catalogues reflect database changes.

## 9. Backups

Back up the MySQL database plus images/cars/ and images/sportswear/. The JSON files become migration seeds after conversion; live catalogue changes are stored in MySQL.

WebZim provides disaster-recovery backups, but its terms state that the customer remains responsible for maintaining a current functional backup.

## 10. Updates

Before updates, back up the database and uploaded images. Never overwrite config.local.php. If Git is available in cPanel Terminal, use git pull origin main; otherwise upload changed application files using cPanel File Manager.

## Security

- config.local.php is ignored by Git and blocked from web access.
- Passwords use PHP password hashing.
- Session tokens are random and only SHA-256 token hashes are stored in MySQL.
- Database operations use PDO prepared statements.
- Admin writes fail when server persistence fails instead of pretending a browser-only write succeeded.
- Uploaded images are MIME-checked before writing.
