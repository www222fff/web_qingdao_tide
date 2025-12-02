# 快速开始指南

本指南将帮助你快速开始开发和构建Taro微信小程序版本的青岛潮汐数据应用。

## 前置要求

- Node.js >= 12.0
- npm 或 yarn
- 微信开发者工具（用于测试和调试）

## 安装步骤

### 1. 安装依赖

```bash
cd miniApp
npm install
```

或使用yarn：

```bash
cd miniApp
yarn install
```

### 2. 开发模式

启动微信小程序开发编译：

```bash
npm run dev:weapp
```

此命令会：
- 监听文件变化
- 自动编译TypeScript和SCSS
- 输出到 `dist/weapp/` 目录

### 3. 使用微信开发者工具

1. 打开微信开发者工具
2. 选择"小程序"项目
3. 点击"+"新建项目
4. 项目名称：`qingdao-tide-miniapp`
5. 项目目录：选择 `miniApp/dist/weapp`
6. AppID：可选（开发阶段可空）
7. 后端服务：关闭
8. 点击"新建"

开发者工具会自动刷新预览代码。

## 开发工作流

### 编辑代码

所有源代码在 `miniApp/src/` 目录下：

```
src/
├── pages/index/           # 首页
├── components/            # 组件（TideChart）
├── api/                  # API调用
├── utils/                # 工具函数
├── types/                # TypeScript类型
├── app.ts                # 应用入口
├── app.config.ts         # 应用配置
└── app.scss              # 全局样式
```

### 修改配置

修改 `app.config.ts` 来配置：
- 页面路由
- 导航栏样式
- 窗口样式
- 权限设置等

### 查看效果

微信开发者工具左侧预览窗口会自动刷新。

## 常用命令

```bash
# 开发模式 - 微信小程序
npm run dev:weapp

# 开发模式 - H5预览
npm run dev:h5

# 生产构建 - 微信小程序
npm run build:weapp

# 生产构建 - H5
npm run build:h5

# 构建DLL文件（加快编译）
npm run build:dll
```

## 构建和发布

### 生成小程序包

```bash
npm run build:weapp
```

输出文件在 `dist/weapp/` 目录，可直接用微信开发者工具打开。

### 上传到小程序后台

1. 在微信开发者工具中打开 `dist/weapp` 目录
2. 点击"上传"按钮
3. 填写版本号和项目备注
4. 确认上传

### 设置体验版或发布

1. 登录微信小程序管理后台
2. 在"版本管理"页面查看上传的版本
3. 选择"提交审核"或"发布"

## 常见问题

### Q: 如何修改导航栏颜色？
A: 编辑 `src/app.config.ts` 中的 `window` 配置：
```typescript
window: {
  navigationBarBackgroundColor: '#1a5490',  // 修改这里
}
```

### Q: 如何添加新页面？
A: 
1. 在 `src/pages/` 创建新目录（如 `about`）
2. 创建 `about/index.tsx`
3. 在 `src/app.config.ts` 的 `pages` 数组中添加 `'pages/about/index'`

### Q: 如何调试代码？
A: 在微信开发者工具中：
1. 点击右上角"调试"按钮
2. 打开开发者工具
3. 在"Console"标签查看日志
4. 可使用 `console.log()` 输出调试信息

### Q: 如何处理网络请求错误？
A: 错误处理已在 `src/utils/fetchTideData.ts` 中实现，会返回错误提示。

### Q: 图片无法显示？
A: 
1. 检查 `project.config.json` 中的 `miniprogramRoot` 设置
2. 确保图片路径正确（相对于 `dist/weapp/`）
3. 验证图片资源是否被正确打包

## 项目结构说明

### src/pages/index/
首页组件，包含：
- 潮汐数据列表
- 摄像头实时图像
- 页面样式

### src/components/TideChart/
潮汐图表组件，包含：
- Canvas图表渲染
- 高潮/低潮信息显示
- 日期和汛型显示

### src/utils/
工具函数：
- `fetchTideData.ts` - 数据获取和处理
- `helpers.ts` - 日期格式化等辅助函数
- `canvasChart.ts` - Canvas图表绘制引擎

### src/api/
API调用：
- `openMeteo.ts` - Open-Meteo天气API封装

### src/types/
TypeScript类型定义

## 性能优化建议

1. **缓存数据**：使用 `Taro.getStorageSync()` 缓存潮汐数据
2. **图片优化**：压缩摄像头图像，使用适当的尺寸
3. **懒加载**：对多个图表使用虚拟列表
4. **减少重绘**：避免在每次render时重新绘制Canvas

## 下一步

- 参考 `CONVERSION_GUIDE.md` 了解Web到小程序的转换细节
- 参考 `MIGRATION_CHECKLIST.md` 完成发布前的检查
- 查看 `README.md` 获取更多项目信息

## 获取帮助

- Taro官方文档：https://taro-docs.jd.com/
- Taro社区：https://github.com/NervJS/taro
- 微信小程序官方文档：https://developers.weixin.qq.com/miniprogram/

---

**祝你开发愉快！** 🎉
