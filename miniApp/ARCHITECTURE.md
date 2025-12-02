# 项目架构文档

## 系统架构概览

```
┌─────────────────────────────────────────────────────┐
│                   微信小程序                          │
├─────────────────────────────────────────────────────┤
│                   Pages (页面层)                      │
│                  src/pages/index/                    │
├─────────────────────────────────────────────────────┤
│                Components (组件层)                    │
│              src/components/TideChart                │
├─────────────────────────────────────────────────────┤
│              Utils & Services (业务逻辑)              │
│  ┌──────────────┬──────────────────┬──────────────┐ │
│  │ fetchTideData│  canvasChart     │   helpers    │ │
│  └──────────────┴──────────────────┴──────────────┘ │
├─────────────────────────────────────────────────────┤
│                  API Layer (API层)                   │
│                 src/api/openMeteo                   │
├─────────────────────────────────────────────────────┤
│                  External Services                   │
│     Open-Meteo Marine API (潮汐数据源)              │
└─────────────────────────────────────────────────────┘
```

## 分层设计

### 1. 表现层 (UI Layer)
**位置**: `src/pages/` 和 `src/components/`

**职责**:
- 页面布局和结构
- 组件渲染
- 用户交互处理
- 状态管理（useState）

**主要文件**:
- `pages/index/index.tsx` - 首页
- `components/TideChart/index.tsx` - 图表组件

### 2. 业务逻辑层 (Business Logic Layer)
**位置**: `src/utils/`

**职责**:
- 数据处理和转换
- 算法实现（汛型判断、极值检测）
- 工具函数（日期转换、格式化）
- 图表绘制逻辑

**主要文件**:
- `utils/fetchTideData.ts` - 数据获取和处理流程
- `utils/canvasChart.ts` - Canvas图表渲染引擎
- `utils/helpers.ts` - 辅助函数

### 3. 数据访问层 (Data Access Layer)
**位置**: `src/api/`

**职责**:
- 外部API调用
- 网络请求处理
- 错误处理
- 数据转换

**主要文件**:
- `api/openMeteo.ts` - Open-Meteo API封装

### 4. 类型和配置层
**位置**: `src/types/` 和 `src/`

**职责**:
- TypeScript类型定义
- 应用配置
- 全局样式

## 数据流

### 初始化流程

```
App Start
  ↓
IndexPage mounted
  ↓
useEffect triggered
  ↓
fetchTideData()
  ↓
getTideData() → Taro.request()
  ↓
Open-Meteo API
  ↓
数据处理 (findExtrema, getTideType)
  ↓
组织为 TideDay[] 格式
  ↓
setState(tideDays)
  ↓
页面重新渲染
  ↓
TideChart 组件接收 data
  ↓
Canvas 绘制 (TideChartRenderer)
  ↓
显示页面
```

### 数据处理流程

```
原始API响应
{
  hourly: {
    time: ['2025-01-01T00:00', ...],
    sea_level_height_msl: [1.5, 2.1, ...]
  }
}
  ↓
按日期分组 (daysMap)
  ↓
对每一天:
  - findExtrema() → 检测高低潮
  - getTideType() → 计算潮差和汛型
  ↓
转换为 TideDay[]
  ↓
取前7天
  ↓
返回结果
```

## 核心模块详解

### 1. TideChartRenderer (图表渲染器)

**职责**: 使用Canvas绘制潮汐曲线

**核心方法**:
```typescript
constructor(data: TideData[], config: ChartConfig)
  // 初始化，计算边界和坐标

calculateBounds()
  // 计算数据的最小值和最大值

calculatePoints()
  // 将数据映射到Canvas坐标系

drawChart(ctx: CanvasRenderingContext2D)
  // 绘制完整图表

drawBackground()    // 背景
drawGridLines()     // 网格线
drawAxes()          // 坐标轴
drawTideArea()      // 潮汐区域填充
drawCurve()         // 曲线
drawPoints()        // 数据点
drawLabels()        // 时间标签
```

**特点**:
- 自适应坐标系
- 支持自定义配置
- 高性能绘制

### 2. fetchTideData (数据获取)

**流程**:
1. 调用 `getTideData()` 获取API数据
2. 验证数据结构
3. 按日期分组数据
4. 对每一天进行数据处理：
   - 检测高潮/低潮点
   - 计算潮差和汛型
5. 返回处理后的 `TideDay[]`

