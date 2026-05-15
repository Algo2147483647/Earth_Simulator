# Earth Simulator

基于 CesiumJS、React 和 TypeScript 的数字地球可视化项目。

## Quick Start

```bash
npm install
npm run dev
```

默认开发地址：

```text
http://127.0.0.1:5173/
```

如果端口被占用，可以手动指定：

```bash
npm run dev -- --port 5180 --strictPort
```

## Scripts

- `npm run dev`：同步 Cesium 静态资源并启动 Vite 开发服务器。
- `npm run build`：同步 Cesium 静态资源、类型检查并构建生产产物。
- `npm run typecheck`：运行 TypeScript 类型检查。
- `npm run sync:cesium`：把 Cesium 运行时资源复制到 `public/cesium/`。

## Architecture

- `src/app/`：React 应用入口和主界面。
- `src/globe/`：Cesium Viewer、图层生命周期和全局地球状态。
- `src/features/visited/`：访问城市数据加载与类型定义。
- `src/features/routes/`：基于大圆距离的最小生成树路线计算。
- `public/data/visited-cities.json`：清洗后的访问城市数据。

## Notes

当前机器 Node 版本是 16.x，因此 Cesium 固定在 `1.109.0`，并固定了 Cesium 子包版本，避免 npm 解析到需要更高 Node 版本的依赖。

原始 Three.js 静态原型仍保留在 `src/*.js` 和 `src/*.html` 中，新的 React/Cesium 应用入口是根目录的 `index.html` 与 `src/main.tsx`。
