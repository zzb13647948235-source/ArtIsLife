# ArtIsLife 本地部署指南

## 系统要求

- **Node.js**: 18.0 或更高版本
- **npm**: 9.0 或更高版本
- **操作系统**: Windows 10/11, macOS, Linux
- **内存**: 建议 4GB 以上

## 快速开始

### 1. 安装依赖

```bash
cd 6541
npm install
```

### 2. 配置环境变量

在项目根目录创建 `.env.local` 文件：

```env
GEMINI_API_KEY=你的Gemini_API密钥
```

> **安全提示**: `.env.local` 文件已被添加到 `.gitignore`，不会被提交到版本控制。

### 3. 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:3000` 启动。

## 局域网访问配置

### 自动配置（推荐）

启动服务器后，终端会显示多个网络地址：

```
  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.x.x:3000/
```

局域网内的其他设备可以通过 `Network` 地址访问网站。

### 手动配置

1. **获取本机IP地址**

   Windows:
   ```cmd
   ipconfig
   ```
   
   macOS/Linux:
   ```bash
   ifconfig | grep "inet "
   ```

2. **确保防火墙允许3000端口**

   Windows:
   ```cmd
   netsh advfirewall firewall add rule name="ArtIsLife" dir=in action=allow protocol=TCP localport=3000
   ```

3. **访问网站**
   
   在局域网内任意设备的浏览器中输入：
   ```
   http://[本机IP]:3000
   ```

## 生产环境部署

### 构建生产版本

```bash
npm run build
```

构建产物位于 `dist/` 目录。

### 预览生产版本

```bash
npm run preview
```

### 使用静态服务器部署

可以使用任何静态文件服务器托管 `dist/` 目录：

```bash
# 使用 serve
npx serve dist -l 3000

# 使用 http-server
npx http-server dist -p 3000

# 使用 Python
cd dist && python -m http.server 3000
```

## 安全配置

### 已实施的安全措施

1. **输入验证与清理**
   - 所有用户输入都经过严格验证
   - 移除潜在的XSS攻击代码
   - 限制输入长度

2. **速率限制**
   - 每IP每分钟最多30次请求
   - 超限IP将被临时封禁5分钟

3. **安全响应头**
   - X-Content-Type-Options: nosniff
   - X-Frame-Options: SAMEORIGIN
   - X-XSS-Protection: 1; mode=block
   - Referrer-Policy: strict-origin-when-cross-origin

4. **API密钥保护**
   - API密钥仅在服务器端使用
   - 所有API请求通过服务器代理

### 安全建议

1. **定期更新依赖**
   ```bash
   npm audit
   npm update
   ```

2. **使用HTTPS**（生产环境）
   - 配置SSL证书
   - 使用反向代理（如Nginx）

3. **环境变量管理**
   - 不要将 `.env.local` 提交到版本控制
   - 生产环境使用环境变量注入

## 常见问题

### Q: 端口3000被占用怎么办？

修改 `vite.config.ts` 中的端口配置，或使用命令行参数：
```bash
npm run dev -- --port 3001
```

### Q: 局域网设备无法访问？

1. 检查防火墙设置
2. 确保设备在同一网络
3. 确认使用正确的IP地址

### Q: API请求失败？

1. 检查 `.env.local` 中的API密钥是否正确
2. 确认网络连接正常
3. 查看浏览器控制台错误信息

## 项目结构

```
6541/
├── components/      # React组件
├── contexts/        # Context providers
├── data/           # 静态数据和翻译
├── public/         # 静态资源
│   └── artworks/   # 艺术作品图片
├── services/       # 服务层
├── .env.local      # 环境变量（不提交）
├── App.tsx         # 主应用组件
├── constants.ts    # 常量定义
├── index.html      # HTML入口
├── index.tsx       # React入口
├── package.json    # 项目配置
├── tsconfig.json   # TypeScript配置
├── types.ts        # 类型定义
└── vite.config.ts  # Vite配置
```

## 技术栈

- **前端框架**: React 18 + TypeScript
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **AI服务**: Google Gemini API
- **状态管理**: React Context

## 版权信息

本网站所有权归杨福庭所有

---

*本文档最后更新：2025年2月*
