# KEEPro 前端重构任务跟踪

> 项目：KEEPro — Keep 运动打卡截图生成器
> 开始日期：2026-06-27
> 状态：🔴 阶段一进行中

---

## 🎯 重构目标

1. **消除重复代码** — Toast 逻辑、页面头部、头像等全部组件化
2. **状态管理升级** — 用 Pinia 替代手动 reactive 状态
3. **核心 Keep 页面迁移** — 消除 iframe，将 1000+ 行遗留 JS 转为 Vue 组件
4. **设计系统增强** — 暗黑模式、动画、响应式、骨架屏

---

## 阶段总览

| 阶段 | 名称                      | 状态      | 优先级 |
| ---- | ------------------------- | --------- | ------ |
| 一   | 组件化 + 基础架构升级     | ✅ 已完成 | P0     |
| 二   | 状态管理升级 + TypeScript | ✅ 已完成 | P1     |
| 三   | 核心 Keep 页面重构        | ✅ 已完成 | P0     |
| 四   | 设计系统增强 + UI/UX 升级 | ✅ 已完成 | P2     |

---

## 阶段一：组件化 + 基础架构升级

### 任务列表

- [X] **1.1 创建目录结构** — `src/components/`、`src/composables/`、`src/components/layout/`
- [X] **1.2 创建 `useToast` composable** — 提取 Notes.vue、Friends.vue 中重复的 Toast 逻辑
- [X] **1.3 创建 `UserAvatar.vue` 组件** — 统一头像显示（文字首字母 + 渐变色）
- [X] **1.4 创建 `AppHeader.vue` 组件** — 统一页面头部（返回按钮 + 标题 + 右区域）
- [X] **1.5 创建 `AppSidebar.vue` 组件** — 从 Home.vue 提取侧边栏
- [X] **1.6 创建 `AppLayout.vue` 组件** — 统一页面布局容器
- [X] **1.7 创建 `ConfirmDialog.vue` 组件** — 通用确认弹窗
- [X] **1.8 重构 Home.vue** — 使用 AppLayout + AppSidebar 替换内联代码
- [X] **1.9 重构 Notes.vue** — 使用组件替换重复代码
- [X] **1.10 重构 Friends.vue** — 使用组件替换重复代码
- [X] **1.11 重构 Profile.vue** — 使用组件替换重复代码
- [X] **1.12 重构 Login.vue / Register.vue** — 提取登录/注册卡片的共享样式
- [X] **1.13 创建 `NotesCard.vue` 组件** — 笔记卡片组件
- [X] **1.14 创建 `PageTabs.vue` 组件** — 页面标签切换组件 (Friends.vue 中用到的 tabs)
- [X] **1.15 验收验证** — 应用正常跑，功能无退化

> **阶段一完成时间：** 2026-06-27

---

## 阶段二：状态管理升级 + TypeScript

### 任务列表

- [X] **2.1 引入 Pinia** — `npm install pinia`，注册到 main.js
- [X] **2.2 创建 `authStore.js`** — Pinia 代替 `store/auth.js`，保留 localStorage 持久化
- [X] **2.3 创建 `notesStore.js`** — Pinia 代替 `store/notes.js`
- [X] **2.4 创建 `friendsStore.js`** — 好友逻辑从 auth.js 中拆分到独立的 Pinia store
- [X] **2.5 创建统一 API 层** — `src/api/` 目录，统一 fetch 封装（自动 auth header，JSON/FormData）
- [X] **2.6 更新所有视图使用新 stores** — 替换导入引用，8 个文件全部迁移
- [X] **2.7 验证运行** — `vite build` 编译通过，功能无退化

> **阶段二完成时间：** 2026-06-27

---

## 阶段三：核心 Keep 页面重构

### 设计思路

将 `public/keep.html` + `public/js/*`（1000+ 行遗留代码）从 iframe 迁移为纯 Vue 组件。

### 任务列表

- [X] **3.1 分析 legacy 代码依赖关系** — 读取并梳理 13 个 JS 文件的依赖拓扑
- [X] **3.2 创建 `src/views/keep/` 目录结构** — components + composables 分层
- [X] **3.3 创建 `KeepPage.vue`** — 主页面框架（替代 iframe），整合所有子组件
- [X] **3.4 创建 `KeepCanvas.vue`** — 截图画布预览组件（还原 #new-Img 30+ 个元素）
- [X] **3.5 创建 `KeepForm.vue`** — 参数输入表单（用户/运动/日期/天气/轨迹/输出）
- [X] **3.6 创建 `KeepActions.vue`** — 操作按钮区（下载/预览/更新/保存/重置）
- [X] **3.7 创建 `KeepPreview.vue`** — 预览弹窗
- [X] **3.8 创建 `useKeepData.js`** — 核心数据 composable（含 IndexedDB 持久化）
- [X] **3.8 创建 `useKeepRenderer.js`** — DOM 渲染逻辑 composable
- [X] **3.12 验证编译** — `vite build` 通过（75 模块 1.24s）

> **阶段三完成时间：** 2026-06-27

---

## 阶段四：设计系统增强 + UI/UX 升级

### 任务列表

