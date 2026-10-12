# 林函锋 · Hanfeng Lin

个人主页，基于 `https://github.com/serendipitylin0731/serendipitylin0731` 的内容与视觉素材制作，可直接由 GitHub Pages 从仓库根目录提供服务。

- 中英双语：页面右上角切换，英文页面也可通过 `?lang=en` 打开。
- 明暗主题：默认跟随系统偏好，可手动切换并保存选择。
- 响应式布局：适配桌面和手机；手机上可横向滚动查看完整学习时间轴。
- 已结项项目：桌面一次展示三张卡片，定时向左循环切换一张；支持按钮和触屏操作。

本地预览：

```bash
python3 -m http.server 8000
```

然后打开 `http://localhost:8000/`。

`assets/` 中的主页横幅、分隔线和时间轴 SVG 来自原 GitHub 个人简介引用的素材；前三个项目插图为适配网页卡片重新绘制，其余项目使用 CSS 图形；原有技术图标已从简介使用的 skillicons.dev 保存为本地 SVG，避免页面加载时依赖第三方服务。新增图标也保存在本地：WSL（Windows 图标）、GCC、Jupyter、LabVIEW 来自 [Devicon](https://github.com/devicons/devicon)；Mermaid 来自 [Simple Icons](https://github.com/simple-icons/simple-icons)；Origin 使用官网 favicon；GeoGebra 使用其[官方 SVG](https://github.com/geogebra/images/blob/main/geogebra-logo.svg)。各名称与标志归其权利人所有；GeoGebra 图标按其[许可说明](https://www.geogebra.org/license)使用。

横幅和学习时间轴使用 SVG 文档嵌入，以保留学校名称上的可点击链接。
