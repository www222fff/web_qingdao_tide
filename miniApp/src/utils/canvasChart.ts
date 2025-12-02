import { TideData } from '../types/tide';

export interface ChartPoint {
  x: number;
  y: number;
  height: number;
  time: string;
  type: string;
}

export interface ChartConfig {
  width: number;
  height: number;
  padding: number;
  gridLines: boolean;
}

export class TideChartRenderer {
  private data: TideData[];
  private config: ChartConfig;
  private minHeight: number = 0;
  private maxHeight: number = 3;
  private points: ChartPoint[] = [];

  constructor(data: TideData[], config: Partial<ChartConfig> = {}) {
    this.data = data;
    this.config = {
      width: config.width || 600,
      height: config.height || 300,
      padding: config.padding || 40,
      gridLines: config.gridLines !== false,
    };
    this.calculateBounds();
    this.calculatePoints();
  }

  private calculateBounds(): void {
    const heights = this.data.map(d => d.height);
    this.minHeight = Math.min(...heights);
    this.maxHeight = Math.max(...heights, 3);

    const padding = (this.maxHeight - this.minHeight) * 0.1;
    this.minHeight -= padding;
    this.maxHeight += padding;
  }

  private calculatePoints(): void {
    const innerWidth = this.config.width - 2 * this.config.padding;
    const innerHeight = this.config.height - 2 * this.config.padding;
    const heightRange = this.maxHeight - this.minHeight;

    this.points = this.data.map((item, index) => {
      const xPercent = this.data.length > 1 ? index / (this.data.length - 1) : 0.5;
      const yPercent = (item.height - this.minHeight) / heightRange;

      return {
        x: this.config.padding + xPercent * innerWidth,
        y: this.config.height - this.config.padding - yPercent * innerHeight,
        height: item.height,
        time: item.time,
        type: item.type,
      };
    });
  }

  drawChart(ctx: CanvasRenderingContext2D): void {
    try {
      console.log('Starting chart render with config:', this.config);
      this.drawBackground(ctx);
      if (this.config.gridLines) {
        this.drawGridLines(ctx);
      }
      this.drawAxes(ctx);
      this.drawTideArea(ctx);
      this.drawCurve(ctx);
      this.drawPoints(ctx);
      this.drawLabels(ctx);
      console.log('Chart render completed successfully');
    } catch (err) {
      console.error('Error during chart render:', err);
      throw err;
    }
  }

  private drawBackground(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, this.config.width, this.config.height);
  }

  private drawGridLines(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.1)';
    ctx.lineWidth = 1;

    const innerHeight = this.config.height - 2 * this.config.padding;
    const gridCount = 4;

    for (let i = 1; i < gridCount; i++) {
      const y = this.config.padding + (innerHeight / gridCount) * i;
      ctx.beginPath();
      ctx.moveTo(this.config.padding, y);
      ctx.lineTo(this.config.width - this.config.padding, y);
      ctx.stroke();
    }
  }

  private drawAxes(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(this.config.padding, this.config.height - this.config.padding);
    ctx.lineTo(this.config.width - this.config.padding, this.config.height - this.config.padding);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(this.config.padding, this.config.padding);
    ctx.lineTo(this.config.padding, this.config.height - this.config.padding);
    ctx.stroke();

    ctx.fillStyle = '#666';
    try {
      (ctx as any).font = 'bold 14px sans-serif';
    } catch (e) {
      console.warn('Font property not supported');
    }
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= 4; i++) {
      const height = this.minHeight + ((this.maxHeight - this.minHeight) / 4) * i;
      const y = this.config.height - this.config.padding - ((height - this.minHeight) / (this.maxHeight - this.minHeight)) * (this.config.height - 2 * this.config.padding);
      ctx.fillText(height.toFixed(1), this.config.padding - 15, y);
    }
  }

  private drawTideArea(ctx: CanvasRenderingContext2D): void {
    if (this.points.length === 0) return;

    // Create gradient fill for water area
    const gradient = ctx.createLinearGradient(0, this.config.padding, 0, this.config.height - this.config.padding);
    gradient.addColorStop(0, 'rgba(168, 216, 242, 0.7)');
    gradient.addColorStop(0.5, 'rgba(122, 197, 232, 0.6)');
    gradient.addColorStop(1, 'rgba(90, 184, 224, 0.5)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.config.height - this.config.padding);

    for (const point of this.points) {
      ctx.lineTo(point.x, point.y);
    }

    ctx.lineTo(this.points[this.points.length - 1].x, this.config.height - this.config.padding);
    ctx.closePath();
    ctx.fill();
  }

  private drawCurve(ctx: CanvasRenderingContext2D): void {
    if (this.points.length === 0) return;

    ctx.strokeStyle = '#1a5490';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);

    // Use smooth curve with quadratic bezier curves
    if (this.points.length === 2) {
      ctx.lineTo(this.points[1].x, this.points[1].y);
    } else {
      for (let i = 1; i < this.points.length; i++) {
        const prev = this.points[i - 1];
        const curr = this.points[i];
        const next = this.points[i + 1];

        const cpx = curr.x;
        const cpy = curr.y;

        if (i < this.points.length - 1) {
          const nextX = (curr.x + next.x) / 2;
          const nextY = (curr.y + next.y) / 2;
          ctx.quadraticCurveTo(cpx, cpy, nextX, nextY);
        } else {
          ctx.quadraticCurveTo(cpx, cpy, curr.x, curr.y);
        }
      }
    }

    ctx.stroke();
  }

  private drawPoints(ctx: CanvasRenderingContext2D): void {
    for (const point of this.points) {
      if (point.type === '高潮') {
        ctx.fillStyle = '#ff4444';
      } else if (point.type === '低潮') {
        ctx.fillStyle = '#00cc00';
      } else {
        ctx.fillStyle = '#2C7FD9';
      }

      ctx.beginPath();
      ctx.arc(point.x, point.y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  private drawLabels(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#666';
    try {
      (ctx as any).font = 'bold 12px sans-serif';
    } catch (e) {
      console.warn('Font property not supported');
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const labelStep = Math.ceil(this.points.length / 6);
    for (let i = 0; i < this.points.length; i += labelStep) {
      const point = this.points[i];
      const timeLabel = point.time.slice(11, 16);
      ctx.fillText(timeLabel, point.x, this.config.height - this.config.padding + 12);
    }
  }
}