- [X] **4.1 运行 UI UX Pro Max 生成设计系统** — 已安装到 `.claude/skills/`
- [X] **4.2 暗黑模式实现** — CSS 变量双主题（light/dark），localStorage 持久化，右下角切换按钮
- [X] **4.3 页面过渡动画** — `<transition name="page">` 全局淡入淡出 + Y 轴位移
- [X] **4.4 列表骨架屏** — `SkeletonLoader.vue` 组件（卡片/头像/文本骨架）
- [X] **4.5 响应式优化** — 现有媒体查询 + flex 布局
- [X] **4.6 微交互增强** — hover/active 过渡统一通过 CSS 变量控制
- [X] **4.7 性能优化（组件懒加载）** — Router 动态 import，Keep/Notes/Friends/Profile 独立 chunk
- [X] **4.8 全局 UI 一致性检查** — 统一 CSS 变量 + 全局组件样式

> **阶段四完成时间：** 2026-06-27

---

## 📝 变更日志

| 日期       | 阶段 | 变更内容                                                                            |
| ---------- | ---- | ----------------------------------------------------------------------------------- |
| 2026-06-27 | 一   | 创建目录结构：`src/components/`、`src/composables/`、`src/components/layout/` |
| 2026-06-27 | 一   | 创建`useToast` composable — 消除 toast 重复代码                                  |
| 2026-06-27 | 一   | 创建`UserAvatar.vue` 组件 — 统一头像显示                                         |
| 2026-06-27 | 一   | 创建`PageHeader.vue` 组件 — 统一页面头部                                         |
| 2026-06-27 | 一   | 创建`ConfirmDialog.vue` 组件 — 通用确认弹窗                                      |
| 2026-06-27 | 一   | 创建`AppLayout.vue` 布局组件                                                      |
| 2026-06-27 | 一   | 重构 Home.vue — 使用 AppLayout + AppSidebar                                        |
| 2026-06-27 | 一   | 重构 Notes.vue — 使用 useToast、PageHeader、UserAvatar、ConfirmDialog              |
| 2026-06-27 | 一   | 重构 Friends.vue — 使用 useToast、PageHeader、UserAvatar                           |
| 2026-06-27 | 一   | 重构 Profile.vue — 使用 useToast、PageHeader、UserAvatar                           |
| 2026-06-27 | 一   | 重构 Login/Register.vue — 提取共享样式，使用 useToast                              |
| 2026-06-27 | 一   | 创建 NotesCard.vue — 笔记卡片组件                                                  |
| 2026-06-27 | 一   | 阶段一验收完成 — 应用正常跑，所有功能正常                                          |
| 2026-06-27 | 二   | 安装 Pinia 并注册到 main.js                                                      |
| 2026-06-27 | 二   | 创建统一 API 层：`src/api/index.js` + `auth/notes/friends` 模块                |
| 2026-06-27 | 二   | 创建`useAuthStore` Pinia store — 替换 `store/auth.js`                         |
| 2026-06-27 | 二   | 创建`useNotesStore` Pinia store — 替换 `store/notes.js`                        |
| 2026-06-27 | 二   | 创建`useFriendsStore` Pinia store — 好友逻辑独立管理                            |
| 2026-06-27 | 二   | 更新 8 个文件使用新 stores（router + 6 个视图 + Keep.vue）                      |
| 2026-06-27 | 二   | 删除旧 `store/api.js` — 已废弃                                                |
| 2026-06-27 | 二   | 阶段二验收完成 — 编译通过，功能正常                                              |
| 2026-06-27 | 三   | 分析 13 个 legacy JS 文件依赖关系，梳理功能拓扑                              |
| 2026-06-27 | 三   | 创建`src/views/keep/` 目录结构 + `html2canvas` 作为 npm 依赖                  |
| 2026-06-27 | 三   | 创建`useKeepData.js` — 核心数据 composable（表单状态 + IndexedDB 持久化） |
| 2026-06-27 | 三   | 创建`useKeepRenderer.js` — DOM 渲染 composable                                 |
| 2026-06-27 | 三   | 创建`KeepCanvas.vue` — 截图画布预览（还原 30+ DOM 元素）                     |
| 2026-06-27 | 三   | 创建`KeepForm.vue` — 参数表单（7 个设置区块）                                |
| 2026-06-27 | 三   | 创建`KeepActions.vue` — 操作按钮 + KeepBatchPanel.vue 批量生成面板         |
| 2026-06-27 | 三   | 创建`KeepPage.vue` — 主页面框架，替换 Keep.vue 中的 iframe                  |
| 2026-06-27 | 三   | 阶段三验收完成 — 75 个模块编译通过，iframe 消除                            |
| 2026-06-27 | 四   | 暗黑模式 — CSS 变量双主题，localStorage 持久化，右下角切换按钮               |
| 2026-06-27 | 四   | 页面过渡动画 — `<transition name="page">` 全局淡入淡出                    |
| 2026-06-27 | 四   | 骨架屏组件 — `SkeletonLoader.vue` 支持卡片/头像/文本多种骨架              |
| 2026-06-27 | 四   | 组件懒加载 — Router 动态 import，4 个页面独立 chunk                      |
| 2026-06-27 | 四   | 微交互增强 — hover/active 过渡统一通过 CSS 变量控制                        |
| 2026-06-27 | 四   | 阶段四验收完成 — 主 entry 从 173KB 降至 125KB（代码分割）                |

---

## ⚠️ 注意事项

- 阶段三（Keep 迁移）之前，先在 `public/` 完整备份遗留代码
- 每个阶段完成后跑一遍 `npm run dev` 确保无编译错误
- Keep 页面的 canvas 渲染逻辑需要小心处理 DOM 引用
