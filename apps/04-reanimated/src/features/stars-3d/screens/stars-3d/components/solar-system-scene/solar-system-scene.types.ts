export type FocusRequest = {
  index: number;
  nonce: number;
};

export type SolarSystemSceneProps = {
  focusRequest: FocusRequest | null;
  drawerHeight: number;
  isActive?: boolean;
  onSelectBody: (bodyIndex: number | null) => void;
};
