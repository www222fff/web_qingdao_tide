import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro';
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

  // Share to friends (分享给朋友)
  useShareAppMessage(() => {
    return {
      title: '青岛潮汐数据 - 查看实时潮汐信息',
      desc: '实时查看青岛地区潮汐数据，包含高潮低潮时间及潮汐类型',
      path: '/pages/index/index',
    };
  });

  // Share to Moments/Timeline (分享到朋友圈)
  useShareTimeline(() => {
    return {
      title: '青岛潮汐数据 - 查看实时潮汐信息',
      query: 'from=timeline',
      imageUrl: '/images/shilaoren.jpg',
    };
  });

  useEffect(() => {
    const getTideData = async () => {
      try {
        const data = await fetchTideData();
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
    <View className={styles.container}>
      <View className={styles.scrollContent}>
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
      </View>
    </View>
  );
};

export default IndexPage;
