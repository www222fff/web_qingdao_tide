# project.config.json 配置说明

## 必须修改的项

### 1. appid (必需)

```json
"appid": "YOUR_APP_ID"
```

**说明**: 你的微信小程序AppID

**获取方式**:
1. 登录 [微信小程序管理平台](https://mp.weixin.qq.com/)
2. 左侧菜单 → "开发" → "开发设置"
3. 查找 "App ID"

**示例**:
```json
"appid": "wx1234567890abcdef"
```

### 2. projectname (可选)

```json
"projectname": "qingdao-tide-miniapp"
```

**说明**: 项目名称，仅用于本地区分

### 3. description (可选)

```json
"description": "青岛潮汐数据微信小程序"
```

**说明**: 项目描述

## miniprogramRoot 配置

```json
"miniprogramRoot": "dist/weapp/"
```

**说明**: 小程序代码目录，指向编译输出的目录

**重要**: 不要修改这个值，否则微信开发者工具无法识别项目

## 开发工具设置 (setting)

### 编译相关
```json
"es6": true,          // 支持ES6语法
"enhance": true,      // 增强编译
"postcss": true,      // 支持PostCSS
"minified": true      // 压缩代码
```

### 网络请求
```json
"urlCheck": true      // 检查网络请求合法性
```

> **重要**: 需要在微信小程序后台配置请求域名白名单

### Scope Data 检查
```json
"scopeDataCheck": false   // 关闭作用域数据检查
```

### API 支持
```json
"useApiHook": true       // 使用API Hook
"useApiHostProcess": true // 使用API主机流程
```

## 网络白名单配置

完成以下步骤后，才能在小程序中发送网络请求：

### 1. 登录微信小程序管理平台

访问 [mp.weixin.qq.com](https://mp.weixin.qq.com/)

### 2. 进入开发设置

```
左侧菜单 → 开发 → 开发设置
```

### 3. 配置请求合法域名

**需要添加的域名**:
```
https://marine-api.open-meteo.com
```

**操作步骤**:
1. 找到 "服务器域名" 部分
2. 点击 "修改" 按钮
3. 在 "request 合法域名" 中添加上述URL
4. 点击 "保存"

**注意事项**:
- 只能配置https域名
- 最多配置20个域名
- 修改后需要等待5分钟左右生效
- 不支持IP地址

## 编译器配置

### useCompilerModule (必需)

```json
"useCompilerModule": true
```

**说明**: 使用编译器模块，Taro项目需要启用此选项

### babelSetting

```json
"babelSetting": {
  "ignore": [],
  "disablePlugins": [],
  "outputPath": ""
}
```

**说明**: Babel转换配置，通常无需修改

## 其他重要设置

### nodeModules

```json
"nodeModules": false
```

**说明**: 小程序不使用node_modules，由Taro打包处理

### enableEngineNative

```json
"enableEngineNative": false
```

**说明**: 关闭原生引擎，使用Web视图

### useIsolateContext

```json
"useIsolateContext": true
```

**说明**: 使用隔离上下文，提高安全性

## 编辑器设置 (editorSetting)

```json
"editorSetting": {
  "tabIndent": "insertSpaces",
  "tabSize": 2
}
```

**说明**: 微信开发者工具的编辑器设置

## 完整配置示例

```json
{
  "miniprogramRoot": "dist/weapp/",
  "projectname": "qingdao-tide-miniapp",
  "description": "青岛潮汐数据微信小程序",
  "appid": "wx1234567890abcdef",
  "setting": {
    "urlCheck": true,
    "es6": true,
    "enhance": true,
    "postcss": true,
    "preloadBackgroundData": false,
    "minified": true,
    "newFeature": true,
    "coverView": true,
    "nodeModules": false,
    "autoAudits": false,
    "showShadowRootInWxmlPanel": true,
    "scopeDataCheck": false,
    "uglifyFileName": false,
    "checkInvalidKey": true,
    "checkSiteMap": true,
    "uploadWithSourceMap": true,
    "compileHotReLoad": false,
    "useMultiFrameRuntime": true,
    "useApiHook": true,
    "useApiHostProcess": true,
    "useIsolateContext": true,
    "useCompilerModule": true,
    "ignoreUploadUnusedFiles": true,
    "babelSetting": {
      "ignore": [],
      "disablePlugins": [],
      "outputPath": ""
    }
  },
  "compileType": "miniprogram",
  "simulatorType": "wechat",
  "editorSetting": {
    "tabIndent": "insertSpaces",
    "tabSize": 2
  }
}
```

## 常见问题

### Q: 修改了appid后没有反应？
A: 需要关闭微信开发者工具，重新打开项目目录。

### Q: 网络请求还是被拒绝？
A: 
1. 检查域名是否正确配置
2. 等待5分钟，配置可能未生效
3. 清除微信开发者工具缓存

### Q: 为什么miniprogramRoot不能改？
A: Taro的编译输出结构是固定的，修改会导致项目无法识别。

### Q: 能否添加更多请求域名？
A: 可以，微信最多支持20个请求域名。

### Q: 本地开发时需要配置白名单吗？
A: 不需要，只在正式版本需要。但建议开发时也配置以避免问题。

## 调试技巧

### 查看网络请求

在微信开发者工具中：
1. 点击右上角 "调试" 按钮
2. 打开开发者工具
3. 切换到 "Network" 标签
4. 发送请求时可以查看详情

### 查看存储数据

开发者工具 → "Storage" 标签 → "LocalStorage/SessionStorage"

### 查看日志

开发者工具 → "Console" 标签

## 最佳实践

1. **立即配置AppID**: 避免后期忘记
2. **提前配置白名单**: 开发初期就配置，避免后期问题
3. **定期检查配置**: 发布前复查所有设置
4. **保留备份**: 保存好project.config.json的多个版本
5. **团队协作**: 如有多人开发，统一配置标准

## 参考资源

- [微信官方配置说明](https://developers.weixin.qq.com/miniprogram/dev/devtools/projectconfig.html)
- [微信小程序开发指南](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [Taro配置文档](https://taro-docs.jd.com/docs/config)

---

**更新日期**: 2024年

**版本**: 1.0.0
