# Creative Wing Investments

Official commercial platform and inventory administration application for **Creative Wing Investments** (Harare, Zimbabwe).

- **Public Website**: High-performance, mobile-responsive commercial presentation covering Vehicles Fleet, Sportswear & Team Kits, and Core Business Divisions.
- **Admin Operations OS**: Protected inventory management portal for creating, updating, and removing vehicles and sportswear, managing image uploads, and updating commercial settings.
- **Backend Architecture**: Native Node.js HTTP server and REST API with zero external dependencies.

## Local Development

```bash
# Start the server (runs on port 5500 by default)
npm start

# Or test server syntax
npm run check
```

Visit:
- Public Website: `http://localhost:5500/`
- Admin Portal: `http://localhost:5500/admin.html`

## Production Deployment

Refer to [`DEPLOYMENT.md`](DEPLOYMENT.md) for step-by-step instructions on deploying to an Ubuntu DigitalOcean Droplet with Nginx reverse proxy, systemd process management, and Let's Encrypt SSL.
