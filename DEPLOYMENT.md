# DigitalOcean deployment

## Recommended low-cost deployment: Droplet

This application requires Node.js because the admin portal uses the REST API in `server.js` for authentication, inventory management, settings and image uploads. A static-only host is not sufficient.

### Environment variables

Create these on the server. Do not commit the real password:

- `PORT=5500`
- `ADMIN_USERNAME=owner`
- `ADMIN_EMAIL=info@creativewinginvestments.co.zw`
- `ADMIN_PASSWORD=<long-random-password>`

### Start

```bash
npm start
```

For production, run the Node process under systemd or another process supervisor and put Nginx in front of it. Configure HTTPS with Let's Encrypt/Certbot.

### Persistence

The current application stores inventory JSON and uploaded images on the server filesystem. This is suitable for a single Droplet because its local disk persists across normal application restarts. Back up the `data/` directory and uploaded `images/` regularly.

Do not deploy this filesystem-backed version to an ephemeral application container unless inventory and uploads are migrated to persistent database/object storage first.
