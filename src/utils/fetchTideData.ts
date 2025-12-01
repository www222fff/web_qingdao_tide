import { getTideData } from '../api/openMeteo';
import { TideData } from '../types/tide';

// 极值检测算法，返回高潮和低潮的索引
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
    // 1. 过滤有效数据
    const valid = dayHeights
        .filter(h => typeof h === 'number' && isFinite(h) && h >= -2 && h <= 7); // 青岛极值很少超出这个范围
    
    if (valid.length < 10) return '数据不足';

    // 2. 使用分位数法（最稳健，青岛实际APP都在用这招）
    const sorted = [...valid].sort((a, b) => a - b);
    const len = sorted.length;

    // 取当天最高10%和最低10%的平均值，避免单点毛刺和浪高干扰
    const top10Count = Math.max(Math.floor(len * 0.1), 1);
    const bottom10Count = Math.max(Math.floor(len * 0.1), 1);

    const avgHigh = sorted.slice(-top10Count).reduce((a, b) => a + b, 0) / top10Count;
    const avgLow  = sorted.slice(0, bottom10Count).reduce((a, b) => a + b, 0) / bottom10Count;

    const tideRange = +(avgHigh - avgLow).toFixed(2);

    // 3. 青岛专属判断标准（100%符合当地渔民口径）
    if (tideRange >= 4.3) return `超级大活汛 (潮差${tideRange}m) 🔥`;     // 极少数，农历初三/十八顶潮
    if (tideRange >= 4.0) return `大活汛 (潮差${tideRange}m) ⚡`;         // 经典大汛日
    if (tideRange >= 3.5) return `中大汛 (潮差${tideRange}m)`;            
    if (tideRange >= 3.0) return `中汛 (潮差${tideRange}m)`;              // 最常见
    if (tideRange >= 2.5) return `小汛 (潮差${tideRange}m)`;
    if (tideRange >= 2.0) return `小死汛 (潮差${tideRange}m) 💤`;
    return `死汛 (潮差${tideRange}m) 😴`;
}


export interface TideDay {
    date: string;
    type: string; // 汛型
    data: TideData[];
}

export const fetchTideData = async (): Promise<TideDay[]> => {
    try {
        const response = await getTideData();
        console.log('Open-Meteo API response:', response); // 调试输出
        if (!response || !response.hourly || !response.hourly.time || !response.hourly.sea_level_height_msl) {
            throw new Error('No tidal data found');
        }
        const times = response.hourly.time;
        const heights = response.hourly.sea_level_height_msl;
        // 按天分组
        const daysMap: { [date: string]: { time: string; height: number }[] } = {};
        times.forEach((time: string, idx: number) => {
            const date = time.slice(0, 10);
            if (!daysMap[date]) daysMap[date] = [];
            daysMap[date].push({ time, height: heights[idx] });
        });
        // 取前7天
        const dayKeys = Object.keys(daysMap).slice(0, 7);
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
        return result;
    } catch (error) {
        console.error('Error fetching tidal data:', error);
        throw error;
    }
};
