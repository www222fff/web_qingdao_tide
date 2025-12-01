import React, { useRef, useEffect } from 'react';
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

// Create water pattern with animated flowing waves
function createWaterPattern(ctx: CanvasRenderingContext2D, width: number, height: number, animationOffset: number = 0) {
    const canvas = document.createElement('canvas');
    canvas.width = 200; // Fixed size for pattern
    canvas.height = height;
    const patternCtx = canvas.getContext('2d');

    if (!patternCtx) return null;

    // Water base
    patternCtx.fillStyle = '#3A8DFF';
    patternCtx.fillRect(0, 0, canvas.width, height);

    // Draw multiple wave lines with flowing animation
    patternCtx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    patternCtx.lineWidth = 2.5;
    patternCtx.lineCap = 'round';
    patternCtx.lineJoin = 'round';

    // Main wave layers
    for (let waveIndex = 0; waveIndex < 5; waveIndex++) {
        patternCtx.beginPath();

        const baseY = 20 + waveIndex * 35;
        const waveFrequency = 0.02 + waveIndex * 0.004;
        const waveAmplitude = 8 + waveIndex * 2;

        for (let x = 0; x < canvas.width + 50; x += 2) {
            // Create flowing wave with animation offset
            const wave = Math.sin((x - animationOffset * 3) * waveFrequency) * waveAmplitude;
            const y = baseY + wave;

            if (x === 0) {
                patternCtx.moveTo(x, y);
            } else {
                patternCtx.lineTo(x, y);
            }
        }
        patternCtx.stroke();
    }

    // Add subtle secondary waves for depth
    patternCtx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    patternCtx.lineWidth = 1.5;

    for (let waveIndex = 0; waveIndex < 3; waveIndex++) {
        patternCtx.beginPath();

        const baseY = 50 + waveIndex * 50;
        const waveFrequency = 0.015;
        const waveAmplitude = 5;

        for (let x = 0; x < canvas.width + 50; x += 3) {
            const wave = Math.sin((x - animationOffset * 2) * waveFrequency + waveIndex) * waveAmplitude;
            const y = baseY + wave;

            if (x === 0) {
                patternCtx.moveTo(x, y);
            } else {
                patternCtx.lineTo(x, y);
            }
        }
        patternCtx.stroke();
    }

    return patternCtx.createPattern(canvas, 'repeat');
}

const TideChart: React.FC<TideChartProps> = ({ data, date, children }) => {
    const chartRef = useRef<any>(null);
    const animationRef = useRef<number>(0);
    const animationFrameRef = useRef<number | null>(null);

    // 提取所有高潮和低潮时间
    const highTides = data.filter(d => d.type === '高潮');
    const lowTides = data.filter(d => d.type === '低潮');

    const sandColor = '#FFFFFF'; // 沙滩色（白色）
    const seaColor = '#3A8DFF'; // 海水蓝色

    // Animation loop for water waves
    useEffect(() => {
        let startTime = Date.now();

        const animate = () => {
            const currentTime = Date.now();
            animationRef.current = (currentTime - startTime) / 30; // Faster animation for visible wave flow

            if (chartRef.current && chartRef.current.chart) {
                // Force chart redraw with pattern animation
                chartRef.current.chart.draw();
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

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

    // Plugin to draw patterns following the tide curve
    const patternPlugin = {
        id: 'patternPlugin',
        afterDatasetsDraw(chart: any) {
            const ctx = chart.ctx;
            const chartArea = chart.chartArea;
            const yScale = chart.scales.y;
            const xScale = chart.scales.x;

            // Get the dataset
            const dataset = chart.data.datasets[0];
            const meta = chart.getDatasetMeta(0);

            // Save context state
            ctx.save();

            // Draw water pattern below the curve with animation
            const waterPattern = createWaterPattern(ctx, chartArea.width, chartArea.height, animationRef.current);
            if (waterPattern) {
                ctx.fillStyle = waterPattern;
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
                ctx.fill();
            }

            // Draw sand pattern above the curve
            const sandPattern = createSandPattern(ctx, chartArea.width, chartArea.height);
            if (sandPattern) {
                ctx.fillStyle = sandPattern;
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
                ctx.fill();
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
            border: '1px solid rgba(100, 180, 220, 0.3)',
            borderRadius: 8,
            background: '#FFFFFF',
            boxShadow: '0 4px 12px rgba(100, 150, 200, 0.1)'
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
