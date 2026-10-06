# Creative Wing Investments — DigitalOcean Droplet Deployment Guide

This guide provides step-by-step instructions to deploy the **Creative Wing Investments** website and Owner Administration system onto a **$4/month DigitalOcean Droplet** (Ubuntu 24.04 or 22.04 LTS).

---

## 1. Production Architecture

```
[ Visitor / Admin Browser ]
            │  HTTPS (Port 443)
            ▼
┌───────────────────────────────────────────────┐
│     DigitalOcean Droplet (Ubuntu Server)      │
│                                               │
│   ┌───────────────────────────────────────┐   │
│   │           Nginx Web Server            │   │
│   │   - Let's Encrypt SSL (Certbot)       │   │
│   │   - Reverse Proxy to Port 5500        │   │
│   │   - 25MB Body Size for Image Uploads  │   │
│   └──────────────────┬────────────────────┘   │
│                      │ HTTP (127.0.0.1:5500)  │
│                      ▼                        │
│   ┌───────────────────────────────────────┐   │
│   │        Node.js (`server.js`)          │   │
│   │   - Managed by systemd (auto-restart) │   │
│   │   - Runtime Env: .env                 │   │
│   │   - In-memory sessions (secure)       │   │
│   └──────────────────┬────────────────────┘   │
│                      ▼                        │
│   ┌───────────────────────────────────────┐   │
│   │      Persistent Disk Storage          │   │
│   │   - data/vehicles.json                │   │
│   │   - data/sportswear.json              │   │
│   │   - data/admin-config.json            │   │
│   │   - images/cars/, images/sportswear/  │   │
│   └───────────────────────────────────────┘   │
└───────────────────────────────────────────────┘
```

---

## 2. Server Prerequisites

* **Droplet Size**: Basic Droplet (1 vCPU, 512MB or 1GB RAM, 10GB–25GB SSD) — $4 to $6/month.
* **Operating System**: Ubuntu 24.04 LTS or 22.04 LTS.
* **Domain Name**: Point your domain DNS records to your Droplet IP:
  * `A` record `@` &rarr; `<YOUR_DROPLET_IP>`
  * `A` record `www` &rarr; `<YOUR_DROPLET_IP>`

---

## 3. Step-by-Step Installation Commands

SSH into your fresh Droplet as `root`:

```bash
ssh root@<YOUR_DROPLET_IP>
```

### Step 3.1: Update System Packages
```bash
sudo apt update && sudo apt upgrade -y
```

### Step 3.2: Install Node.js (v20 LTS), Nginx, Git, and Certbot
```bash
# Add NodeSource official repository for Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install packages
sudo apt install -y nodejs nginx git certbot python3-certbot-nginx

# Verify versions
node -v    # Should show v20.x or higher
npm -v
nginx -v
```

---

## 4. Deploy the Application

### Step 4.1: Clone the GitHub Repository
```bash
sudo git clone https://github.com/Jemade/Creative_Investments- /var/www/creativeinvestments
cd /var/www/creativeinvestments
```

### Step 4.2: Configure Environment Variables
Create the production `.env` file from the provided `.env.example`:

```bash
sudo cp .env.example .env
sudo nano .env
```

Set your production values:
```env
PORT=5500
ADMIN_USERNAME=owner
ADMIN_EMAIL=info@creativewinginvestments.co.zw
ADMIN_PASSWORD=YourStrongSecretPassword123!
```
*(Save and exit nano: press `Ctrl + O`, then `Enter`, then `Ctrl + X`)*

Ensure proper file permissions:
```bash
sudo chmod 600 /var/www/creativeinvestments/.env
sudo chown -R www-data:www-data /var/www/creativeinvestments
```

---

## 5. Keep Server Running with systemd

We use `systemd` to keep the Node.js server running 24/7, restart it automatically if it crashes, and start it automatically when the droplet reboots.

### Step 5.1: Create the systemd Service Unit
```bash
sudo nano /etc/systemd/system/creativeinvestments.service
```

Paste the following configuration:

```ini
[Unit]
Description=Creative Wing Investments Node Server
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/creativeinvestments
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=5
EnvironmentFile=/var/www/creativeinvestments/.env

[Install]
WantedBy=multi-user.target
```

### Step 5.2: Enable and Start the Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable creativeinvestments
sudo systemctl start creativeinvestments
sudo systemctl status creativeinvestments
```

---

## 6. Configure Nginx Reverse Proxy

### Step 6.1: Create Nginx Site Configuration
Replace `yourdomain.co.zw` with your actual registered domain:

```bash
sudo nano /etc/nginx/sites-available/creativeinvestments
```

Paste the following:

```nginx
server {
    listen 80;
    listen [::]80;
    server_name yourdomain.co.zw www.yourdomain.co.zw;

    # Allow up to 25MB for high-resolution vehicle and sportswear uploads
    client_max_body_size 25M;

    location / {
        proxy_pass http://127.0.0.1:5500;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Step 6.2: Enable Site and Reload Nginx
```bash
sudo ln -sf /etc/nginx/sites-available/creativeinvestments /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7. Secure with Free HTTPS (Let's Encrypt SSL)

Run Certbot to obtain and configure an SSL certificate:

```bash
sudo certbot --nginx -d yourdomain.co.zw -d www.yourdomain.co.zw
```

* Enter your email address.
* Agree to the terms.
* Certbot will automatically adjust your Nginx config to force HTTPS and renew certificates automatically.

---

## 8. Updating Code in the Future

When you push new changes to GitHub:

```bash
cd /var/www/creativeinvestments

# Discard any local file permission changes if necessary, then pull
sudo git pull origin main

# Restart the application
sudo systemctl restart creativeinvestments
```

Your persistent files (`data/vehicles.json`, `data/sportswear.json`, uploaded `images/`) remain untouched across pulls and restarts.

---

## 9. Data Persistence & Backups

The application stores data directly on disk in two locations:

1. **`data/`**:
   - `vehicles.json` (Vehicle fleet catalogue)
   - `sportswear.json` (Sportswear kit catalogue)
   - `admin-config.json` (Business configuration)
2. **`images/`**:
   - `images/cars/`
   - `images/sportswear/`

### Creating a Quick Backup
To create a timestamped backup archive of your dynamic data:

```bash
sudo tar -czf /var/backups/creative_data_$(date +%F).tar.gz /var/www/creativeinvestments/data /var/www/creativeinvestments/images
```

To automate daily backups at 3:00 AM via cron:
```bash
(crontab -l 2>/dev/null; echo "0 3 * * * tar -czf /var/backups/cwi_\$(date +\%F).tar.gz /var/www/creativeinvestments/data /var/www/creativeinvestments/images") | crontab -
```
