
# Local Server Setup for Debt Tool & Attendify

## Prerequisites
- Node.js installed on your system
- VS Code (optional but recommended)

## Installation Steps

1. **Navigate to the server directory**:
   ```bash
   cd server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

## How to Run Both Dashboards in VS Code

### Method 1: Using VS Code Terminal
1. Open VS Code
2. Open the project root folder
3. Open Terminal (Ctrl+` or View → Terminal)
4. Split the terminal (click the split icon)
5. In first terminal: `cd server && npm start`
6. In second terminal: `npm run dev` (for the web app)

### Method 2: Using VS Code Tasks
1. Press `Ctrl+Shift+P` and type "Tasks: Run Task"
2. Create a tasks.json file with both server and client tasks
3. Run both tasks simultaneously

## Data Storage
- **Location**: `D:\Lovable apps\Debt tool\debt-wizard-navigator\`
- **Debt Tool Data**: `debt-data.json`
- **Attendify Data**: `attendify-data.json`

## API Endpoints
- Health Check: `GET http://localhost:3001/api/health`
- Debt Tool Load: `GET http://localhost:3001/api/debt-tool/load`
- Debt Tool Save: `POST http://localhost:3001/api/debt-tool/save`
- Attendify Load: `GET http://localhost:3001/api/attendify/load`
- Attendify Save: `POST http://localhost:3001/api/attendify/save`

## Troubleshooting
- Make sure port 3001 is not in use by another application
- Check that the data directory has write permissions
- If server fails, check console for error messages
