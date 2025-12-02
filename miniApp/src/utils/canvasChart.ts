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
    this.drawBackground(ctx);
    if (this.config.gridLines) {
      this.drawGridLines(ctx);
    }
    this.drawAxes(ctx);
    this.drawTideArea(ctx);
    this.drawCurve(ctx);
    this.drawPoints(ctx);
    this.drawLabels(ctx);
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
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(this.config.padding, this.config.height - this.config.padding);
    ctx.lineTo(this.config.width - this.config.padding, this.config.height - this.config.padding);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(this.config.padding, this.config.padding);
    ctx.lineTo(this.config.padding, this.config.height - this.config.padding);
    ctx.stroke();

    ctx.fillStyle = '#666';
    (ctx as any).font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    for (let i = 0; i <= 4; i++) {
      const height = this.minHeight + ((this.maxHeight - this.minHeight) / 4) * i;
      const y = this.config.height - this.config.padding - ((height - this.minHeight) / (this.maxHeight - this.minHeight)) * (this.config.height - 2 * this.config.padding);
      ctx.fillText(height.toFixed(1), this.config.padding - 20, y - 6);
    }
  }

  private drawTideArea(ctx: CanvasRenderingContext2D): void {
    if (this.points.length === 0) return;

    ctx.fillStyle = 'rgba(122, 197, 232, 0.3)';
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
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);

    // Use simple line connections instead of quadratic curves for better compatibility
    for (let i = 1; i < this.points.length; i++) {
      const curr = this.points[i];
      ctx.lineTo(curr.x, curr.y);
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
    (ctx as any).font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const labelStep = Math.ceil(this.points.length / 6);
    for (let i = 0; i < this.points.length; i += labelStep) {
      const point = this.points[i];
      const timeLabel = point.time.slice(11, 16);
      ctx.fillText(timeLabel, point.x, this.config.height - this.config.padding + 10);
    }
  }
}
