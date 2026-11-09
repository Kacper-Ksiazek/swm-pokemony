import { View } from "react-native";

import type { FeedPost } from "@/data/mock-feed";
import { ChartLegend } from "./ChartLegend";
import { ChartPostHeader } from "./ChartPostHeader";
import { ChartStats } from "./ChartStats";
import { ALL_SERIES, type ChartColors, type DataSeries, SERIES_CONFIG } from "./chart-utils";
import type { Renderer } from "./renderers";
import { useChartAnimation } from "./use-chart-animation";

interface PostAnalyticsChartProps {
  post: FeedPost;
  colors: ChartColors;
  renderer: Renderer;
  enabledSeries?: Set<DataSeries>;
  days?: number;
}

export function PostAnalyticsChart({
  post,
  colors,
  renderer: R,
  enabledSeries,
  days = 30,
}: PostAnalyticsChartProps) {
  const show = (s: DataSeries) => !enabledSeries || enabledSeries.has(s);
  const anim = useChartAnimation(post, days);

  return (
    <View
      style={{
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        padding: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        borderWidth: 0.5,
        borderColor: colors.border,
      }}
    >
      <ChartPostHeader post={post} colors={colors} />

      <R.ChartArea bgColor={colors.cardBackground}>
        <R.GradientDefs postId={post.id} series={[...ALL_SERIES]} />
        <R.Grid
          maxVal={anim.maxLikes}
          dataLength={anim.rawLikes.length}
          borderColor={colors.border}
          labelColor={colors.icon}
        />

        {ALL_SERIES.map((key) =>
          show(key) ? (
            <R.SeriesLine
              key={key}
              series={anim[key]}
              config={SERIES_CONFIG[key]}
              gradientId={`${key}-grad-${post.id}`}
              bgColor={colors.cardBackground}
              dataLength={anim.rawLikes.length}
            />
          ) : null,
        )}

        {show("likes") && (
          <R.PeakMarker
            series={anim.likes}
            color={SERIES_CONFIG.likes.color}
            prevPeakX={anim.prevPeakX}
            targetPeakX={anim.targetPeakX}
            progress={anim.progress}
          />
        )}
      </R.ChartArea>

      <ChartLegend colors={colors} />
      <ChartStats post={post} colors={colors} />
    </View>
  );
}
