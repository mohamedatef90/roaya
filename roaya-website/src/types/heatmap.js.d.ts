declare module 'heatmap.js' {
  interface HeatmapConfig {
    container: HTMLElement;
    radius?: number;
    maxOpacity?: number;
    minOpacity?: number;
    blur?: number;
    gradient?: Record<string, string>;
  }

  interface HeatmapDataPoint {
    x: number;
    y: number;
    value: number;
  }

  interface HeatmapData {
    max: number;
    min?: number;
    data: HeatmapDataPoint[];
  }

  interface HeatmapInstance {
    setData(data: HeatmapData): void;
    addData(point: HeatmapDataPoint): void;
    repaint(): void;
    getDataURL(): string;
  }

  interface H337 {
    create(config: HeatmapConfig): HeatmapInstance;
  }

  const h337: H337;
  export default h337;
}
