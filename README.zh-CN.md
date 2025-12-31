# MCP 浏览器服务器 (MCP Browser Server)

这是一个基于模型上下文协议 (MCP) 的浏览器工具服务器，使用 Playwright 提供无头浏览器能力。它允许 AI 模型抓取、渲染和分析那些难以直接解析的现代 Web 文档和应用程序。

## 为什么需要 MCP 浏览器服务器？

许多现代技术文档（基于 Vue、React 或其他 SPA 框架构建）在客户端动态渲染内容。标准的网页抓取工具或简单的 HTTP 客户端通常只能看到空白页面或加载动画，导致 AI 无法：
- 理解复杂的文档结构。
- 提取 API 定义和使用示例。
- 分析组件的 Props 和事件。

**MCP 浏览器服务器** 通过使用完整的无头浏览器在捕获内容之前完全渲染页面来解决此问题，让 AI 能够像人类开发者一样“看到”文档。

## 功能特性

- ✅ **完整无头渲染**：使用 Playwright 和 Chromium 处理 JavaScript 密集型网站（Vue、React 等）。
- ✅ **自动存档**：抓取的页面将作为 `.html` 文件保存在结构化的日志目录中。
- ✅ **实例隔离**：支持 `TOOL_PREFIX`，允许运行多个实例而不会发生冲突。
- ✅ **智能工具**：
  - `browser_get_content`：访问 URL 并保存完全渲染后的 HTML。
  - `get_saved_files`：列出所有已存档的文档页面。
  - `read_saved_file`：读取之前保存的页面内容。
- ✅ **持久化**：维护文档的本地缓存，用于离线分析或重复查询。
- ✅ **轻量级**：通过 `playwright-core` 使用您现有的 Chrome/Edge 安装。

## 安装

### 全局安装 (推荐)
```bash
npm install -g @liangshanli/mcp-server-browser
```

### 本地安装
```bash
npm install @liangshanli/mcp-server-browser
```

### 从源码安装
```bash
git clone https://github.com/liliangshan/mcp-server-browser.git
cd mcp-server-browser
npm install
```

## 配置指南

服务器通过环境变量进行配置：

| 变量 | 是否必须 | 默认值 | 描述 |
|----------|-------------|---------|-------------|
| `CHROME_PATH` | **必须** | `C:\Program Files\Google\Chrome\Application\chrome.exe` | Chrome 或 Edge 可执行文件的路径。必须有效。 |
| `TOOL_PREFIX` | 可选 | | 工具名称的可选前缀（例如 `doc_`）。 |
| `PROJECT_NAME` | 可选 | | 用于定制工具描述的项目名称。 |
| `MCP_LOG_DIR` | 可选 | `./.setting` | 存储日志和 HTML 文件的目录。 |

## 使用方法

### 1. 直接运行 (全局安装)
```bash
mcp-server-browser
```

### 2. 使用 npx (推荐)
```bash
npx @liangshanli/mcp-server-browser
```

### 3. 直接启动 (源码安装)
```bash
npm start
```

## 编辑器集成

### Cursor 编辑器配置

1. 在项目根目录创建 `.cursor/mcp.json` 文件：

```json
{
  "mcpServers": {
    "browser-docs": {
      "command": "npx",
      "args": ["-y", "@liangshanli/mcp-server-browser"],
      "env": {
        "CHROME_PATH": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "TOOL_PREFIX": "browser",
        "PROJECT_NAME": "DocsAnalyzer"
      }
    }
  }
}
```

### VS Code 配置

1. 为 VS Code 安装 MCP 扩展。
2. 创建或编辑 `.vscode/settings.json` 文件：

```json
{
  "mcp.servers": {
    "browser-docs": {
      "command": "npx",
      "args": ["-y", "@liangshanli/mcp-server-browser"],
      "env": {
        "CHROME_PATH": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "TOOL_PREFIX": "browser",
        "PROJECT_NAME": "DocsAnalyzer"
      }
    }
  }
}
```

### 多实例支持

您可以配置多个浏览器服务器实例，通过不同的 `TOOL_PREFIX` 和 `PROJECT_NAME` 来隔离工具和存储目录。这在管理不同项目的文档时非常有用。

**示例：Cursor 编辑器配置**

```json
{
  "mcpServers": {
    "vue-docs": {
      "command": "npx",
      "args": ["-y", "@liangshanli/mcp-server-browser"],
      "env": {
        "CHROME_PATH": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "TOOL_PREFIX": "vue",
        "PROJECT_NAME": "VueNext"
      }
    },
    "react-docs": {
      "command": "npx",
      "args": ["-y", "@liangshanli/mcp-server-browser"],
      "env": {
        "CHROME_PATH": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
        "TOOL_PREFIX": "react",
        "PROJECT_NAME": "ReactFiber"
      }
    }
  }
}
```

**多实例的好处：**
- **工具隔离**：工具名将带有前缀（例如 `vue_browser_get_content`，`react_browser_get_content`）。
- **存储隔离**：HTML 文件和日志存储在不同的目录中（例如 `./.setting.vue/`，`./.setting.react/`）。
- **项目品牌化**：每个实例在工具描述中都有自己的名称，更易于识别。

## 可用工具

### 1. `browser_get_content`
在无头浏览器中打开 URL，等待内容加载并保存。
- **参数**:
  - `url` (string, 必须): 要访问的 URL。
  - `wait_until` (string): 等待加载的状态 (`load`, `domcontentloaded`, `networkidle`)。默认值: `networkidle`。

### 2. `get_saved_files`
返回日志目录中当前保存的所有 HTML 文件列表。
- **参数**: 无。

### 3. `read_saved_file`
读取特定保存的 HTML 文件内容。
- **参数**:
  - `filename` (string, 必须): 文件名（例如 `https___tdesign.tencent.com_vue.html`）。

## 日志

所有操作和捕获的 HTML 文件都存储在：
- `./.setting/` (如果设置了前缀，则为 `./.setting.<TOOL_PREFIX>/`)。

捕获的文件遵循基于 URL 的规范化命名约定，易于识别和管理。

## 许可证

MIT
