export type FocusRequest = {
  index: number;
  nonce: number;
};

export type SolarSystemSceneProps = {
  focusRequest: FocusRequest | null;
  drawerHeight: number;
  onSelectBody: (bodyIndex: number | null) => void;
};
