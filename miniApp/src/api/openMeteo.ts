import Taro from '@tarojs/taro';
import { TideResponse } from '../types/tide';

const BASE_URL = 'https://marine-api.open-meteo.com/v1/marine';

export const getTideData = async (): Promise<TideResponse> => {
  const url = `${BASE_URL}?latitude=36.0649&longitude=120.3804&hourly=sea_level_height_msl&timezone=Asia%2FSingapore&forecast_days=7`;

  try {
    console.error('[getTideData] Requesting:', url);
    const response = await Taro.request<TideResponse>({
      url,
      method: 'GET',
      dataType: 'json',
      timeout: 10000,
    });

    console.error('[getTideData] Response received - statusCode:', response.statusCode);

    if (response.statusCode === 200 && response.data) {
      console.error('[getTideData] Success, data keys:', Object.keys(response.data));
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
