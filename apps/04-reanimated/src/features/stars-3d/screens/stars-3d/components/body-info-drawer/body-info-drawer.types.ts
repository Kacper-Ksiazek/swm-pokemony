import type { ReactNode } from "react";

import type { SolarSystemBodyInfo } from "../../solar-system";

export type IndexedBody = {
  index: number;
  body: SolarSystemBodyInfo;
};

export type BodyInfoDrawerProps = {
  bodyIndex: number | null;
  onSelectBody: (index: number) => void;
  onRefocus: (index: number) => void;
  onClose: () => void;
  onHeightChange: (height: number) => void;
};

export type BodyChipProps = {
  item: IndexedBody;
  active?: boolean;
  onPress: () => void;
};

export type TreeBranchProps = {
  children: ReactNode;
  nested?: boolean;
};

export type DrawerHeaderProps = {
  body: SolarSystemBodyInfo;
  bodyIndex: number;
  onRefocus: (index: number) => void;
  onClose: () => void;
};

export type BodyFactsRowProps = {
  facts: SolarSystemBodyInfo["facts"];
};

export type HierarchySectionProps = {
  bodyIndex: number;
  body: SolarSystemBodyInfo;
  parent: IndexedBody | null;
  siblings: IndexedBody[];
  childBodies: IndexedBody[];
  onSelectBody: (index: number) => void;
  onRefocus: (index: number) => void;
};
