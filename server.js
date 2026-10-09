/**
 * Creative Wing Investments — Production Server & Inventory REST API
 * Handles:
 * - Static file serving with MIME routing and security sandboxing
 * - Owner Authentication & In-Memory Session management via Environment Variables
 * - Protected Vehicles CRUD (/api/inventory/vehicles)
 * - Protected Sportswear CRUD (/api/inventory/sportswear)
 * - Protected Image Upload handling (/api/upload)
 * - Operational settings & live catalog synchronization (/api/settings)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, 'data');

// Native .env file loader (no external dependencies required)
const envPath = path.join(ROOT_DIR, '.env');
if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const match = trimmed.match(/^([\w.-]+)\s*=\s*(.*)?$/);
      if (match) {
        const key = match[1];
        let val = (match[2] || '').trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (process.env[key] === undefined) {
          process.env[key] = val;
        }
      }
    });
  } catch (err) {
    console.warn('Could not parse .env file:', err.message);
  }
}

const PORT = parseInt(process.env.PORT, 10) || 5500;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'owner';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'info@creativewinginvestments.co.zw';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

if (!ADMIN_PASSWORD) {
  console.warn('WARNING: ADMIN_PASSWORD environment variable is not configured.');
  console.warn('Admin portal login will remain locked until ADMIN_PASSWORD is set.');
}

// In-memory session store (tokens are kept in RAM only, never written to disk)
const sessions = new Map();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// JSON file persistence helpers
function readJson(filename, fallback = []) {
  const p = path.join(DATA_DIR, filename);
  try {
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    }
  } catch (e) {
    console.error(`Error reading ${filename}:`, e.message);
  }
  return fallback;
}

function writeJson(filename, data) {
  const p = path.join(DATA_DIR, filename);
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
}

// Reject malformed and oversized JSON without destroying the connection.
function parseBody(req) {
  const MAX_BODY_BYTES = 25 * 1024 * 1024;
  return new Promise((resolve, reject) => {
    const chunks = [];
    let received = 0;
    let failed = false;
    req.on('data', chunk => {
      if (failed) return;
      received += chunk.length;
      if (received > MAX_BODY_BYTES) {
        failed = true;
        const error = new Error('Payload too large');
        error.statusCode = 413;
        reject(error);
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      if (failed) return;
      if (!received) return resolve({});
      try {
        const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (parsed === null || Array.isArray(parsed) || typeof parsed !== 'object') {
          const error = new Error('Expected a JSON object');
          error.statusCode = 400;
          return reject(error);
        }
        resolve(parsed);
      } catch (error) {
        if (error.statusCode) return reject(error);
        const invalid = new Error('Malformed JSON body');
        invalid.statusCode = 400;
        reject(invalid);
      }
    });
    req.on('error', reject);
  });
}

// Authentication middleware
function authenticate(req) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  const session = sessions.get(token);
  if (session && session.expires > Date.now()) {
    return { token, ...session };
  }
  if (session) {
    sessions.delete(token);
  }
  return null;
}

// JSON Response helper with security headers
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  });
  res.end(JSON.stringify(data));
}

// Server router
const server = http.createServer(async (req, res) => {
  try {
    // CORS Preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      });
      res.end();
      return;
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);
    let pathname = parsedUrl.pathname;

    // Normalize /creative-wing prefix if present
    if (pathname.startsWith('/creative-wing')) {
      pathname = pathname.replace(/^\/creative-wing/, '') || '/';
    }

    // ==========================================
    // API ROUTES
    // ==========================================

    // --- AUTHENTICATION ---
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const { username, password } = await parseBody(req);

      if (!ADMIN_PASSWORD || !password) {
        return sendJson(res, 401, { error: 'Invalid credentials or ADMIN_PASSWORD not configured' });
      }

      const normalizedUser = (username || '').trim().toLowerCase();
      const isValidUser =
        normalizedUser === ADMIN_USERNAME.toLowerCase() ||
        (ADMIN_EMAIL && normalizedUser === ADMIN_EMAIL.toLowerCase());

      const supplied = Buffer.from(String(password));
      const expected = Buffer.from(String(ADMIN_PASSWORD));
      const isValidPassword =
        supplied.length === expected.length &&
        crypto.timingSafeEqual(supplied, expected);

      if (isValidUser && isValidPassword) {
        const token = crypto.randomBytes(32).toString('hex');
        const session = {
          username: ADMIN_USERNAME,
          role: 'OWNER',
          displayName: 'Owner Administration',
          expires: Date.now() + 8 * 3600 * 1000 // 8 hours
        };
        sessions.set(token, session);

        return sendJson(res, 200, {
          success: true,
          token: token,
          user: {
            username: session.username,
            displayName: session.displayName,
            role: session.role
          }
        });
      }

      return sendJson(res, 401, { error: 'Invalid username or password' });
    }

    if (pathname === '/api/auth/verify' && req.method === 'GET') {
      const user = authenticate(req);
      if (user) {
        return sendJson(res, 200, { authenticated: true, user });
      }
      return sendJson(res, 401, { authenticated: false, error: 'Unauthorized' });
    }

    if (pathname === '/api/auth/logout' && req.method === 'POST') {
      const user = authenticate(req);
      if (user) {
        sessions.delete(user.token);
      }
      return sendJson(res, 200, { success: true });
    }

    // --- VEHICLES CRUD ---
    if ((pathname === '/api/inventory/vehicles' || pathname === '/api/vehicles') && req.method === 'GET') {
      const vehicles = readJson('vehicles.json', []);
      return sendJson(res, 200, vehicles);
    }

    if (pathname === '/api/inventory/vehicles' && req.method === 'POST') {
      const user = authenticate(req);
      if (!user) return sendJson(res, 401, { error: 'Unauthorized owner action required' });

      const data = await parseBody(req);
      if (!data.name || data.price === undefined) {
        return sendJson(res, 400, { error: 'Vehicle name and price are required' });
      }

      const vehicles = readJson('vehicles.json', []);
      const newId = 'C' + String(Date.now()).slice(-8);
      const now = new Date().toISOString();

      const newVehicle = {
        id: newId,
        name: data.name,
        price: Number(data.price) || 0,
        currency: 'USD',
        year: Number(data.year) || new Date().getFullYear(),
        category: data.category || 'SUV',
        body: data.category || 'SUV',
        mileage: data.mileage || '0 km',
        transmission: data.transmission || 'Automatic',
        fuel: data.fuel || 'Petrol',
        drivetrain: data.drivetrain || '2WD',
        color: data.color || 'Standard',
        inStock: data.status !== 'Sold',
        status: data.status || 'Available',
        image: data.image || (data.gallery && data.gallery[0]) || 'images/cars/01.jpeg',
        gallery: data.gallery && data.gallery.length ? data.gallery : [data.image || 'images/cars/01.jpeg'],
        description: data.description || '',
        features: Array.isArray(data.features) ? data.features : [],
        createdAt: now,
        updatedAt: now
      };

      vehicles.unshift(newVehicle);
      writeJson('vehicles.json', vehicles);

      return sendJson(res, 201, { success: true, vehicle: newVehicle });
    }

    if (pathname.startsWith('/api/inventory/vehicles/') && req.method === 'PUT') {
      const user = authenticate(req);
      if (!user) return sendJson(res, 401, { error: 'Unauthorized owner action required' });

      const id = pathname.split('/').pop();
      const data = await parseBody(req);
      const vehicles = readJson('vehicles.json', []);
      const index = vehicles.findIndex(v => v.id === id);

      if (index === -1) {
        return sendJson(res, 404, { error: 'Vehicle not found' });
      }

      const now = new Date().toISOString();
      const current = vehicles[index];

      vehicles[index] = {
        ...current,
        name: data.name !== undefined ? data.name : current.name,
        price: data.price !== undefined ? Number(data.price) : current.price,
        year: data.year !== undefined ? Number(data.year) : current.year,
        category: data.category || current.category,
        body: data.category || current.body,
        mileage: data.mileage !== undefined ? data.mileage : current.mileage,
        transmission: data.transmission !== undefined ? data.transmission : current.transmission,
        fuel: data.fuel !== undefined ? data.fuel : current.fuel,
        drivetrain: data.drivetrain !== undefined ? data.drivetrain : current.drivetrain,
        color: data.color !== undefined ? data.color : current.color,
        status: data.status !== undefined ? data.status : current.status,
        inStock: (data.status !== undefined ? data.status : current.status) !== 'Sold',
        image: data.image || current.image,
        gallery: Array.isArray(data.gallery) && data.gallery.length ? data.gallery : current.gallery,
        description: data.description !== undefined ? data.description : current.description,
        features: Array.isArray(data.features) ? data.features : current.features,
        updatedAt: now
      };

      writeJson('vehicles.json', vehicles);
      return sendJson(res, 200, { success: true, vehicle: vehicles[index] });
    }

    if (pathname.startsWith('/api/inventory/vehicles/') && req.method === 'DELETE') {
      const user = authenticate(req);
      if (!user) return sendJson(res, 401, { error: 'Unauthorized owner action required' });

      const id = pathname.split('/').pop();
      let vehicles = readJson('vehicles.json', []);
      const initialLen = vehicles.length;
      vehicles = vehicles.filter(v => v.id !== id);

      if (vehicles.length === initialLen) {
        return sendJson(res, 404, { error: 'Vehicle not found' });
      }

      writeJson('vehicles.json', vehicles);
      return sendJson(res, 200, { success: true, deletedId: id });
    }

    // --- SPORTSWEAR CRUD ---
    if ((pathname === '/api/inventory/sportswear' || pathname === '/api/sportswear') && req.method === 'GET') {
      const sportswear = readJson('sportswear.json', []);
      return sendJson(res, 200, sportswear);
    }

    if (pathname === '/api/inventory/sportswear' && req.method === 'POST') {
      const user = authenticate(req);
      if (!user) return sendJson(res, 401, { error: 'Unauthorized owner action required' });

      const data = await parseBody(req);
      if (!data.name || data.price === undefined) {
        return sendJson(res, 400, { error: 'Sportswear product name and price are required' });
      }

      const sportswear = readJson('sportswear.json', []);
      const newId = 'S' + String(Date.now()).slice(-8);
      const now = new Date().toISOString();

      const newProduct = {
        id: newId,
        name: data.name,
        price: Number(data.price) || 0,
        currency: 'USD',
        pricingUnit: data.pricingUnit || 'Per Full Set',
        category: data.category || 'Match Set',
        colorway: data.colorway || 'Custom',
        material: data.material || '100% micro-polyester',
        sizes: Array.isArray(data.sizes) && data.sizes.length ? data.sizes : ['S', 'M', 'L', 'XL', 'XXL'],
        customizationOptions: Array.isArray(data.customizationOptions) ? data.customizationOptions : ['Custom Name & Number Printing'],
        status: data.status || 'Available',
        inStock: data.status !== 'Unavailable',
        image: data.image || (data.gallery && data.gallery[0]) || 'images/sportswear/01.jpeg',
        gallery: data.gallery && data.gallery.length ? data.gallery : [data.image || 'images/sportswear/01.jpeg'],
        description: data.description || '',
        createdAt: now,
        updatedAt: now
      };

      sportswear.unshift(newProduct);
      writeJson('sportswear.json', sportswear);

      return sendJson(res, 201, { success: true, product: newProduct });
    }

    if (pathname.startsWith('/api/inventory/sportswear/') && req.method === 'PUT') {
      const user = authenticate(req);
      if (!user) return sendJson(res, 401, { error: 'Unauthorized owner action required' });

      const id = pathname.split('/').pop();
      const data = await parseBody(req);
      const sportswear = readJson('sportswear.json', []);
      const index = sportswear.findIndex(s => s.id === id);

      if (index === -1) {
        return sendJson(res, 404, { error: 'Sportswear product not found' });
      }

      const now = new Date().toISOString();
      const current = sportswear[index];

      sportswear[index] = {
        ...current,
        name: data.name !== undefined ? data.name : current.name,
        price: data.price !== undefined ? Number(data.price) : current.price,
        pricingUnit: data.pricingUnit !== undefined ? data.pricingUnit : current.pricingUnit,
        category: data.category || current.category,
        colorway: data.colorway !== undefined ? data.colorway : current.colorway,
        material: data.material !== undefined ? data.material : current.material,
        sizes: Array.isArray(data.sizes) ? data.sizes : current.sizes,
        customizationOptions: Array.isArray(data.customizationOptions) ? data.customizationOptions : current.customizationOptions,
        status: data.status !== undefined ? data.status : current.status,
        inStock: (data.status !== undefined ? data.status : current.status) !== 'Unavailable',
        image: data.image || current.image,
        gallery: Array.isArray(data.gallery) && data.gallery.length ? data.gallery : current.gallery,
        description: data.description !== undefined ? data.description : current.description,
        updatedAt: now
      };

      writeJson('sportswear.json', sportswear);
      return sendJson(res, 200, { success: true, product: sportswear[index] });
    }

    if (pathname.startsWith('/api/inventory/sportswear/') && req.method === 'DELETE') {
      const user = authenticate(req);
      if (!user) return sendJson(res, 401, { error: 'Unauthorized owner action required' });

      const id = pathname.split('/').pop();
      let sportswear = readJson('sportswear.json', []);
      const initialLen = sportswear.length;
      sportswear = sportswear.filter(s => s.id !== id);

      if (sportswear.length === initialLen) {
        return sendJson(res, 404, { error: 'Sportswear product not found' });
      }

      writeJson('sportswear.json', sportswear);
      return sendJson(res, 200, { success: true, deletedId: id });
    }

    // --- IMAGE UPLOAD ---
    if (pathname === '/api/upload' && req.method === 'POST') {
      const user = authenticate(req);
      if (!user) return sendJson(res, 401, { error: 'Unauthorized owner action required' });

      const { dataUrl, folder = 'cars', filename } = await parseBody(req);
      if (!dataUrl || !dataUrl.includes('base64,')) {
        return sendJson(res, 400, { error: 'Valid Base64 image dataUrl required' });
      }

      const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return sendJson(res, 400, { error: 'Invalid dataUrl structure' });
      }

      const ext = matches[1].includes('png') ? '.png' : matches[1].includes('webp') ? '.webp' : '.jpeg';
      const cleanFolder = folder === 'sportswear' ? 'sportswear' : 'cars';
      const safeName = (filename ? filename.replace(/[^a-zA-Z0-9_-]/g, '') : `upload_${Date.now()}`) + ext;
      const targetDir = path.join(ROOT_DIR, 'images', cleanFolder);

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const buffer = Buffer.from(matches[2], 'base64');
      if (buffer.length > 10 * 1024 * 1024) {
        return sendJson(res, 413, { error: 'Image too large (max 10MB)' });
      }

      const targetFile = path.join(targetDir, safeName);
      fs.writeFileSync(targetFile, buffer);

      const publicUrl = `images/${cleanFolder}/${safeName}`;
      return sendJson(res, 200, { success: true, url: publicUrl });
    }

    // --- SETTINGS ---
    if (pathname === '/api/settings' && req.method === 'GET') {
      const config = readJson('admin-config.json', {});
      return sendJson(res, 200, config.settings || {});
    }

    if (pathname === '/api/settings' && req.method === 'PUT') {
      const user = authenticate(req);
      if (!user) return sendJson(res, 401, { error: 'Unauthorized owner action required' });

      const newSettings = await parseBody(req);
      const config = readJson('admin-config.json', {});
      config.settings = { ...config.settings, ...newSettings };
      writeJson('admin-config.json', config);
      return sendJson(res, 200, { success: true, settings: config.settings });
    }

    // ==========================================
    // STATIC FILE SERVING
    // ==========================================
    if (pathname === '/' || pathname === '') {
      pathname = '/index.html';
    }

    const decoded = decodeURIComponent(pathname);
    let filePath = path.resolve(ROOT_DIR, '.' + decoded);

    // Security barrier against path traversal
    if (!filePath.startsWith(ROOT_DIR + path.sep) && filePath !== ROOT_DIR) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Forbidden');
    }

    fs.stat(filePath, (err, stats) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('File not found: ' + pathname);
      }

      if (stats.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      });

      const stream = fs.createReadStream(filePath);
      stream.on('error', () => {
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        }
        res.end('Server error');
      });
      stream.pipe(res);
    });
  } catch (err) {
    console.error('Unhandled server error:', err);
    if (!res.headersSent) {
      sendJson(res, err.statusCode === 400 || err.statusCode === 413 ? err.statusCode : 500, { error: err.statusCode === 400 || err.statusCode === 413 ? err.message : 'Internal server error' });
    } else {
      res.end();
    }
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Creative Wing Production Server running on port ${PORT}`);
  console.log(`Local Access: http://127.0.0.1:${PORT}/`);
  console.log(`Admin Portal: http://127.0.0.1:${PORT}/admin.html`);
});
