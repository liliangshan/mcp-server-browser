const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

// Environment configuration
const CHROME_PATH = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const TOOL_PREFIX = process.env.TOOL_PREFIX || '';
const PROJECT_NAME = process.env.PROJECT_NAME || '';
const DOC_URL = process.env.DOC_URL || '';

// Get log directory configuration
const getLogDir = () => {
  let defaultLogDir = './.setting';
  if (TOOL_PREFIX) {
    defaultLogDir = `./.setting.${TOOL_PREFIX}`;
  }
  return process.env.MCP_LOG_DIR || defaultLogDir;
};

// Ensure log directory exists
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Convert URL to a safe filename
const sanitizeFilename = (url) => {
  return url.replace(/[:/\\?*|"<>]/g, '_') + '.html';
};

class BrowserMCPServer {
  constructor() {
    this.name = 'browser-mcp-server';
    this.version = '1.0.0';
    this.initialized = false;
  }

  // Helper function: generate tool name with prefix
  getToolName(baseName) {
    return TOOL_PREFIX ? `${TOOL_PREFIX}_${baseName}` : baseName;
  }

  // Helper function: generate tool description with project name
  getToolDescription(baseDescription) {
    if (PROJECT_NAME) {
      return `[${PROJECT_NAME}] ${baseDescription}`;
    }
    return baseDescription;
  }

  // Core functionality: use headless browser to fetch content and save to logs
  async browse_url(params) {
    const { url, wait_until = 'networkidle', timeout = 30000 } = params;

    if (!url) {
      throw new Error('Missing url parameter');
    }

    const logDir = getLogDir();
    ensureDir(logDir);

    console.error(`[Browser${PROJECT_NAME ? ` - ${PROJECT_NAME}` : ''}] Opening URL: ${url}`);
    
    let browser;
    try {
      browser = await chromium.launch({
        executablePath: CHROME_PATH,
        headless: true 
      });

      const page = await browser.newPage();
      page.setDefaultTimeout(timeout);

      await page.goto(url, { waitUntil: wait_until });

      const content = await page.content();
      const title = await page.title();

      // Save to file
      const fileName = sanitizeFilename(url);
      const filePath = path.join(logDir, fileName);
      fs.writeFileSync(filePath, content, 'utf8');

      console.error(`[Browser${PROJECT_NAME ? ` - ${PROJECT_NAME}` : ''}] Successfully fetched content and saved to: ${filePath}`);

      return {
        title,
        url: page.url(),
        saved_path: path.resolve(filePath),
        content: content
      };
    } catch (err) {
      console.error(`[Browser${PROJECT_NAME ? ` - ${PROJECT_NAME}` : ''}] Error: ${err.message}`);
      throw new Error(`Browser execution failed: ${err.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  // Get list of saved files
  async get_saved_files() {
    const logDir = getLogDir();
    if (!fs.existsSync(logDir)) {
      return { files: [], total: 0 };
    }

    const files = fs.readdirSync(logDir)
      .filter(file => file.endsWith('.html'))
      .map(file => {
        const stats = fs.statSync(path.join(logDir, file));
        return {
          name: file,
          size: stats.size,
          mtime: stats.mtime
        };
      })
      .sort((a, b) => b.mtime - a.mtime);

    return {
      files,
      total: files.length,
      directory: path.resolve(logDir)
    };
  }

  // Read saved file content
  async read_saved_file(params) {
    const { filename } = params;
    if (!filename) {
      throw new Error('Missing filename parameter');
    }

    const logDir = path.resolve(getLogDir());
    const filePath = path.resolve(logDir, filename);

    // Use path.relative to validate path safety and prevent directory traversal
    const relative = path.relative(logDir, filePath);
    const isSafe = relative && !relative.startsWith('..') && !path.isAbsolute(relative);

    if (!fs.existsSync(filePath)) {
      console.error(`[Browser] File does not exist: ${filePath}`);
      throw new Error(`File does not exist: ${filename}`);
    }

    if (!isSafe) {
      console.error(`[Browser] Invalid path: attempting to access file outside directory. logDir=${logDir}, filePath=${filePath}`);
      throw new Error('Permission denied: cannot access this path');
    }

    const content = fs.readFileSync(filePath, 'utf8');
    return {
      filename,
      content: content
    };
  }

  // Save document catalog
  async save_doc_catalog(params) {
    const { catalog } = params;
    if (!catalog) {
      throw new Error('Missing catalog parameter');
    }

    const logDir = getLogDir();
    ensureDir(logDir);

    const filePath = path.join(logDir, 'catalog.json');

    fs.writeFileSync(filePath, JSON.stringify({ catalog, updatedAt: new Date() }, null, 2), 'utf8');

    return {
      saved_path: path.resolve(filePath),
      message: 'Catalog saved successfully to catalog.json'
    };
  }

  // Get document catalog
  async get_doc_catalog() {
    const logDir = getLogDir();
    const filePath = path.join(logDir, 'catalog.json');

    if (!fs.existsSync(filePath)) {
      if (DOC_URL) {
        console.error(`[Browser] Catalog not found. Automatically fetching content from DOC_URL: ${DOC_URL}`);
        try {
          const result = await this.browse_url({ url: DOC_URL });
          return {
            exists: false,
            url: DOC_URL,
            content: result.content,
            message: `No catalog found in catalog.json. I have automatically fetched the content from the configured DOC_URL (${DOC_URL}). Instruction: Please analyze this content to extract ALL component titles and their URLs, then use the 'save_doc_catalog' tool to save the complete catalog.`
          };
        } catch (err) {
          return {
            exists: false,
            message: `No catalog found in catalog.json. Attempted to fetch from DOC_URL (${DOC_URL}) but failed: ${err.message}. Instruction: Please use the 'browser_get_content' tool to fetch the documentation overview page manually, analyze it, and then use 'save_doc_catalog'.`
          };
        }
      }

      return { 
        exists: false, 
        message: `No catalog found in catalog.json and DOC_URL is not configured. Instruction: Please use the 'browser_get_content' tool to fetch the page content first (e.g., from an overview or sidebar page), analyze ALL components to extract their titles and URLs, and finally use the 'save_doc_catalog' tool to save the complete catalog to catalog.json.` 
      };
    }

    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  }

  // Handle MCP JSON-RPC requests
  async handleRequest(request) {
    try {
      const { jsonrpc, id, method, params } = request;
      if (jsonrpc !== '2.0') throw new Error('Unsupported JSON-RPC version');

      let result = null;

      if (method === 'initialize') {
        this.initialized = true;
        result = {
          protocolVersion: params?.protocolVersion || '2025-06-18', // Align with mysql version
          capabilities: { 
            tools: { listChanged: false },
            prompts: { listChanged: false },
            resources: { listChanged: false }
          },
          serverInfo: { 
            name: TOOL_PREFIX ? `${TOOL_PREFIX}_browser_server` : this.name, 
            version: this.version 
          }
        };
      } 
      else if (method === 'notifications/initialized') {
        console.error('[Browser] Received initialization completion notification');
        return null;
      }
      else if (method === 'tools/list') {
        result = {
          tools: [
            {
              name: this.getToolName('browser_get_content'),
              description: this.getToolDescription('Use headless browser to open URL, fetch complete HTML content and save to log directory'),
              inputSchema: {
                type: 'object',
                properties: {
                  url: { type: 'string', description: 'URL to visit' },
                  wait_until: { 
                    type: 'string', 
                    description: 'Wait until level',
                    enum: ['load', 'domcontentloaded', 'networkidle'],
                    default: 'networkidle'
                  }
                },
                required: ['url']
              }
            },
            {
              name: this.getToolName('get_saved_files'),
              description: this.getToolDescription('Get list of saved HTML files'),
              inputSchema: {
                type: 'object',
                properties: {}
              }
            },
            {
              name: this.getToolName('read_saved_file'),
              description: this.getToolDescription('Read content of saved HTML file'),
              inputSchema: {
                type: 'object',
                properties: {
                  filename: { type: 'string', description: 'Filename (e.g., https___www.baidu.com.html)' }
                },
                required: ['filename']
              }
            },
            {
              name: this.getToolName('save_doc_catalog'),
              description: this.getToolDescription('Save the document catalog (structure) analyzed from the page. Hint: Call browser_get_content first, analyze ALL components to extract their titles and URLs, and then use this tool to save the global catalog.'),
              inputSchema: {
                type: 'object',
                properties: {
                  catalog: { type: 'object', description: 'The complete document catalog/structure containing all components' }
                },
                required: ['catalog']
              }
            },
            {
              name: this.getToolName('get_doc_catalog'),
              description: this.getToolDescription('Get the global document catalog from catalog.json'),
              inputSchema: {
                type: 'object',
                properties: {}
              }
            }
          ]
        };
      } 
      else if (method === 'tools/call') {
        const { name, arguments: args } = params;
        let actualMethodName = name;
        if (TOOL_PREFIX && name.startsWith(`${TOOL_PREFIX}_`)) {
          actualMethodName = name.substring(TOOL_PREFIX.length + 1);
        }

        let toolResult = null;
        if (actualMethodName === 'browser_get_content') {
          toolResult = await this.browse_url(args);
        } else if (actualMethodName === 'get_saved_files') {
          toolResult = await this.get_saved_files();
        } else if (actualMethodName === 'read_saved_file') {
          toolResult = await this.read_saved_file(args);
        } else if (actualMethodName === 'save_doc_catalog') {
          toolResult = await this.save_doc_catalog(args);
        } else if (actualMethodName === 'get_doc_catalog') {
          toolResult = await this.get_doc_catalog();
        } else {
          throw new Error(`Unknown tool: ${name}`);
        }

        result = {
          content: [{ type: 'text', text: JSON.stringify(toolResult, null, 2) }]
        };
      }
      // Supplementary empty placeholder methods from mysql to prevent Cursor errors
      else if (method === 'prompts/list') {
        result = { prompts: [] };
      }
      else if (method === 'resources/list') {
        result = { resources: [] };
      }
      else if (method === 'logging/list') {
        result = { logs: [] };
      }
      else if (method === 'ping') {
        result = { pong: true };
      }
      else if (method === 'shutdown') {
        setTimeout(() => process.exit(0), 100);
        result = null;
      }
      else {
        // For unknown methods, return empty result instead of error to prevent loading hang
        result = {};
      }

      return { jsonrpc: '2.0', id, result };
    } catch (error) {
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: { code: -32603, message: error.message }
      };
    }
  }

  // Start standard input/output listening
  startStdio() {
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', async (data) => {
      // Align with mysql line processing logic to prevent Windows newline interference
      const lines = data.toString().trim().split('\n');
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const request = JSON.parse(line);
          const response = await this.handleRequest(request);
          if (response) console.log(JSON.stringify(response));
        } catch (err) {
          console.error('Failed to parse request:', err.message, 'Line:', line);
        }
      }
    });
    console.error(`Browser MCP Server [${PROJECT_NAME || 'Default'}] started (stdio mode)`);
    console.error(`Log storage directory: ${path.resolve(getLogDir())}`);
  }
}

const server = new BrowserMCPServer();
server.startStdio();
