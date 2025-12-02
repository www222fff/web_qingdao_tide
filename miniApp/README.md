# 青岛潮汐数据微信小程序 (Taro版本)

这是一个使用Taro框架开发的微信小程序，用于显示青岛地区的潮汐数据。

## 项目特点

- ✅ 使用Taro 3框架开发，支持微信小程序
- ✅ React编写业务逻辑
- ✅ Canvas绘制潮汐图表
- ✅ 农历日期展示
- ✅ 实时潮汐数据获取
- ✅ 响应式设计

## 项目结构

```
miniApp/
├── src/
│   ├── api/              # API调用模块
│   │   └── openMeteo.ts  # Open-Meteo天气API
│   ├── components/       # React组件
│   │   └── TideChart/    # 潮汐图表组件
│   ├── pages/            # 页面
│   │   └── index/        # 首页
│   ├── types/            # TypeScript类型定义
│   ├── utils/            # 工具函数
│   │   ├── canvasChart.ts    # Canvas图表绘制
│   │   ├── fetchTideData.ts  # 数据获取逻辑
│   │   └── helpers.ts        # 辅助函数
│   ├── app.ts            # 应用入口
│   ├── app.config.ts     # 应用配置
│   └── app.scss          # 全局样式
├── taro.config.ts        # Taro配置文件
├── tsconfig.json         # TypeScript配置
└── package.json          # 项目依赖
```

## 开发指南

### 安装依赖

```bash
npm install
# 或使用yarn
yarn install
```

### 开发模式

启动微信小程序开发服务：

```bash
npm run dev:weapp
```

启动H5预览：

```bash
npm run dev:h5
```

### 构建

构建微信小程序：

```bash
npm run build:weapp
```

构建H5版本：

```bash
npm run build:h5
```

## 功能说明

### 潮汐数据展示

- 获取青岛地区未来7天的潮汐数据
- 展示每日高潮和低潮的时间
- 根据潮差范围自动判断汛型（死汛、小汛、中汛等）
- 显示农历日期

### 图表绘制

使用Canvas API绘制潮汐曲线，特点：

- 平滑的曲线展示
- 高潮/低潮标点显示
- 网格线辅助
- 自适应坐标轴

### 实时图像

展示三个摄像头位置的实时图像：

- 石老人
- 栈桥
- 小麦岛

## 数据来源

潮汐数据来自 Open-Meteo API：https://marine-api.open-meteo.com/

坐标为青岛市（36.0649°N, 120.3804°E）

## 技术栈

- **Taro 3**: 跨端框架
- **React 18**: UI框架
- **TypeScript**: 类型安全
- **SCSS**: 样式预处理器
- **Canvas API**: 图表绘制
- **lunar-javascript**: 农历转换

## 注意事项

1. 微信小程序需要配置白名单URL：
   - `https://marine-api.open-meteo.com`

2. 图片资源需要上传到小程序服务器或使用CDN

3. Canvas绘制在小程序中可能有性能限制，大数据量时需要优化

## 许可证

MIT
