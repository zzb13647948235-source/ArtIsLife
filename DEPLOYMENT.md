# 腾讯云部署指南 (Tencent Cloud Deployment Guide)

## 构建完成 ✓
生产版本已成功构建在 `dist/` 文件夹中 (274MB)

## 腾讯云部署方式

### 方式一：腾讯云静态网站托管 (推荐)

1. **登录腾讯云控制台**
   - 访问：https://console.cloud.tencent.com/
   - 进入"云开发 CloudBase"或"对象存储 COS"

2. **使用云开发 CloudBase 静态托管**
   - 进入云开发控制台：https://console.cloud.tencent.com/tcb
   - 选择环境 → 静态网站托管
   - 点击"上传文件"
   - 将 `dist/` 文件夹中的所有内容上传
   - 配置域名和 HTTPS

3. **或使用对象存储 COS + CDN**
   - 进入 COS 控制台：https://console.cloud.tencent.com/cos
   - 创建存储桶（选择公有读私有写）
   - 开启静态网站功能
   - 上传 `dist/` 文件夹内容
   - 配置 CDN 加速

### 方式二：使用腾讯云 CLI 工具

1. **安装 CloudBase CLI**
```bash
npm install -g @cloudbase/cli
```

2. **登录**
```bash
cloudbase login
```

3. **初始化项目**
```bash
cloudbase init
```

4. **部署**
```bash
cloudbase hosting deploy dist/ -e your-env-id
```

### 方式三：手动上传（最简单）

1. 打开腾讯云控制台
2. 进入对象存储 COS 或云开发静态托管
3. 创建/选择存储桶
4. 使用网页界面直接上传 `dist/` 文件夹中的所有文件
5. 配置访问权限为公有读
6. 获取访问域名

## 重要配置

### 环境变量
确保在腾讯云环境中配置以下环境变量：
- `API_KEY`: Google Gemini API 密钥（用于游戏球童评论功能）
- Firebase 配置（如果使用）

### 路由配置
如果使用 React Router，需要配置重定向规则：
- 所有路径重定向到 `index.html`

### CORS 配置
如果需要跨域访问，在 COS 中配置 CORS 规则

## 当前构建信息
- 构建时间：2026-03-02
- 构建大小：274MB
- 入口文件：dist/index.html
- 资源文件：dist/assets/
- 艺术作品：dist/artworks/
- 新增功能：Hole in One 游戏（25个关卡，完整中文汉化）

## 下一步
1. 选择上述任一部署方式
2. 上传 dist/ 文件夹内容
3. 配置域名和 HTTPS
4. 测试游戏功能（特别是 Hole in One 游戏的 10 个新关卡）

## 需要安装 CLI 工具？
运行以下命令安装腾讯云 CLI：
```bash
npm install -g @cloudbase/cli
```
