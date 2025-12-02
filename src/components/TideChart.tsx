import React, { useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { TideData } from '../types/tide';
import { Solar } from "lunar-javascript";

interface TideChartProps {
    data: TideData[];
    date?: string;     // 新增：日期
    children?: React.ReactNode; // 新增：汛型内容
}

function formatTime(timeStr: string) {
    const tIdx = timeStr.indexOf('T') !== -1 ? timeStr.indexOf('T') : timeStr.indexOf(' ');
    return tIdx !== -1 ? timeStr.slice(tIdx + 1) : timeStr;
}

function getDateStr(timeStr: string) {
    const tIdx = timeStr.indexOf('T') !== -1 ? timeStr.indexOf('T') : timeStr.indexOf(' ');
    return tIdx !== -1 ? timeStr.slice(0, tIdx) : timeStr;
}

function getLunarDateStr(solarDate: string): string {
    try {
        const [year, month, day] = solarDate.split('-').map(Number);
        const solar = Solar.fromYmd(year, month, day);
        const lunar = solar.getLunar();

        const lunarMonth = lunar.getMonthInChinese(); // 例如 "十月"
        const lunarDay = lunar.getDayInChinese();     // 例如 "十三"

        return `${lunarMonth}月${lunarDay}`;
    } catch (e) {
        return '';
    }
}


// Create sand pattern with footprints
function createSandPattern(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const patternCtx = canvas.getContext('2d');

    if (!patternCtx) return null;

    // Sand base (white)
    patternCtx.fillStyle = '#FFFFFF';
    patternCtx.fillRect(0, 0, width, height);

    // Add footprints
    patternCtx.fillStyle = 'rgba(200, 200, 200, 0.3)';
    const footprints = [
        { x: 30, y: 20 }, { x: 50, y: 35 }, { x: 70, y: 45 },
        { x: 100, y: 30 }, { x: 120, y: 50 }, { x: 150, y: 25 },
        { x: 180, y: 40 }, { x: 200, y: 20 }, { x: 230, y: 45 }
    ];

    footprints.forEach(fp => {
        // Draw oval footprints
        patternCtx.beginPath();
        patternCtx.ellipse(fp.x % width, fp.y % height, 8, 12, 0.3, 0, Math.PI * 2);
        patternCtx.fill();
    });

    return patternCtx.createPattern(canvas, 'repeat');
}

const TideChart: React.FC<TideChartProps> = ({ data, date, children }) => {
    const chartRef = useRef<any>(null);

    // 提取所有高潮和低潮时间
    const highTides = data.filter(d => d.type === '高潮');
    const lowTides = data.filter(d => d.type === '低潮');

    const sandColor = '#FFFFFF'; // 沙滩色（白色）
    const seaColor = '#3A8DFF'; // 海水蓝色

    const chartData = {
        labels: data.map(d => formatTime(d.time)),
        datasets: [
            {
                label: 'Tide Height (m)',
                data: data.map(d => d.height),
                borderColor: '#1a5490',
                borderWidth: 3,
                backgroundColor: 'transparent',
                fill: false,
                pointRadius: data.map(d => d.type ? 6 : 2),
                pointBackgroundColor: data.map(d => d.type === '高潮' ? '#ff4444' : d.type === '低潮' ? '#00cc00' : '#2C7FD9'),
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                tension: 0.4,
            },
        ],
    };

    // Plugin to draw patterns following the tide curve with animation
    const patternPlugin = {
        id: 'patternPlugin',
        afterDatasetsDraw(chart: any) {
            const ctx = chart.ctx;
            const chartArea = chart.chartArea;
            const yScale = chart.scales.y;

            // Get the dataset meta
            const meta = chart.getDatasetMeta(0);

            // Save context state
            ctx.save();

            // Create path for water area (below the curve)
            ctx.beginPath();
            ctx.moveTo(chartArea.left, chartArea.bottom);

            // Trace along the curve
            for (let i = 0; i < data.length; i++) {
                const point = meta.data[i];
                if (point) {
                    ctx.lineTo(point.x, point.y);
                }
            }

            // Close the path at the bottom
            ctx.lineTo(chartArea.right, chartArea.bottom);
            ctx.closePath();

            // Clip to water region and draw animated water
            ctx.clip();

            // Draw base water color with light blue gradient
            const waterGradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            waterGradient.addColorStop(0, '#A8D8F2');
            waterGradient.addColorStop(0.5, '#7AC5E8');
            waterGradient.addColorStop(1, '#5AB8E0');
            ctx.fillStyle = waterGradient;
            ctx.fillRect(chartArea.left, chartArea.top, chartArea.width, chartArea.height);

            // Restore context state
            ctx.restore();

            // Draw sand pattern above the curve
            ctx.save();

            // Create path for sand area (above the curve)
            ctx.beginPath();
            ctx.moveTo(chartArea.left, chartArea.top);

            // Trace along the curve
            for (let i = 0; i < data.length; i++) {
                const point = meta.data[i];
                if (point) {
                    ctx.lineTo(point.x, point.y);
                }
            }

            // Close the path at the top
            ctx.lineTo(chartArea.right, chartArea.top);
            ctx.closePath();
            ctx.clip();

            // Draw sand
            const sandPattern = createSandPattern(ctx, chartArea.width, chartArea.height);
            if (sandPattern) {
                ctx.fillStyle = sandPattern;
                ctx.fillRect(chartArea.left, chartArea.top, chartArea.width, chartArea.height);
            }

            ctx.restore();
        }
    };

    const options = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        const idx = context.dataIndex;
                        const d = data[idx];
                        let label = `高度: ${d.height}m`;
                        if (d.type) label += ` (${d.type})`;
                        return label;
                    }
                },
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#ddd',
                borderWidth: 1,
                padding: 10,
                displayColors: false,
            },
            legend: {
                display: false
            },
            patternPlugin: {}
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#666',
                },
                grid: {
                    color: 'rgba(200, 200, 200, 0.1)',
                }
            },
            x: {
                ticks: {
                    color: '#666',
                },
                grid: {
                    color: 'rgba(200, 200, 200, 0.1)',
                }
            }
        }
    };

    return (
        <div style={{
            margin: '32px 0',
            padding: 12,
            border: '1px solid rgba(100, 180, 220, 0.3)',
            borderRadius: 8,
            background: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(100, 150, 200, 0.1)'
        }}>
            {/* 日期和汛型并排，左上角显示 */}
            {date && (
                <div style={{ fontWeight: 'bold', fontSize: 18, display: 'flex', alignItems: 'center', color: '#333' }}>
                    <span>{date} ({getLunarDateStr(date)})</span>
                    {children && <span style={{ marginLeft: 12 }}>{children}</span>}
                </div>
            )}
            <div style={{ margin: '8px 0', fontSize: 15 }}>
                <span style={{ color: '#d32f2f', marginRight: 12, fontWeight: 500 }}>高潮: {highTides.map(d => d.time.slice(11, 16)).join(' | ') || '无'}</span>
                <span style={{ color: '#388e3c', fontWeight: 500 }}>低潮: {lowTides.map(d => d.time.slice(11, 16)).join(' | ') || '无'}</span>
            </div>
            <div style={{ height: 260, position: 'relative' }}>
                <Line ref={chartRef} data={chartData} options={options} plugins={[patternPlugin]} />
            </div>
        </div>
    );
};

export default TideChart;
