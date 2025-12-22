import Taro from '@tarojs/taro';
import { TideResponse } from '../types/tide';

const url = 'https://tide.takeanything.store/api/tide';

export const getTideData = async (): Promise<TideResponse> => {
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
};
