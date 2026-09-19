# PUBG RangeFinder — 本地版

[English](README.md) | **简体中文**

这是一个可在本地运行的 PUBG 距离测量工具，参考页面：
<https://rangefinder.pages.dev/rondo>。

本应用使用 HTML Canvas 显示高清 PUBG 地图，并测量两个标记点之间的直线距离。

## 环境要求

- Node.js 18 或更高版本
- npm

## 本地运行

```bash
npm install
npm start
```

`npm install` 会自动运行安装后脚本，将 `asset-chunks/` 中的无损分块重新组合成完整的高清地图图片。请不要使用 `npm install --ignore-scripts`，否则地图资源不会被恢复。

然后打开 Vite 在终端中显示的地址（通常是 <http://localhost:5173>），也可以直接访问 <http://localhost:5173/rondo>。

## 操作方法

- 在地图上**单击鼠标右键两次**，放置两个距离标记点。
- 再次**单击鼠标右键**，开始新的测量。
- **按住鼠标左键拖动地图**进行平移。
- 地图平移范围已限制在图片边界内，不会被拖出可视区域。
- **按住鼠标左键拖动标记点**，调整测量端点。
- 使用**鼠标滚轮**或 **+ / − 按钮**缩放地图。
- 通过顶部导航栏切换不同战场地图。

## 生产版本构建

```bash
npm run build
npm run preview
```

构建后的静态文件会生成在 `dist/` 目录中。

## 技术实现

- Vue 3、Vue Router、Vuex、TypeScript 和 Vite
- 使用 HTML Canvas 实现地图渲染、平移、缩放、标记点与距离测量显示
- 内置七张地图：Erangel、Miramar、Taego、Sanhok、Vikendi、Deston 和 Rondo
- 距离换算比例：原始地图每 1,024 像素对应游戏内 1,000 米
