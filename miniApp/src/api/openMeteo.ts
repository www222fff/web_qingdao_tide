import Taro from '@tarojs/taro';
import { TideResponse } from '../types/tide';


const url = 'https://tide.takeanything.store/api/tide';

// 通用重试函数
async function retry<T>(fn: () => Promise<T>, retries = 3, delay = 800): Promise<T> {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < retries - 1) await new Promise(res => setTimeout(res, delay));
    }
  }
  throw lastErr;
}

export const getTideData = async (): Promise<TideResponse> => {
  return retry(async () => {
    try {
      const response = await Taro.request<TideResponse>({
        url,
        method: 'GET',
        dataType: 'json',
        timeout: 10000,
      });

      console.log('[getTideData] Response received - statusCode:', response.statusCode);

      if (response.statusCode === 200 && response.data) {
        console.log('[getTideData] Success, data keys:', Object.keys(response.data));
        return response.data;
      } else {
        throw new Error(`API returned status ${response.statusCode}`);
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error('[getTideData] Failed:', errMsg);
      throw new Error(`API Error: ${errMsg}`);
    }
  }, 3, 800);
};
