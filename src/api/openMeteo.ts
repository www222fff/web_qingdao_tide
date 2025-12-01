import axios from 'axios';

const BASE_URL = 'https://marine-api.open-meteo.com/v1/marine';

export const getTideData = async () => {
    try {
        // 使用 sea_level_height_msl 参数获取潮汐高度数据
        const response = await axios.get(`${BASE_URL}?latitude=36.0649&longitude=120.3804&hourly=sea_level_height_msl&timezone=Asia%2FSingapore&forecast_days=7`);
        return response.data;
    } catch (error) {
        console.error('Error fetching tidal data:', error);
        throw error;
    }
};
