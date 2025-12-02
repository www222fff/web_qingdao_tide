import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import { fetchTideData } from '../../utils/fetchTideData';
import { TideDay } from '../../types/tide';
import TideChart from '../../components/TideChart';
import styles from './index.module.scss';

const camNames = ['石老人', '栈桥', '小麦岛'];
const camImgUrls = [
  '/images/shilaoren.jpg',
  '/images/zhanqiao.jpg',
  '/images/xiaomaidao.jpg'
];

const IndexPage: React.FC = () => {
  const [tideDays, setTideDays] = useState<TideDay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getTideData = async () => {
      try {
        console.error('[IndexPage] Fetching tide data...');
        const data = await fetchTideData();
        console.error('[IndexPage] Received', data.length, 'days of data');
        setTideDays(data);
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err);
        console.error('[IndexPage] Error:', errMsg);
        setError(errMsg);
      } finally {
        setLoading(false);
      }
    };

    getTideData();
  }, []);

  if (loading) {
    return (
      <View className={styles.container}>
        <Text className={styles.loadingText}>Loading tidal data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className={styles.container}>
        <View className={styles.errorContainer}>
          <Text className={styles.errorTitle}>Error Loading Tidal Data</Text>
          <Text className={styles.errorText}>{error}</Text>
          <Text className={styles.errorHint}>
            Make sure: 1. Device has internet connection{'\n'}
            2. Open-Meteo domain is whitelisted{'\n'}
            3. Try again in a few seconds
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className={styles.container} scrollY>
      <View className={styles.titleSection}>
        <Text className={styles.titleLabel}>Tide Height (m)</Text>
      </View>
      <Text className={styles.mainTitle}>青岛未来一周潮汐数据</Text>

      {tideDays.slice(0, 7).map((day) => (
        <View key={day.date}>
          <TideChart
            data={day.data}
            date={day.date}
            tideType={day.type}
          />
        </View>
      ))}

      <View className={styles.spacer} />

      <View className={styles.cameraSection}>
        {camImgUrls.map((url, idx) => (
          <View key={idx} className={styles.cameraCard}>
            <Text className={styles.cameraName}>{camNames[idx]}</Text>
            <View className={styles.cameraImageContainer}>
              <Image
                src={url}
                alt={camNames[idx] + '实时图像'}
                className={styles.cameraImage}
                mode="aspectFill"
              />
            </View>
          </View>
        ))}
      </View>

      <View className={styles.footer}>
        <Text className={styles.footerText}>
          Copyright © {new Date().getFullYear()}
        </Text>
      </View>
    </ScrollView>
  );
};

export default IndexPage;
