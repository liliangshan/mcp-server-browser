#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const TOOL_PREFIX = process.env.TOOL_PREFIX || '';
const PROJECT_NAME = process.env.PROJECT_NAME || '';

// Log configuration
const getLogConfig = () => {
  let defaultLogDir = './.setting';
  if (TOOL_PREFIX) {
    defaultLogDir = `./.setting.${TOOL_PREFIX}`;
  }
  const logDir = process.env.MCP_LOG_DIR || defaultLogDir;
  const logFile = process.env.MCP_LOG_FILE || 'mcp-browser-cli.log';
  return {
    dir: logDir,
    file: logFile,
    fullPath: path.join(logDir, logFile)
  };
};

// Ensure log directory exists
const ensureLogDir = () => {
  const { dir } = getLogConfig();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Write log
const writeLog = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logLine = `${timestamp} | ${level} | ${message}${data ? ` | ${JSON.stringify(data)}` : ''}\n`;
  
  try {
    ensureLogDir();
    const { fullPath } = getLogConfig();
    fs.appendFileSync(fullPath, logLine, 'utf8');
  } catch (err) {
    console.error('Failed to write log file:', err.message);
  }
  console.error(`[${level}] ${message}`);
};

const serverPath = path.resolve(__dirname, '../src/server.js');

if (!fs.existsSync(serverPath)) {
  writeLog('ERROR', `Server file not found: ${serverPath}`);
  process.exit(1);
}

writeLog('INFO', `Starting Browser MCP Server [${PROJECT_NAME || 'Default'}]`);

function startServer() {
  const chromePath = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

  // Check if CHROME_PATH exists
  if (!fs.existsSync(chromePath)) {
    writeLog('ERROR', `Chrome executable not found at: ${chromePath}. Please set CHROME_PATH environment variable.`);
    console.error(`\n[FATAL ERROR] Chrome not found at: ${chromePath}`);
    console.error(`Please provide a valid path via the CHROME_PATH environment variable.\n`);
    process.exit(1);
  }

  const env = {
    ...process.env,
    CHROME_PATH: chromePath,
    TOOL_PREFIX: TOOL_PREFIX,
    PROJECT_NAME: PROJECT_NAME
  };

  const server = spawn('node', [serverPath], {
    stdio: ['inherit', 'inherit', 'inherit'],
    env: env
  });

  writeLog('INFO', `Server process started with PID: ${server.pid}`);

  server.on('close', (code) => {
    writeLog('INFO', `Server exited with code: ${code}`);
    process.exit(code);
  });

  server.on('error', (err) => {
    writeLog('ERROR', `Server process error: ${err.message}`);
    process.exit(1);
  });
}

startServer();
