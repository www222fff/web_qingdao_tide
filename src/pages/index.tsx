import React, { useEffect, useState } from 'react';
import TideChart from '../components/TideChart';
import { fetchTideData } from '../utils/fetchTideData';
import { TideDay } from '../types/tide';
import { Lunar } from 'lunar-javascript';

const camNames = ['石老人', '栈桥', '小麦岛'];
const camImgUrls = [
  '/images/shilaoren.jpg',
  '/images/zhanqiao.jpg',
  '/images/xiaomaidao.jpg'
];

// 已弃用本地 getTideType，统一使用 utils/fetchTideData.ts 中的 getTideType

const IndexPage: React.FC = () => {
    const [tideDays, setTideDays] = useState<TideDay[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getTideData = async () => {
            try {
                console.log('[IndexPage] Starting to fetch tide data...');
                const data = await fetchTideData();
                console.log('[IndexPage] Tide data received:', data.length, 'days');
                setTideDays(data);
            } catch (err) {
                const errMsg = err instanceof Error ? err.message : String(err);
                console.error('[IndexPage] Fetch error:', errMsg);
                setError(`Failed to fetch tidal data: ${errMsg}`);
            } finally {
                setLoading(false);
            }
        };

        getTideData();
    }, []);

    if (loading) {
        return <div style={{padding: '20px', textAlign: 'center', color: '#666'}}>Loading tidal data...</div>;
    }

    if (error) {
        return <div style={{padding: '20px', margin: '20px', backgroundColor: '#ffebee', border: '2px solid #f44336', borderRadius: '8px', color: '#c62828', fontSize: '14px', whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>
            <div style={{fontWeight: 'bold', marginBottom: '8px'}}>Error loading tide data:</div>
            {error}
        </div>;
    }

    return (
        <div>
            <div style={{display:'flex',justifyContent:'flex-end',alignItems:'center',fontWeight:'bold',fontSize:16,marginBottom:8,color:'#1a5490'}}>
                Tide Height (m)
            </div>
            <h1 style={{textAlign:'center',color:'#1a5490'}}>青岛未来一周潮汐数据</h1>
            {tideDays.slice(0, 7).map((day, idx) => { // 显示前七天
                const tideType = day.type;
                return (
                    <div key={day.date}>
                        {/* 传递汛型到 TideChart，显示在日期右侧 */}
                        <TideChart
                            data={day.data}
                            date={day.date}
                        >
                            <span style={{marginLeft:12,fontSize:16,fontWeight:'bold',color:'#333'}}>{tideType}</span>
                        </TideChart>
                    </div>
                );
            })}
            {/* 三个实时图像分区，地点为石老人、栈桥、小麦岛 */}
            <div style={{ height: 24 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, gap: '12px' }}>
                {camImgUrls.map((url, idx) => (
                    <div key={idx} style={{ flex: 1, textAlign: 'center' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: 12, color: '#1a5490', fontSize: 16 }}>{camNames[idx]}</div>
                        <div style={{ background: 'rgba(200, 230, 245, 0.4)', height: 180, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid rgba(100, 180, 220, 0.3)', boxShadow: '0 4px 12px rgba(100, 150, 200, 0.1)' }}>
                            <img
                                src={url}
                                alt={camNames[idx] + '实时图像'}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', borderRadius: 12 }}
                                draggable={false}
                            />
                        </div>
                    </div>
                ))}
            </div>
            {/* copyright 信息 */}
            <div style={{ marginTop: 60, width: '100%', textAlign: 'center', color: '#6b9fb0', fontSize: 14, paddingBottom: 24 }}>
                Copyright © {new Date().getFullYear()}
            </div>
        </div>
    );
};

export default IndexPage;
