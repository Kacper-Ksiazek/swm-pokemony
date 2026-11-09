import { Canvas } from "@shopify/react-native-skia";
import type { ReactNode } from "react";

import { CHART_HEIGHT, CHART_WIDTH } from "../chart-utils";

interface SkiaChartAreaProps {
  bgColor: string;
  children: ReactNode;
}

export function SkiaChartArea({ children }: SkiaChartAreaProps) {
  return <Canvas style={{ width: CHART_WIDTH, height: CHART_HEIGHT }}>{children}</Canvas>;
}