**汛型判断算法**:
```
1. 过滤有效数据（青岛合理范围：-2~7m）
2. 计算当天最高10%和最低10%的平均值
3. 计算潮差 = 高平均 - 低平均
4. 根据潮差判断汛型：
   - >= 4.3m: 超级大活汛
   - >= 4.0m: 大活汛
   - >= 3.5m: 中大汛
   - >= 3.0m: 中汛
   - >= 2.5m: 小汛
   - >= 2.0m: 小死汛
   - < 2.0m: 死汛
```

### 3. 日期和农历转换

**使用库**: `lunar-javascript`

**功能**:
- 公历 → 农历转换
- 获取农历月份中文表示
- 获取农历日期中文表示

**示例**:
```
2025-01-01 → 十一月初三
```

## 类型定义

```typescript
// 单个潮汐数据点
interface TideData {
  time: string;      // ISO 8601 格式时间
  height: number;    // 潮汐高度（米）
  type: string;      // '高潮' | '低潮' | ''
}

// 一天的潮汐数据
interface TideDay {
  date: string;      // YYYY-MM-DD 格式
  type: string;      // 汛型描述
  data: TideData[];  // 该天所有数据点
}

// Canvas图表配置
interface ChartConfig {
  width: number;     // 画布宽度
  height: number;    // 画布高度
  padding: number;   // 边距
  gridLines: boolean; // 是否显示网格线
}
```

## 组件树

```
App
└── IndexPage
    ├── Loading State / Error State / Data State
    ├── Title Section
    │   └── "Tide Height (m)" Label
    ├── Main Title
    │   └── "青岛未来一周潮汐数据"
    ├── TideChart[] (7 days)
    │   ├── Date Header
    │   ├── Tide Info (High/Low times)
    │   └── Canvas
    ├── Camera Section
    │   ├── Camera Card (石老人)
    │   ├── Camera Card (栈桥)
    │   └── Camera Card (小麦岛)
    └── Footer
        └── Copyright
```

## 样式系统

### CSS模块化
每个组件有自己的 `.module.scss` 文件：
- `pages/index/index.module.scss`
- `components/TideChart/index.module.scss`

### 全局样式
- `app.scss` - 全局背景、字体等

### 样式变量
可在 `app.scss` 或各模块中定义常用的颜色和间距：
```scss
$primary-color: #1a5490;
$border-color: rgba(100, 180, 220, 0.3);
$padding-large: 32px;
```

## 性能优化

### 已实现的优化
1. **按需渲染**: 仅显示前7天数据
2. **Canvas缓存**: 每个图表单独的Canvas元素
3. **事件优化**: 使用React.memo 防止不必要重新渲染

### 可进一步优化
1. **数据缓存**: 使用 Taro.storage 缓存API响应
2. **虚拟列表**: 数据量大时使用虚拟滚动
3. **图片懒加载**: 使用 IntersectionObserver
4. **预加载**: 预先加载明天的数据

## 错误处理

### 三层错误处理

**API层** (`openMeteo.ts`):
```typescript
try {
  const response = await Taro.request();
  // 检查statusCode
} catch (error) {
  // 网络错误
  throw error;
}
```

**业务逻辑层** (`fetchTideData.ts`):
```typescript
try {
  const response = await getTideData();
  // 验证数据结构
} catch (error) {
  // 数据错误
  throw error;
}
```

**UI层** (`IndexPage`):
```typescript
try {
  const data = await fetchTideData();
  setTideDays(data);
} catch (err) {
  setError('Failed to fetch tidal data');
}
```

## 扩展点

### 添加新功能

1. **新页面**:
   - 在 `src/pages/` 创建新目录
   - 添加页面组件
   - 在 `app.config.ts` 注册路由

2. **新API**:
   - 在 `src/api/` 创建新文件
   - 实现API调用逻辑
   - 导出函数供业务逻辑层使用

3. **新组件**:
   - 在 `src/components/` 创建新目录
   - 实现组件逻辑
   - 导出后在页面中使用

4. **新工具函数**:
   - 在 `src/utils/` 添加新文件
   - 实现工具函数
   - 在需要的地方导入使用

## 依赖关系

```
UI层 (Pages, Components)
  ↓
  业务逻辑层 (Utils)
  ↓
  API层 (API)
  ↓
  Taro框架
  ↓
  微信小程序API
```

**关键原则**: 上层依赖下层，下层不依赖上层（单向依赖）

## 测试策略

### 单元测试
- 工具函数 (`helpers.ts`, `fetchTideData.ts`)
- 算法函数 (`findExtrema`, `getTideType`)

### 集成测试
- API + 数据处理
- 页面 + 组件

### E2E测试
- 完整用户流程（打开应用 → 查看数据）
- 微信开发者工具中手动测试

---

**更新日期**: 2024

**版本**: 1.0.0
