import { getTideData } from '../api/openMeteo';
import { TideData, TideDay } from '../types/tide';

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

function getTideType(dayHeights: number[]): string {
  const valid = dayHeights
    .filter(h => typeof h === 'number' && isFinite(h) && h >= -2 && h <= 7);

  if (valid.length < 10) return '数据不足';

  const sorted = [...valid].sort((a, b) => a - b);
  const len = sorted.length;

  const top10Count = Math.max(Math.floor(len * 0.1), 1);
  const bottom10Count = Math.max(Math.floor(len * 0.1), 1);

  const avgHigh = sorted.slice(-top10Count).reduce((a, b) => a + b, 0) / top10Count;
  const avgLow = sorted.slice(0, bottom10Count).reduce((a, b) => a + b, 0) / bottom10Count;

  const tideRange = +(avgHigh - avgLow).toFixed(2);

  if (tideRange >= 4.3) return `超级大活汛 (潮差${tideRange}m) 🔥`;
  if (tideRange >= 4.0) return `大活汛 (潮差${tideRange}m) ⚡`;
  if (tideRange >= 3.5) return `中大汛 (潮差${tideRange}m)`;
  if (tideRange >= 3.0) return `中汛 (潮差${tideRange}m)`;
  if (tideRange >= 2.5) return `小汛 (潮差${tideRange}m)`;
  if (tideRange >= 2.0) return `小死汛 (潮差${tideRange}m) 💤`;
  return `死汛 (潮差${tideRange}m) 😴`;
}

export const fetchTideData = async (): Promise<TideDay[]> => {
  try {
    console.error('[fetchTideData] Starting...');
    const response = await getTideData();
    console.error('[fetchTideData] Got response:', response);

    if (!response) {
      throw new Error('Response is null/undefined');
    }
    if (!response.hourly) {
      throw new Error('Response missing hourly field');
    }
    if (!response.hourly.time) {
      throw new Error('Response missing hourly.time array');
    }
    if (!response.hourly.sea_level_height_msl) {
      throw new Error('Response missing hourly.sea_level_height_msl array');
    }

    const times = response.hourly.time;
    const heights = response.hourly.sea_level_height_msl;

    console.error('[fetchTideData] Processing', times.length, 'time entries');

    const daysMap: { [date: string]: { time: string; height: number }[] } = {};
    times.forEach((time: string, idx: number) => {
      const date = time.slice(0, 10);
      if (!daysMap[date]) daysMap[date] = [];
      daysMap[date].push({ time, height: heights[idx] });
    });

    const dayKeys = Object.keys(daysMap).slice(0, 7);
    console.error('[fetchTideData] Grouped into', dayKeys.length, 'days');

    const result: TideDay[] = dayKeys.map(date => {
      const dayArr = daysMap[date];
      const dayHeights = dayArr.map(d => d.height);
      const extrema = findExtrema(dayHeights);
      const type = getTideType(dayHeights);
      return {
        date,
        type,
        data: dayArr.map((d, idx) => ({
          time: d.time,
          height: d.height,
          type: extrema.high.includes(idx) ? '高潮' : extrema.low.includes(idx) ? '低潮' : '',
        }))
      };
    });

    console.error('[fetchTideData] Success, processed', result.length, 'days');
    return result;
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('[fetchTideData] Error:', errMsg);
    throw new Error(`Data processing error: ${errMsg}`);
  }
};
