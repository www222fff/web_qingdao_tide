import React, { useEffect, useRef } from 'react';
import { Canvas, View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { TideData } from '../../types/tide';
import { getLunarDateStr } from '../../utils/helpers';
import { TideChartRenderer } from '../../utils/canvasChart';
import styles from './index.module.scss';

interface TideChartProps {
  data: TideData[];
  date?: string;
  tideType?: string;
}

const TideChart: React.FC<TideChartProps> = ({ data, date, tideType }) => {
  const canvasId = useRef<string>(`tideChart-${Math.random().toString(36).substr(2, 9)}`).current;
  const renderTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!data.length) return;

    // Clear any previous timeout
    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }

    const drawChart = () => {
      try {
        const ctx = Taro.createCanvasContext(canvasId);
        if (!ctx) {
          console.warn('Canvas context not available');
          return;
        }

        const renderer = new TideChartRenderer(data, {
          width: 600,
          height: 300,
          padding: 40,
        });

        renderer.drawChart(ctx);
        ctx.draw();
      } catch (error) {
        console.error('Chart rendering error:', error);
      }
    };

    // Delay to ensure canvas is mounted and ready
    renderTimeoutRef.current = setTimeout(drawChart, 300);

    return () => {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [data, canvasId]);

  const highTides = data.filter(d => d.type === '高潮');
  const lowTides = data.filter(d => d.type === '低潮');

  return (
    <View className={styles.container}>
      {date && (
        <View className={styles.header}>
          <Text className={styles.date}>
            {date} ({getLunarDateStr(date)})
          </Text>
          {tideType && <Text className={styles.tideType}>{tideType}</Text>}
        </View>
      )}

      <View className={styles.tideInfo}>
        <Text className={styles.highTide}>
          高潮: {highTides.map(d => d.time.slice(11, 16)).join(' | ') || '无'}
        </Text>
        <Text className={styles.lowTide}>
          低潮: {lowTides.map(d => d.time.slice(11, 16)).join(' | ') || '无'}
        </Text>
      </View>

      <Canvas
        className={styles.canvas}
        canvasId={canvasId}
        type="2d"
        style={{ width: '100%', height: '300px' }}
      />
    </View>
  );
};

export default TideChart;
