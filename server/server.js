const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 1234;

// Base directory for storing data
const BASE_DIR = 'D:\\Lovable apps\\Debt tool\\debt-wizard-navigator';

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ensure directory exists
async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// Load data from file
app.get('/api/load-data/:dashboard', async (req, res) => {
  try {
    const { dashboard } = req.params;
    await ensureDirectoryExists(BASE_DIR);
    
    const filePath = path.join(BASE_DIR, `${dashboard}-data.json`);
    
    try {
      const data = await fs.readFile(filePath, 'utf8');
      res.json(JSON.parse(data));
    } catch (error) {
      // File doesn't exist, return empty data
      res.json({});
    }
  } catch (error) {
    console.error('Error loading data:', error);
    res.status(500).json({ error: 'Failed to load data' });
  }
});

// Save data to file
app.post('/api/save-data/:dashboard', async (req, res) => {
  try {
    const { dashboard } = req.params;
    const data = req.body;
    
    await ensureDirectoryExists(BASE_DIR);
    
    const filePath = path.join(BASE_DIR, `${dashboard}-data.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Data will be stored in: ${BASE_DIR}`);
});
