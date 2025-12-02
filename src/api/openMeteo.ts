import axios from 'axios';

const BASE_URL = 'https://marine-api.open-meteo.com/v1/marine';

export const getTideData = async () => {
    try {
        const url = `${BASE_URL}?latitude=36.0649&longitude=120.3804&hourly=sea_level_height_msl&timezone=Asia%2FSingapore&forecast_days=7`;
        console.log('[TideAPI] Requesting:', url);

        const response = await axios.get(url, {
            timeout: 10000, // 10秒超时
        });

        console.log('[TideAPI] Success:', response.status, response.data);
        return response.data;
    } catch (error) {
        const errMsg = error instanceof Error ? error.message : String(error);
        throw error;
    }
};
