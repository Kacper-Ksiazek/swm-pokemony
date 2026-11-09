import type { ComponentType, ReactNode } from "react";
import type { SharedValue } from "react-native-reanimated";

import type { DataSeries, SeriesConfig } from "./chart-utils";
import { SkiaChartArea } from "./skia/SkiaChartArea";
import { SkiaGradientDefs } from "./skia/SkiaGradientDefs";
import { SkiaGrid } from "./skia/SkiaGrid";
import { SkiaPeakMarker } from "./skia/SkiaPeakMarker";
import { SkiaSeriesLine } from "./skia/SkiaSeriesLine";
import type { AnimatedSeriesData } from "./use-chart-animation";

export interface Renderer {
  ChartArea: ComponentType<{ bgColor: string; children: ReactNode }>;
  GradientDefs: ComponentType<{ postId: string; series: DataSeries[] }>;
  Grid: ComponentType<{
    maxVal: number;
    dataLength: number;
    borderColor: string;
    labelColor: string;
  }>;
  SeriesLine: ComponentType<{
    series: AnimatedSeriesData;
    config: SeriesConfig;
    gradientId: string;
    bgColor: string;
    dataLength: number;
  }>;
  PeakMarker: ComponentType<{
    series: AnimatedSeriesData;
    color: string;
    prevPeakX: SharedValue<number>;
    targetPeakX: SharedValue<number>;
    progress: SharedValue<number>;
  }>;
}

export const SkiaRenderer: Renderer = {
  ChartArea: SkiaChartArea,
  GradientDefs: SkiaGradientDefs,
  Grid: SkiaGrid,
  SeriesLine: SkiaSeriesLine,
  PeakMarker: SkiaPeakMarker,
};
