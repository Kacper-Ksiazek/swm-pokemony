export type KksiazekOrientation =
  | "PORTRAIT_UP"
  | "PORTRAIT_DOWN"
  | "LANDSCAPE_LEFT"
  | "LANDSCAPE_RIGHT"
  | "UNKNOWN";

export type KksiazekOrientationChangeEvent = {
  orientation: KksiazekOrientation;
};
