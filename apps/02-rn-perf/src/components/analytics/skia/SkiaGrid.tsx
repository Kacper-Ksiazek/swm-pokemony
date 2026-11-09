import {
  DashPathEffect,
  Line as SkiaLine,
  Text as SkiaText,
  vec,
} from "@shopify/react-native-skia";

import {
  CHART_HEIGHT,
  formatLabel,
  getGridLabels,
  getGridYs,
  getXLabelIndices,
  labelFont,
  measureText,
  PADDING,
  PLOT_H,
  PLOT_W,
} from "../chart-utils";

interface SkiaGridProps {
  maxVal: number;
  dataLength: number;
  borderColor: string;
  labelColor: string;
}

export function SkiaGrid({ maxVal, dataLength, borderColor, labelColor }: SkiaGridProps) {
  const gridYs = getGridYs();
  const gridLabels = getGridLabels(maxVal);
  const xIndices = getXLabelIndices(dataLength);
  const stepX = PLOT_W / (dataLength - 1);

  return (
    <>
      {/* Horizontal grid lines + Y labels */}
      {gridYs.map((y) => (
        <SkiaLine
          key={`grid-${y}`}
          p1={vec(PADDING.left, y)}
          p2={vec(PADDING.left + PLOT_W, y)}
          color={borderColor}
          strokeWidth={0.5}
        >
          <DashPathEffect intervals={[4, 3]} />
        </SkiaLine>
      ))}
      {gridLabels.map((label, i) => {
        const text = formatLabel(label);
        const textWidth = measureText(text);
        const y = gridYs[i];
        return (
          <SkiaText
            key={`ylabel-${label}-${y}`}
            x={PADDING.left - 6 - textWidth}
            y={y + 3}
            text={text}
            font={labelFont}
            color={labelColor}
          />
        );
      })}

      {/* X labels */}
      {xIndices.map((idx) => {
        const text = `D${idx + 1}`;
        const textWidth = measureText(text);
        return (
          <SkiaText
            key={`xlabel-${idx}`}
            x={PADDING.left + idx * stepX - textWidth / 2}
            y={CHART_HEIGHT - 6}
            text={text}
            font={labelFont}
            color={labelColor}
          />
        );
      })}

      {/* Axis lines */}
      <SkiaLine
        p1={vec(PADDING.left, PADDING.top)}
        p2={vec(PADDING.left, PADDING.top + PLOT_H)}
        color={borderColor}
        strokeWidth={1}
      />
      <SkiaLine
        p1={vec(PADDING.left, PADDING.top + PLOT_H)}
        p2={vec(PADDING.left + PLOT_W, PADDING.top + PLOT_H)}
        color={borderColor}
        strokeWidth={1}
      />
    </>
  );
}
