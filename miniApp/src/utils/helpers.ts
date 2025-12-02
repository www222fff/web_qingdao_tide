import { Solar } from 'lunar-javascript';

export function formatTime(timeStr: string): string {
  const tIdx = timeStr.indexOf('T') !== -1 ? timeStr.indexOf('T') : timeStr.indexOf(' ');
  return tIdx !== -1 ? timeStr.slice(tIdx + 1) : timeStr;
}

export function getDateStr(timeStr: string): string {
  const tIdx = timeStr.indexOf('T') !== -1 ? timeStr.indexOf('T') : timeStr.indexOf(' ');
  return tIdx !== -1 ? timeStr.slice(0, tIdx) : timeStr;
}

export function getLunarDateStr(solarDate: string): string {
  try {
    const [year, month, day] = solarDate.split('-').map(Number);
    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();

    const lunarMonth = lunar.getMonthInChinese();
    const lunarDay = lunar.getDayInChinese();

    return `${lunarMonth}月${lunarDay}`;
  } catch (e) {
    return '';
  }
}
