# 告别 AI“失明”！为 Cursor/Claude 戴上 4K 眼镜：深度解析 Vue/React 现代渲染文档，让 AI 真正看见动态网页，彻底终结代码幻觉，打通开发者与最新 API 的最后 1 厘米！ 🚀

## 📖 前言：AI 时代的“文档断层”危机

在 2025 年的今天，我们正身处 AI 编程的黄金时代。**Cursor**、**Claude Desktop**、**GitHub Copilot** 等工具已经成为了无数开发者的“第二大脑”。然而，即便最强大的模型（如 Claude 3.5 Sonnet 或 GPT-4o）也面临着一个致命的尴尬：**它们对现代前端生态地理解，往往存在着严重的“断层”。**

你一定遇到过这样的场景：你想让 AI 帮你写一个 **TDesign** 的复杂表单，或者想集成 **Element Plus** 的最新组件。你满心欢喜地把官方文档 URL 发给 AI，期望它能秒出代码。然而，AI 给出的回复往往是：“对不起，我无法读取该网页内容”，或者更糟——它基于两年前的旧数据，给你写出了一堆早已被废弃的 API，导致你不得不花费数小时去手动调试。

### 为什么 AI 会“失明”？

核心矛盾在于：**文档的进化速度，远超 AI 的“抓取能力”。**

现在的主流技术文档（如 Vue、React、Svelte 等）几乎无一例外地采用了单页应用（SPA）或服务端渲染（SSR）配合客户端激活的架构。这意味着当你打开网页时，浏览器首先接收到的是一个近乎空的 HTML 外壳和一堆复杂的 JavaScript 脚本。内容是加载完成后，由浏览器实时渲染出来的。

**传统的 AI 抓取工具（如简单的 HTTP 请求）只能看到那个“空的 HTML 外壳”。** 对于 AI 而言，它看到的是一片荒芜：没有 Props 说明、没有方法列表、没有示例代码。于是，AI 只能依赖它在模型训练阶段学习到的过时知识进行“逻辑推理”。这正是代码幻觉（Hallucinations）产生的温床。

### 于是，MCP Browser Server 应运而生

我们意识到，要让 AI 真正释放生产力，就必须给它一套“高清眼镜”，让它能够像人类开发者一样，真实地“看见”渲染后的网页。

**MCP Browser Server** 并不是另一个简单的爬虫。它是一个基于 **Model Context Protocol (MCP)** 的专业级工具，底层集成了强大的 **Playwright** 无头浏览器引擎。它的使命非常明确：**打破动态网页的围墙，为 AI 提供实时、真实、结构化的技术文档上下文。**

---

## 💡 你是否也曾为此烦恼？

在使用 AI 编程工具时，你扔给它一个官方文档链接，结果 AI 却：
- ❌ 告诉你“无法访问该网页内容”
- ❌ 只能看到一个空的 HTML 壳子和“Loading...”
- ❌ 开始基于旧知识“一本正经地胡说八道”，写出全是 Bug 的代码

**原因很简单：** 现代官方文档几乎都是用 Vue、React 或其他单页应用（SPA）框架开发的。内容是在浏览器中动态渲染出来的，传统的简单抓取工具根本看不见真实的内容。

---

## ✨ 解决方案：MCP Browser Server

通过 **Playwright** 无头浏览器技术，它能够像人类一样：
1. **真实渲染**：完整运行页面上的 JavaScript，等待 Vue/React 组件加载完成。
2. **深度解析**：获取渲染后的完整 DOM 树，将最新的 API 定义、Props 说明和示例代码完整呈现给 AI。
3. **自动存档**：将抓取的页面保存为本地 HTML，建立你自己的“本地文档库”，甚至支持离线分析。

---

## 🛠️ 快速安装

只需简单几步，即可让你的 AI 拥有阅读现代文档的能力！

### 全局安装 (推荐)
```bash
npm install -g @liangshanli/mcp-server-browser
```

### 使用 npx (免安装)
```bash
npx @liangshanli/mcp-server-browser
```

---

## 💻 编辑器集成

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

---

## 🌟 为什么它是开发者的必备神器？

- **API 零误读**：让 AI 直接读取最新版本的文档，拒绝过时的幻觉知识。
- **结构化理解**：AI 能够轻松识别文档中的表格、代码块和组件层级。
- **持续进化**：支持 `wait_until` 参数（如 `networkidle`），确保即使是加载最慢的重型文档也能被完美捕捉。
- **多实例支持**：可以为 Vue 项目配置一个 `vue-docs` 实例，为 React 项目配置一个 `react-docs` 实例，互不干扰。

---

## 🔗 立即开启你的 AI 增强开发之旅！

