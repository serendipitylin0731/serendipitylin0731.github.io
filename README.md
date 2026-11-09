# 林函锋 · Hanfeng Lin

个人主页，基于 `https://github.com/serendipitylin0731/serendipitylin0731` 的内容与视觉素材制作，可直接由 GitHub Pages 从仓库根目录提供服务。

- 中英双语：页面右上角切换，英文页面也可通过 `?lang=en` 打开。
- 明暗主题：默认跟随系统偏好，可手动切换并保存选择。
- 响应式布局：适配桌面和手机；手机上可横向滚动查看完整学习时间轴。
- 分页浏览：“关于我”和“学习经历”合为一部分，其余主要部分各占一部分。长内容自动分成多屏，滚轮、上下滑动或 Page Up / Page Down 逐屏切换；内容页按钮可在同一部分内切换。启用 JavaScript 时页面不纵向滚动，关闭 JavaScript 时保留普通纵向浏览。
- 项目页按 VS Code 插件、软件、近期项目和资料分享分类切换，保留项目轮播和全部链接。
- 已结项项目：VS Code 插件与软件以透视轮播展示，当前项目两侧显示相邻项目，支持自动切换以及按钮、键盘方向键和横向滑动；键盘聚焦或阅读后续屏幕时暂停自动切换。

本地预览：

```bash
python3 -m http.server 8000
```

然后打开 `http://localhost:8000/`。

`assets/` 中的主页横幅、分隔线和时间轴 SVG 来自原 GitHub 个人简介引用的素材；全部已结项项目及两张资料分享卡片的插图采用统一的 600×360 SVG 界面风格，提供深浅色版本。新增插图可运行 `python3 tools/generate-project-visuals.py` 重新生成。 中英文深浅色时间轴可运行 `python3 tools/generate-timeline.py` 重新生成。原有技术图标已从简介使用的 skillicons.dev 保存为本地 SVG，避免页面加载时依赖第三方服务。新增图标也保存在本地：WSL（Windows 图标）、GCC、Jupyter、LabVIEW 来自 [Devicon](https://github.com/devicons/devicon)；Mermaid 来自 [Simple Icons](https://github.com/simple-icons/simple-icons)；Origin 使用官网 favicon；GeoGebra 使用其[官方 SVG](https://github.com/geogebra/images/blob/main/geogebra-logo.svg)。各名称与标志归其权利人所有；GeoGebra 图标按其[许可说明](https://www.geogebra.org/license)使用。

横幅和学习时间轴使用 SVG 文档嵌入，以保留学校名称上的可点击链接。
