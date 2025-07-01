
const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const PORT = 3001;

// Base directory for storing data
const BASE_DIR = 'D:\\Lovable apps\\Debt tool\\debt-wizard-navigator';
const DEBT_TOOL_FILE = path.join(BASE_DIR, 'debt-data.json');
const ATTENDIFY_FILE = path.join(BASE_DIR, 'attendify-data.json');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure base directory exists
fs.ensureDirSync(BASE_DIR);

// Helper function to read data from file
async function readDataFromFile(filePath, defaultData = {}) {
  try {
    if (await fs.pathExists(filePath)) {
      const data = await fs.readJson(filePath);
      return data;
    }
    return defaultData;
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return defaultData;
  }
}

// Helper function to write data to file
async function writeDataToFile(filePath, data) {
  try {
    await fs.writeJson(filePath, data, { spaces: 2 });
    return true;
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    return false;
  }
}

// Debt Tool API Routes
app.get('/api/debt-tool/load', async (req, res) => {
  try {
    const data = await readDataFromFile(DEBT_TOOL_FILE);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/debt-tool/save', async (req, res) => {
  try {
    const success = await writeDataToFile(DEBT_TOOL_FILE, req.body);
    if (success) {
      res.json({ success: true, message: 'Debt tool data saved successfully' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to save data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Attendify API Routes
app.get('/api/attendify/load', async (req, res) => {
  try {
    const defaultData = {
      events: [],
      attendees: [],
      settings: {},
      analytics: {}
    };
    const data = await readDataFromFile(ATTENDIFY_FILE, defaultData);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/attendify/save', async (req, res) => {
  try {
    const success = await writeDataToFile(ATTENDIFY_FILE, req.body);
    if (success) {
      res.json({ success: true, message: 'Attendify data saved successfully' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to save data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    dataDirectory: BASE_DIR,
    files: {
      debtTool: DEBT_TOOL_FILE,
      attendify: ATTENDIFY_FILE
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Data directory: ${BASE_DIR}`);
  console.log(`💾 Debt tool data: ${DEBT_TOOL_FILE}`);
  console.log(`📅 Attendify data: ${ATTENDIFY_FILE}`);
});