项目地址：[https://github.com/liliangshan/mcp-server-browser.git](https://github.com/liliangshan/mcp-server-browser.git)

**别再让 AI “盲人摸象”了，快给它换上 MCP Browser Server 这副高清眼镜吧！让代码编写从“凭空想象”回归“实事求是”。**

---

# End AI Blindness! Equip Cursor/Claude with 4K Vision: Real-Time Headless Rendering for Vue/React Docs—Bridging the Gap Between AI and Modern Web Content to Eliminate Hallucinations! 🚀

## 📖 Preface: The "Documentation Gap" Crisis in the AI Era

In 2025, we are in the golden age of AI programming. Tools like **Cursor**, **Claude Desktop**, and **GitHub Copilot** have become the "second brain" for countless developers. However, even the most powerful models (like Claude 3.5 Sonnet or GPT-4o) face a fatal embarrassment: **their understanding of the modern frontend ecosystem often suffers from a severe "gap."**

You've likely encountered this: you want AI to help you write a complex form for **TDesign**, or integrate the latest components from **Element Plus**. You excitedly send the official doc URL to the AI, expecting code in seconds. Instead, the response is often: "Sorry, I cannot access this webpage content," or worse—it relies on two-year-old data to write code with deprecated APIs, leaving you to spend hours debugging manually.

### Why Does AI Go "Blind"?

The core conflict is: **Documentation evolves much faster than AI's "crawling capability."**

Modern technical docs (like Vue, React, Svelte, etc.) almost exclusively use Single Page Application (SPA) or SSR with hydration architectures. This means when you open a page, the browser first receives a nearly empty HTML shell and a bunch of complex JavaScript. The content is rendered in real-time by the browser after loading.

**Traditional AI crawling tools (like simple HTTP requests) can only see that "empty HTML shell."** For AI, it sees a wasteland: no Prop descriptions, no method lists, no example code. Consequently, AI falls back on outdated knowledge from its training phase. This is exactly where code hallucinations are born.

### Thus, MCP Browser Server Was Born

We realized that to truly unleash AI productivity, we must give it a pair of "high-definition glasses" to see the rendered webpage just like a human developer.

**MCP Browser Server** is not just another simple crawler. It's a professional-grade tool based on the **Model Context Protocol (MCP)**, integrated with the powerful **Playwright** headless browser engine. Its mission is clear: **Break down the walls of dynamic webpages and provide AI with real-time, authentic, and structured technical documentation context.**

---

## 💡 Are You Also Troubled by This?

When using AI programming tools, you throw an official doc link at it, but the AI:
- ❌ Tells you "Cannot access the webpage content"
- ❌ Sees only an empty HTML shell and "Loading..."
- ❌ Starts "hallucinating" based on old knowledge, writing buggy code

**The reason is simple:** Modern docs are mostly built with Vue, React, or other SPA frameworks. Content is rendered dynamically in the browser, which traditional simple crawling tools cannot see.

---

## ✨ Solution: MCP Browser Server

**MCP Browser Server** is designed specifically for this! It solves the "AI web reading blind spot."

Using **Playwright** headless browser technology, it acts just like a human:
1. **Real Rendering**: Fully runs JavaScript on the page, waiting for Vue/React components to finish loading.
2. **Deep Parsing**: Captures the fully rendered DOM tree, presenting the latest API definitions, Props descriptions, and example code to the AI.
3. **Auto-Archiving**: Saves captured pages as local HTML, building your own "local documentation library."

---

## 🛠️ Quick Installation

Just a few steps to give your AI the power to read modern documentation!

### Global Installation (Recommended)
```bash
npm install -g @liangshanli/mcp-server-browser
```

### Use npx (No Install)
```bash
npx @liangshanli/mcp-server-browser
```

---

## 💻 Editor Integration

### Cursor Editor Configuration

1. Create `.cursor/mcp.json` file in your project root:

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

### VS Code Configuration

1. Install the MCP extension for VS Code
2. Create `.vscode/settings.json` file:

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

### Multiple Instances Support

You can configure multiple browser server instances with different `TOOL_PREFIX` and `PROJECT_NAME` to isolate tools and storage directories. This is useful when managing documentation for different projects.

**Example: Cursor Editor Configuration**

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

**Benefits of Multiple Instances:**
- **Tool Isolation**: Tools will be prefixed (e.g., `vue_browser_get_content`, `react_browser_get_content`).
- **Storage Isolation**: HTML files and logs are stored in separate directories (e.g., `./.setting.vue/`, `./.setting.react/`).
- **Project Branding**: Each instance has its own name in tool descriptions for better identification.

---

## 🌟 Why is it a Must-Have for Developers?

- **Zero API Misinterpretation**: Let AI read the latest documentation directly, rejecting outdated hallucinated knowledge.
- **Structured Understanding**: AI can easily identify tables, code blocks, and component hierarchies within the documentation.
- **Continuous Evolution**: Supports `wait_until` parameters (like `networkidle`) to ensure even the slowest heavy documentation is perfectly captured.
- **Multi-Instance Support**: Configure a `vue-docs` instance for Vue projects and a `react-docs` instance for React projects without interference.

---

## 🔗 Start Your AI-Enhanced Development Journey Now!

Project Address: [https://github.com/liliangshan/mcp-server-browser.git](https://github.com/liliangshan/mcp-server-browser.git)

**Stop letting AI "feel the elephant blindly"—give it the high-definition glasses of MCP Browser Server! Let coding return from "pure imagination" to "seeking truth from facts."**
