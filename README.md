# AI 学习与网络搭建练习

React、TypeScript 与 Vinext 实现的中文练习网站，包含理论题、HourglassNet 和 ResNet 网络搭建。

- 理论题作答、解析与错题回顾。
- 算子拖放、连线、参数编辑和本机草稿保存。
- 题目与参考答案弹窗、逐步搭建动画、模块参数查看。
- 本地参考评分与改进提示。评分不运行神经网络，也不是源平台官方成绩。

## 本地启动

安装 Node.js 22.13 或更高版本，然后运行：

```sh
npm ci
npm run dev
```

访问终端显示的本地地址。理论题位于 `/`，实操题位于 `/practical` 和 `/practical/resnet`。

构建与预览：

```sh
npm run build
npm start
```

Windows 用户可在安装依赖并构建后运行 `start-local.cmd`，在 3000 端口启动本地预览。防火墙脚本仅供需要局域网访问时自行使用。

## 检查

```sh
npx tsc --noEmit
node --experimental-strip-types check-scoring.mjs
node --experimental-strip-types check-network.mjs
node --experimental-strip-types check-grading.mjs
```

## 数据与隐私

练习进度和网络草稿保存在当前浏览器，不会随源码上传。个人托管配置 `.openai/hosting.json`、环境变量、依赖、日志、构建产物和编译缓存均已排除；没有该托管配置也可本地构建。

`app/questions.json` 包含题目与答案。`import_questions.py` 用于从项目上一级目录中的 Excel 文件重新生成题库，需要额外安装 Python 的 `openpyxl`；仓库不包含原始 Excel 文件。

参考结构及参数的来源和推导限制见页面说明。题目内容保留原有来源属性，本仓库未为第三方题目授予额外许可。
