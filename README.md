# MCP Browser Server

A Model Context Protocol (MCP) server that provides headless browser capabilities using Playwright. It enables AI models to fetch, render, and analyze modern web documentation and applications that are otherwise difficult to parse.

## Why MCP Browser Server?

Many modern technical documentations (built with Vue, React, or other SPA frameworks) render content dynamically on the client side. Standard web scrapers or simple HTTP clients often see only a blank page or a loading spinner, making it impossible for AI to:
- Understand complex documentation structures.
- Extract API definitions and usage examples.
- Analyze component props and events.

**MCP Browser Server** solves this by using a full headless browser to render the page completely before capturing the content, allowing AI to "see" the documentation exactly as a human developer would.

## Features

- ✅ **Full Headless Rendering**: Uses Playwright and Chromium to handle JavaScript-heavy sites (Vue, React, etc.).
- ✅ **Automatic Archiving**: Captured pages are saved as `.html` files in a structured log directory.
- ✅ **Tool Isolation**: Supports `TOOL_PREFIX` for running multiple instances without conflicts.
- ✅ **Smart Tooling**: 
  - `browser_get_content`: Visit a URL and save the fully rendered HTML.
  - `get_saved_files`: List all archived documentation pages.
  - `read_saved_file`: Retrieve the content of a previously saved page.
- ✅ **Persistence**: Maintains a local cache of documentation for offline analysis or repeated queries.
- ✅ **Lightweight**: Uses your existing Chrome/Edge installation via `playwright-core`.

## Installation

### Global Installation (Recommended)
```bash
npm install -g @liangshanli/mcp-server-browser
```

### Local Installation
```bash
npm install @liangshanli/mcp-server-browser
```

### From Source
```bash
git clone https://github.com/liliangshan/mcp-server-browser.git
cd mcp-server-browser
npm install
```

## Configuration

The server is configured via environment variables:

| Variable | Requirement | Default | Description |
|----------|-------------|---------|-------------|
| `CHROME_PATH` | **Required** | `C:\Program Files\Google\Chrome\Application\chrome.exe` | Path to your Chrome/Edge executable. Must be valid. |
| `TOOL_PREFIX` | Optional | | Optional prefix for tool names (e.g., `doc_`). |
| `PROJECT_NAME` | Optional | | Optional name for branding tool descriptions. |
| `MCP_LOG_DIR` | Optional | `./.setting` | Directory where logs and HTML files are stored. |

## Usage

### 1. Direct Run (Global Installation)
```bash
mcp-server-browser
```

### 2. Using npx (Recommended)
```bash
npx @liangshanli/mcp-server-browser
```

### 3. Direct Start (Source Installation)
```bash
npm start
```

## Editor Integration

### Cursor Editor Configuration

1. Create `.cursor/mcp.json` file in your project root:

```json
{
  "mcpServers": {
    "browser-docs": {
      "command": "node",
      "args": ["D:/site/chrome/mcp-server-browser/bin/cli.js"],
      "env": {
        "CHROME_PATH": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "TOOL_PREFIX": "browser",
        "PROJECT_NAME": "DocsAnalyzer"
      }
    }
  }
}
```

### VS Code Configuration

1. Install the MCP extension for VS Code
2. Create `.vscode/settings.json` file:

```json
{
  "mcp.servers": {
    "browser-docs": {
      "command": "node",
      "args": ["D:/site/chrome/mcp-server-browser/bin/cli.js"],
      "env": {
        "CHROME_PATH": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "TOOL_PREFIX": "browser",
        "PROJECT_NAME": "DocsAnalyzer"
      }
    }
  }
}
```

### Multiple Instances Support

You can configure multiple browser server instances with different `TOOL_PREFIX` and `PROJECT_NAME` to isolate tools and storage directories. This is useful when managing documentation for different projects.

**Example: Cursor Editor Configuration**

```json
{
  "mcpServers": {
    "vue-docs": {
      "command": "node",
      "args": ["D:/site/chrome/mcp-server-browser/bin/cli.js"],
      "env": {
        "CHROME_PATH": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "TOOL_PREFIX": "vue",
        "PROJECT_NAME": "VueNext"
      }
    },
    "react-docs": {
      "command": "node",
      "args": ["D:/site/chrome/mcp-server-browser/bin/cli.js"],
      "env": {
        "CHROME_PATH": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "TOOL_PREFIX": "react",
        "PROJECT_NAME": "ReactFiber"
      }
    }
  }
}
```

**Benefits of Multiple Instances:**
- **Tool Isolation**: Tools will be prefixed (e.g., `vue_browser_get_content`, `react_browser_get_content`).
- **Storage Isolation**: HTML files and logs are stored in separate directories (e.g., `./.setting.vue/`, `./.setting.react/`).
- **Project Branding**: Each instance has its own name in tool descriptions for better identification.

## Available Tools

### 1. `browser_get_content`
Opens a URL in the headless browser, waits for the content to load, and saves it.
- **Arguments**:
  - `url` (string, required): The URL to fetch.
  - `wait_until` (string): Loading state to wait for (`load`, `domcontentloaded`, `networkidle`). Default: `networkidle`.

### 2. `get_saved_files`
Returns a list of all HTML files currently saved in the log directory.
- **Arguments**: None.

### 3. `read_saved_file`
Reads the content of a specific saved HTML file.
- **Arguments**:
  - `filename` (string, required): The name of the file (e.g., `https___tdesign.tencent.com_vue.html`).

## Logging

All operations and captured HTML files are stored in:
- `./.setting/` (or `./.setting.<TOOL_PREFIX>/` if prefix is set).

Captured files follow a sanitized naming convention based on their URL, making them easy to identify and manage.

## License

MIT
