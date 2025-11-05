const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

// Load environment variables from .env file if present
try {
  require('dotenv').config();
} catch (e) {
  console.log('dotenv not installed, skipping .env load');
}

// Simple JSON file storage (no native dependencies)
const DB_FILE = path.join(__dirname, 'data.json');

// Basic authentication middleware
function basicAuth(req, res, next) {
  // Skip auth if credentials aren't configured
  if (!process.env.AUTH_USERNAME || !process.env.AUTH_PASSWORD) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic');
    return res.status(401).json({ error: 'Authentication required' });
  }

  const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
  const username = auth[0];
  const password = auth[1];

  if (username === process.env.AUTH_USERNAME && password === process.env.AUTH_PASSWORD) {
    next();
  } else {
    res.setHeader('WWW-Authenticate', 'Basic');
    res.status(401).json({ error: 'Invalid credentials' });
  }
}

function readDB() {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeDB(rows) {
  fs.writeFileSync(DB_FILE, JSON.stringify(rows, null, 2), 'utf8');
}

const app = express();

// Configure CORS with environment variables
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*'
};
app.use(cors(corsOptions));
app.use(express.json());

// ensure data.json exists
if (!fs.existsSync(DB_FILE)) writeDB([]);

const ALLOWED = ['HOME', 'JPMC OFFICE', 'DELOITTE OFFICE'];

app.post('/api/location', basicAuth, (req, res) => {
  const { location } = req.body || {};
  if (!location || !ALLOWED.includes(location)) {
    return res.status(400).json({ error: 'Invalid location' });
  }
  const created_at = new Date().toISOString();
  const rows = readDB();
  const id = (rows.length ? rows[rows.length-1].id : 0) + 1;
  const row = { id, location, created_at };
  rows.push(row);
  writeDB(rows);
  res.json(row);
});

app.get('/api/locations', basicAuth, (req, res) => {
  const rows = readDB().slice().reverse();
  res.json(rows);
});

// Delete a location record
app.delete('/api/location/:id', (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }
  const rows = readDB();
  const index = rows.findIndex(r => r.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Record not found' });
  }
  rows.splice(index, 1);
  writeDB(rows);
  res.json({ success: true });
});

// Edit a location record
app.put('/api/location/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { location } = req.body || {};
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }
  if (!location || !ALLOWED.includes(location)) {
    return res.status(400).json({ error: 'Invalid location' });
  }
  const rows = readDB();
  const record = rows.find(r => r.id === id);
  if (!record) {
    return res.status(404).json({ error: 'Record not found' });
  }
  record.location = location;
  writeDB(rows);
  res.json(record);
});

app.get('/api/export', basicAuth, (req, res) => {
  const rows = readDB();
  const header = 'id,location,date\n';
  const csv = rows.map(r => {
    const date = new Date(r.created_at).toISOString().split('T')[0];
    return `${r.id},"${r.location.replace(/"/g, '""')}",${date}`;
  }).join('\n');
  const out = header + csv;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="locations.csv"');
  res.send(out);
});

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
