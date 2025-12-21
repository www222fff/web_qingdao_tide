import { getTideData } from '../api/openMeteo';
import { TideData, TideDay } from '../types/tide';

/**
 * 极值检测（高潮 / 低潮）
 */
function findExtrema(data: number[]): { high: number[]; low: number[] } {
  const high: number[] = [];
  const low: number[] = [];

  for (let i = 1; i < data.length - 1; i++) {
    if (data[i] > data[i - 1] && data[i] > data[i + 1]) {
      high.push(i);
    }
    if (data[i] < data[i - 1] && data[i] < data[i + 1]) {
      low.push(i);
    }
  }

  return { high, low };
}

/* ================= 月相（朔望）修正 ================= */

// 天文参考新月（UTC）
const BASE_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14, 0);
const LUNAR_CYCLE = 29.530588 * 24 * 3600 * 1000;

// 0.75 ~ 1.25（青岛经验）
function getMoonFactor(dateStr: string): number {
  const date = new Date(dateStr + 'T12:00:00+08:00');
  const diff = (date.getTime() - BASE_NEW_MOON) % LUNAR_CYCLE;
  const phase = diff / LUNAR_CYCLE;
  const angle = phase * 2 * Math.PI;

  return 1 + 0.25 * Math.cos(angle);
}

/* ================= 近地点 / 远地点修正 ================= */

// 月球近地点周期 ≈ 27.55455 天
const BASE_PERIGEE = Date.UTC(2000, 0, 10, 0, 0, 0); // 参考近地点
const PERIGEE_CYCLE = 27.55455 * 24 * 3600 * 1000;

// 0.95 ~ 1.05（国家预报同级量）
function getPerigeeFactor(dateStr: string): number {
  const date = new Date(dateStr + 'T12:00:00+08:00');
  const diff = (date.getTime() - BASE_PERIGEE) % PERIGEE_CYCLE;
  const phase = diff / PERIGEE_CYCLE;
  const angle = phase * 2 * Math.PI;

  return 1 + 0.05 * Math.cos(angle);
}

/* ================= 汛型判断（终极版） ================= */
function getTideType(dateStr: string, dayHeights: number[]): string {
  const { high, low } = findExtrema(dayHeights);

  let avgHigh: number;
  let avgLow: number;

  if (high.length >= 1 && low.length >= 1) {
    // ✅ 优先用真实高潮 / 低潮
    const highs = high.map(i => dayHeights[i]);
    const lows = low.map(i => dayHeights[i]);

    avgHigh = highs.reduce((a, b) => a + b, 0) / highs.length;
    avgLow = lows.reduce((a, b) => a + b, 0) / lows.length;
  } else {
    // 🔻 退化方案（国家预报也会这么干）
    avgHigh = Math.max(...dayHeights);
    avgLow = Math.min(...dayHeights);
  }

  let tideRange = avgHigh - avgLow;

  // 🌙 朔望修正
  tideRange *= getMoonFactor(dateStr);

  // 🌓 近地点修正
  tideRange *= getPerigeeFactor(dateStr);

  tideRange = +tideRange.toFixed(2);

  if (tideRange >= 4.3) return `超级大活汛 (潮差${tideRange}m) 🔥`;
  if (tideRange >= 4.0) return `大活汛 (潮差${tideRange}m) ⚡`;
  if (tideRange >= 3.5) return `中大汛 (潮差${tideRange}m)`;
  if (tideRange >= 3.0) return `中汛 (潮差${tideRange}m)`;
  if (tideRange >= 2.5) return `小汛 (潮差${tideRange}m)`;
  if (tideRange >= 2.0) return `小死汛 (潮差${tideRange}m) 💤`;
  return `死汛 (潮差${tideRange}m) 😴`;
}

/* ================= 主入口 ================= */

export const fetchTideData = async (): Promise<TideDay[]> => {
  try {
    const response = await getTideData();

    if (!response?.hourly?.time || !response.hourly.sea_level_height_msl) {
      throw new Error('Invalid API response structure');
    }

    const times = response.hourly.time;
    const heights = response.hourly.sea_level_height_msl;

    // 按天分组
    const daysMap: Record<string, { time: string; height: number }[]> = {};
    times.forEach((time: string, idx: number) => {
      const date = time.slice(0, 10);
      if (!daysMap[date]) daysMap[date] = [];
      daysMap[date].push({ time, height: heights[idx] });
    });

    // 前 7 天
    const dayKeys = Object.keys(daysMap).slice(0, 7);

    const result: TideDay[] = dayKeys.map(date => {
      const dayArr = daysMap[date];
      const dayHeights = dayArr.map(d => d.height);
      const extrema = findExtrema(dayHeights);

      return {
        date,
        type: getTideType(date, dayHeights),
        data: dayArr.map((d, idx) => ({
          time: d.time,
          height: d.height,
          type: extrema.high.includes(idx)
            ? '高潮'
            : extrema.low.includes(idx)
            ? '低潮'
            : '',
        })),
      };
    });

    return result;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`Data processing error: ${errMsg}`);
  }
};

