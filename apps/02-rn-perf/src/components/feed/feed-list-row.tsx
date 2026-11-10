import { FeedItem } from "@/components/feed/feed-item";
import { SuggestedPostsSection } from "@/components/feed/suggestions/suggested-posts-section";
import type { FeedListItem } from "@/data/mock-feed";

export const FeedListRow = ({
  item,
  onLike,
}: {
  item: FeedListItem;
  onLike: (id: string) => void;
}) => {
  if (item.type === "suggestions") {
    return <SuggestedPostsSection posts={item.posts} />;
  }

  return <FeedItem item={item} onLike={onLike} />;
};
