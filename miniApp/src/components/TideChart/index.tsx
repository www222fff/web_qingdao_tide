import React, { useEffect, useRef, useState } from 'react';
import { Canvas, View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { TideData } from '../../types/tide';
import { getLunarDateStr } from '../../utils/helpers';
import styles from './index.module.scss';

interface TideChartProps {
  data: TideData[];
  date?: string;
  tideType?: string;
}

const TideChart: React.FC<TideChartProps> = ({ data, date, tideType }) => {
  const canvasId = useRef<string>(`tideCanvas-${Math.random().toString(36).substr(2, 9)}`).current;
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const animationRef = useRef<number>();
  const progressRef = useRef(0);

  // 1. 设置布局尺寸
  useEffect(() => {
    try {
      const systemInfo = Taro.getSystemInfoSync();
      const deviceWidth = systemInfo.screenWidth || 375;
      const width = deviceWidth - 40; 
      const height = Math.round(width * 0.75); 
      setCanvasSize({ width, height });
    } catch (error) {
      console.warn('System Info Error', error);
    }
  }, []);

  // 2. 绘图逻辑
  useEffect(() => {
    if (!data.length || canvasSize.width === 0) return;

    const query = Taro.createSelectorQuery();
    query.select(`#${canvasId}`)
      .fields({ node: true, size: true })
      .exec((res) => {
        if (!res[0] || !res[0].node) return;

        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        
        // --- 核心：最简单的平滑方案 ---
        // 直接获取手机的像素比 (通常是 2 或 3)
        const dpr = Taro.getSystemInfoSync().pixelRatio;
        
        // 放大画布尺寸，匹配物理像素
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        
        // 缩放绘图坐标系，不用自己算坐标
        ctx.scale(dpr, dpr);

        const width = res[0].width;
        const height = res[0].height;
        const padding = { top: 45, bottom: 45, left: 15, right: 15 };

        // 简化的数据计算
        const heights = data.map(d => parseFloat(d.height));
        const minVal = Math.min(...heights);
        const maxVal = Math.max(...heights);
        let amplitude = maxVal - minVal;
        if (amplitude === 0) amplitude = 1; 

        // 动态留白，保证波浪饱满
        const paddingY = amplitude * 0.15; 
        const minH = minVal - paddingY;
        const maxH = maxVal + paddingY;
        const heightRange = maxH - minH;
        
        const stepX = (width - padding.left - padding.right) / (data.length - 1);
        const getX = (index: number) => padding.left + index * stepX;
        const getY = (h: number) => height - padding.bottom - ((h - minH) / heightRange) * (height - padding.top - padding.bottom);

        const render = () => {
          ctx.clearRect(0, 0, width, height);
          
          // 简单的入场动画
          if (progressRef.current < 1) {
            progressRef.current += 0.03;
            if (progressRef.current > 1) progressRef.current = 1;
          }
          const easeProgress = 1 - Math.pow(1 - progressRef.current, 3);

          // 绘制背景线
          ctx.strokeStyle = 'rgba(26, 84, 144, 0.08)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(padding.left, getY(maxVal));
          ctx.lineTo(width - padding.right, getY(maxVal));
          ctx.moveTo(padding.left, getY(minVal));
          ctx.lineTo(width - padding.right, getY(minVal));
          ctx.stroke();

          // 准备路径点
          const points = data.map((d, i) => ({
            x: getX(i),
            y: height - (height - getY(parseFloat(d.height))) * easeProgress
          }));

          // 绘制曲线路径
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);

          // 贝塞尔曲线连接，这就是平滑的关键
          for (let i = 0; i < points.length - 1; i++) {
            const curr = points[i];
            const next = points[i + 1];
            const cp1x = curr.x + (next.x - curr.x) / 2;
            const cp1y = curr.y;
            const cp2x = curr.x + (next.x - curr.x) / 2; // X中点
            const cp2y = next.y;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
          }

          // 1. 先画渐变填充
          ctx.save(); // 保存状态
          ctx.lineTo(width - padding.right, height);
          ctx.lineTo(padding.left, height);
          ctx.closePath();
          const gradient = ctx.createLinearGradient(0, padding.top, 0, height);
          gradient.addColorStop(0, 'rgba(26, 84, 144, 0.3)');
          gradient.addColorStop(1, 'rgba(26, 84, 144, 0.01)');
          ctx.fillStyle = gradient;
          ctx.fill();
          ctx.restore(); // 恢复路径状态

          // 2. 再画描边 (实线)
          // 重新画一遍路径用于描边，确保不闭合到底部
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 0; i < points.length - 1; i++) {
            const curr = points[i];
            const next = points[i + 1];
            const cp1x = curr.x + (next.x - curr.x) / 2;
            const cp1y = curr.y;
            const cp2x = curr.x + (next.x - curr.x) / 2;
            const cp2y = next.y;
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
          }
          
          ctx.strokeStyle = '#1a5490';
          ctx.lineWidth = 3;
          ctx.lineCap = 'round'; // 线条端点圆润
          ctx.lineJoin = 'round'; // 拐角圆润
          ctx.stroke();

          // 绘制圆点和文字
          if (easeProgress > 0.9) {
            ctx.textAlign = 'center';
            data.forEach((d, i) => {
              if (d.type === '高潮' || d.type === '低潮') {
                const px = points[i].x;
                const py = points[i].y;
                
                // 清爽的实心点
                ctx.beginPath();
                ctx.arc(px, py, 4, 0, Math.PI * 2);
                ctx.fillStyle = d.type === '高潮' ? '#d32f2f' : '#388e3c';
                ctx.fill();
                
                // 清晰的文字
                ctx.fillStyle = '#333';
                ctx.font = 'bold 14px sans-serif'; 
                const timeStr = d.time.slice(11, 16);
                let textY = d.type === '高潮' ? py - 20 : py + 30; 
                ctx.fillText(timeStr, px, textY);

                ctx.fillStyle = '#666';
                ctx.font = '12px sans-serif'; 
                const heightY = d.type === '高潮' ? textY - 16 : textY + 16;
                ctx.fillText(`${d.height}m`, px, heightY);
              }
            });
          }

          // 画今天的时间线
          const now = new Date();
          const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          if (date === todayStr && easeProgress === 1) {
             const currentHour = now.getHours() + now.getMinutes() / 60;
             const currentX = padding.left + (currentHour / 24) * (width - padding.left - padding.right);
             
             ctx.beginPath();
             ctx.moveTo(currentX, padding.top);
             ctx.lineTo(currentX, height - padding.bottom);
             ctx.setLineDash([4, 4]);
             ctx.strokeStyle = '#f57c00';
             ctx.lineWidth = 1;
             ctx.stroke();
             ctx.setLineDash([]);

             ctx.font = 'bold 12px sans-serif';
             ctx.fillStyle = '#ef6c00';
             ctx.fillText('现在', currentX, padding.top - 8);
          }

          if (progressRef.current < 1 || date === todayStr) {
             animationRef.current = canvas.requestAnimationFrame(render);
          }
        };

        render();
      });

    return () => {
      progressRef.current = 0;
      if (animationRef.current) {
        const canvasNode = document.getElementById(canvasId) as any;
        if (canvasNode && canvasNode.cancelAnimationFrame) {
             canvasNode.cancelAnimationFrame(animationRef.current);
        }
      }
    };
  }, [data, canvasSize, canvasId, date]);

  // JSX 部分保持不变
  const highTides = data.filter(d => d.type === '高潮');
  const lowTides = data.filter(d => d.type === '低潮');

  return (
    <View className={styles.container}>
      {date && (
        <View className={styles.header}>
          <Text className={styles.date}>
            {date} <Text className={styles.lunarDate}>({getLunarDateStr(date)})</Text>
          </Text>
          {tideType && <Text className={styles.tideType}>{tideType}</Text>}
        </View>
      )}
      <Canvas
        type="2d"
        id={canvasId}
        className={styles.canvas}
        style={{ width: '100%', height: `${canvasSize.height}px` }}
      />
      <View className={styles.tideInfo}>
        <View className={styles.highTide}>
           高潮 {highTides.map(d => d.time.slice(11, 16)).join(' / ') || '--'}
        </View>
        <View className={styles.lowTide}>
           低潮 {lowTides.map(d => d.time.slice(11, 16)).join(' / ') || '--'}
        </View>
      </View>
    </View>
  );
};

export default TideChart;