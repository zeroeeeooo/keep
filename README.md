# 🏃 KEEPro

> Keep 运动打卡截图生成器 — 一键生成精致的运动打卡截图

![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js) ![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite) ![Express](https://img.shields.io/badge/Express-5-000?logo=express) ![MySQL](https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql)

[🌐 在线 Demo](https://tool.joytion.cn/keep/) | [📦 项目起源](#项目历程)

---

## 📋 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [使用说明](#使用说明)
- [项目结构](#项目结构)
- [API 概览](#api-概览)
- [项目历程](#项目历程)

---

## ✨ 功能特性

### 截图生成核心
| 功能 | 说明 |
|------|------|
| 🖼️ **Keep 风格截图** | 生成与 Keep App 风格一致的运动打卡截图 |
| 📏 **自定义数据** | 距离（公里）、配速、日期、时间、温度、湿度等均可自由设置 |
| 🌤️ **自动天气** | 调用**高德地图 API** 获取实时温度与湿度数据 |
| 🗺️ **运动轨迹** | 支持**手动绘制** / **自动生成**运动路径，轨迹颜色渐变效果 |
| 💾 **持久化存储** | 修改设置后自动保存至 IndexedDB，刷新不丢失 |
| 🖨️ **一键下载** | 点击"保存图片"即可生成截图并下载到本地 |

### 批量生成
- 📅 一键生成**多张不同日期、天气、温度**的打卡截图
- ⏱ 支持设置公里数与配速

### 用户系统
- 🔐 用户注册 / 登录（JWT 认证）
- 👤 个人主页
- 🤝 **好友系统**：
  - 搜索用户
  - 发送 / 接收好友请求
  - 接受 / 拒绝 / 撤回请求
  - 删除好友
  - 好友列表

---

## 🛠 技术栈

| 层 | 技术 |
|----|------|
| **前端框架** | Vue 3 + Vue Router 4 |
| **构建工具** | Vite 6 |
| **截图生成** | html2canvas (纯前端渲染) |
| **地图 API** | 高德地图 AMap |
| **运行时** | Node.js + Express 5 |
| **数据库** | MySQL 8 |
| **认证** | JWT + bcryptjs |
| **部署** | Vercel (前后端分离) |

---

## 🚀 快速开始

### 环境要求
- Node.js >= 18
- MySQL 8.0+

### 安装与运行

```bash
# 1. 克隆仓库
git clone https://github.com/your-username/keep.git
cd keep

# 2. 安装依赖
npm install

# 3. 配置环境变量（可选）
# 编辑 .env.local 或设置环境变量：
#   DB_HOST       数据库地址       默认 localhost
#   DB_PORT       数据库端口       默认 3306
#   DB_USER       数据库用户名     默认 root
#   DB_PASSWORD   数据库密码
#   DB_NAME       数据库名         默认 wyzwjf
#   JWT_SECRET    JWT 签名密钥     默认 keep-pro-secret-key...

# 4. 确保 MySQL 正在运行，数据库和表会自动创建

# 5. 启动（前后端同时启动）
npm start

# 或分别启动：
npm run server   # 后端 → http://localhost:3001
npm run dev      # 前端 → http://localhost:3000
```

启动后访问 **[http://localhost:3000](http://localhost:3000)** 即可使用。

> **默认管理员账号**：`admin` / `123456`

### 生产构建

```bash
npm run build    # 构建前端到 dist/
npm run server   # 启动后端服务
```

---

## 📖 使用说明

1. 打开首页，注册账号或使用默认账号登录
2. 点击 **KEEPro** 卡片进入截图生成器
3. 在左侧/顶部**设置面板**中修改各项参数：
   - 运动类型、用户名
   - 公里数、配速
   - 日期、时间
   - 温度、湿度
   - 选择背景图
4. 可手动绘制或自动生成运动轨迹
5. 点击 **"保存图片"** 生成并下载截图
6. 使用 **批量生成** 功能一次性生成多张截图
7. 所有设置自动保存，下次打开无需重新配置

---

## 📁 项目结构

```
├── index.html              # 入口 HTML
├── vite.config.js          # Vite 配置（含 API 代理）
├── package.json
├── src/                    # Vue 3 前端
│   ├── main.js             # 应用入口
│   ├── App.vue             # 根组件
│   ├── router/index.js     # 路由（登录/注册/首页/截图/个人/好友）
│   ├── store/auth.js       # 认证状态管理
│   └── views/
│       ├── Home.vue        # 首页工具集
│       ├── Login.vue       # 登录页
│       ├── Register.vue    # 注册页
│       ├── Keep.vue        # 截图生成器（内嵌 keep.html）
│       ├── Profile.vue     # 个人主页
│       └── Friends.vue     # 好友管理
├── public/                 # 静态资源 & 截图生成核心
│   ├── keep.html           # 截图生成器主页面（iframe 嵌入）
│   ├── css/
│   │   ├── base.css
│   │   └── styles.css
│   ├── js/                 # 截图生成逻辑
│   │   ├── init.js         # 初始化变量
│   │   ├── onload.js       # 页面加载逻辑
│   │   ├── render.js       # 渲染引擎
│   │   ├── drawMine.js     # 运动轨迹绘制
│   │   ├── select_manner.js
│   │   ├── img_both_inpt_set.js
│   │   ├── download_img.js
│   │   ├── draw_personalization.js
│   │   ├── dataURLtoBlob.js
│   │   ├── batch_generate.js  # 批量生成
│   │   ├── indexedDB.js       # 本地持久化
│   │   └── invoke/
│   │       ├── amapHelper.js       # 高德地图 API
│   │       └── html2canvas.min.js  # 截图库
│   └── images/             # 背景图、图标等资源
├── server/                 # Express 后端
│   ├── index.js            # 服务入口
│   ├── db.js               # 数据库连接 & 查询
│   └── routes/
│       ├── auth.js         # 注册/登录/用户信息
│       └── friends.js      # 好友系统 API
├── dist/                   # 构建产物
└── vercel.json             # Vercel 部署配置
```

---

## 🔌 API 概览

### 认证 `/api/auth`
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/register` | 注册新用户 |
| POST | `/api/auth/login` | 登录，返回 JWT |
| GET | `/api/auth/me` | 获取当前用户信息 |
| GET | `/api/health` | 健康检查 |

### 好友 `/api/friends`
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/friends/search?q=` | 搜索用户 |
| GET | `/api/friends/list` | 好友列表 |
| POST | `/api/friends/request` | 发送好友请求 |
| PUT | `/api/friends/request/:id` | 接受/拒绝请求 |
| DELETE | `/api/friends/request/:id` | 撤回已发送请求 |
| DELETE | `/api/friends/:friendId` | 删除好友 |
| GET | `/api/friends/requests/incoming` | 收到的好友请求 |
| GET | `/api/friends/requests/sent` | 已发送的好友请求 |

---

## 🧾 项目历程

```
@jimaske/njupt-keep → @fyhb/keep → @joytion/keep → 本分支 (Vue 重构)
```

本项目基于开源社区的前代工作，进行了 **Vue 3 架构重构**：
- 将原本的单页应用重构为 Vue 3 + Vue Router 多页面架构
- 新增用户认证系统（JWT）
- 新增好友管理系统
- 新增首页工具集与侧边栏导航
- 截图生成核心保持为独立页面（`public/keep.html`），通过 iframe 嵌入

**相关链接：**
- [原 Keep 项目（Gitee）](https://gitee.com/fyhb/keep)
- [原项目 README](https://gitee.com/fyhb/keep/blob/master/README.md)

---

## 📄 许可

本项目仅供个人学习与交流使用，请勿用于商业用途。

---

<p align="center">
  <sub>更新于 2026-06-16 · 使用 ❤️ 和 Vue 构建</sub>
</p>
