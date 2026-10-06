# Creative Wing Investments

Official Creative Wing Investments website and owner inventory administration portal.

## Production stack

- HTML, CSS and vanilla JavaScript frontend
- PHP 8+ REST API
- MySQL / MariaDB persistence
- Apache/LiteSpeed rewrite rules via .htaccess
- Local image uploads under images/cars/ and images/sportswear/

This production branch is designed for low-cost cPanel shared hosting such as WebZim. It does not require Node.js, npm, a VPS, Nginx, Docker or a long-running application process.

## API compatibility

The frontend keeps the existing /api/auth/*, /api/inventory/*, /api/upload and /api/settings routes.

## Configuration

Copy config.example.php to config.local.php and set database credentials and an admin password hash. Never commit config.local.php.

Generate a password hash:

    php -r "echo password_hash('YOUR_STRONG_PASSWORD', PASSWORD_DEFAULT), PHP_EOL;"

Create the tables and import the existing JSON catalogue:

    php scripts/import-json.php

See DEPLOYMENT.md for the complete WebZim/cPanel procedure.
