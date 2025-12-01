import React, { useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { TideData } from '../types/tide';

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

// Create sand pattern with footprints
function createSandPattern(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const patternCtx = canvas.getContext('2d');

    if (!patternCtx) return null;

    // Sand base
    patternCtx.fillStyle = '#F7E7B4';
    patternCtx.fillRect(0, 0, width, height);

    // Add footprints
    patternCtx.fillStyle = 'rgba(210, 180, 100, 0.4)';
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

// Create water pattern with waves
function createWaterPattern(ctx: CanvasRenderingContext2D, width: number, height: number) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const patternCtx = canvas.getContext('2d');

    if (!patternCtx) return null;

    // Water base
    patternCtx.fillStyle = '#3A8DFF';
    patternCtx.fillRect(0, 0, width, height);

    // Add wave pattern
    patternCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    patternCtx.lineWidth = 1.5;

    for (let i = 0; i < 5; i++) {
        patternCtx.beginPath();
        const startX = -20;
        const startY = i * 30;
        patternCtx.moveTo(startX, startY);

        for (let x = startX; x < width + 20; x += 10) {
            const y = startY + Math.sin((x + startY) * 0.05) * 8;
            patternCtx.lineTo(x, y);
        }
        patternCtx.stroke();
    }

    return patternCtx.createPattern(canvas, 'repeat');
}

const TideChart: React.FC<TideChartProps> = ({ data, date, children }) => {
    const chartRef = useRef<any>(null);

    // 提取所有高潮和低潮时间
    const highTides = data.filter(d => d.type === '高潮');
    const lowTides = data.filter(d => d.type === '低潮');

    const sandColor = '#F7E7B4'; // 沙滩色
    const seaColor = '#3A8DFF'; // 海水蓝色

    const chartData = {
        labels: data.map(d => formatTime(d.time)),
        datasets: [
            {
                label: 'Tide Height (m)',
                data: data.map(d => d.height),
                borderColor: '#1a5490',
                borderWidth: 3,
                backgroundColor: 'rgba(58, 141, 255, 0.15)',
                fill: true,
                pointRadius: data.map(d => d.type ? 6 : 2),
                pointBackgroundColor: data.map(d => d.type === '高潮' ? '#ff4444' : d.type === '低潮' ? '#00cc00' : '#2C7FD9'),
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                tension: 0.4,
            },
        ],
    };

    // Plugin to draw patterns behind the chart
    const patternPlugin = {
        id: 'patternPlugin',
        beforeDatasetsDraw(chart: any) {
            const ctx = chart.ctx;
            const chartArea = chart.chartArea;
            const yScale = chart.scales.y;
            const zeroPixel = yScale.getPixelForValue(0);

            // Save context state
            ctx.save();

            if (zeroPixel < chartArea.bottom && zeroPixel > chartArea.top) {
                // Draw sand pattern above zero
                const sandPattern = createSandPattern(ctx, chartArea.width, zeroPixel - chartArea.top);
                if (sandPattern) {
                    ctx.fillStyle = sandPattern;
                    ctx.fillRect(chartArea.left, chartArea.top, chartArea.width, zeroPixel - chartArea.top);
                }

                // Draw water pattern below zero
                const waterPattern = createWaterPattern(ctx, chartArea.width, chartArea.bottom - zeroPixel);
                if (waterPattern) {
                    ctx.fillStyle = waterPattern;
                    ctx.fillRect(chartArea.left, zeroPixel, chartArea.width, chartArea.bottom - zeroPixel);
                }
            }

            // Restore context state
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
            border: '1px solid rgba(238, 238, 238, 0.3)',
            borderRadius: 8,
            background: 'rgba(247, 231, 180, 0.95)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)'
        }}>
            {/* 日期和汛型并排，左上角显示 */}
            {date && (
                <div style={{ fontWeight: 'bold', fontSize: 18, display: 'flex', alignItems: 'center', color: '#333' }}>
                    <span>{date}</span>
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
