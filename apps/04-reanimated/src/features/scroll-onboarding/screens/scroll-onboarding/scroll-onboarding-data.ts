import type { ImageSource } from "expo-image";

export type OnboardingAssetId =
  "landingExtended" | "landing" | "turtle" | "lizard" | "ghost" | "puff";

export type OnboardingAsset = {
  id: OnboardingAssetId;
  source: ImageSource;
};

export const ONBOARDING_BACKDROP: ImageSource = require("../../assets/07-backdrop.jpg");
export const ONBOARDING_LANDING_EXTENDED: ImageSource = require("../../assets/08-landing-extended.jpg");

export const ONBOARDING_ASSETS: Record<OnboardingAssetId, OnboardingAsset> = {
  landingExtended: {
    id: "landingExtended",
    source: ONBOARDING_LANDING_EXTENDED,
  },
  landing: {
    id: "landing",
    source: require("../../assets/01-landing.jpg"),
  },
  turtle: {
    id: "turtle",
    source: require("../../assets/03-overlay-turtle.jpg"),
  },
  lizard: {
    id: "lizard",
    source: require("../../assets/04-overlay-lizard.jpg"),
  },
  ghost: {
    id: "ghost",
    source: require("../../assets/05-overlay-ghost.jpg"),
  },
  puff: {
    id: "puff",
    source: require("../../assets/06-overlay-puff.jpg"),
  },
};

export type OnboardingSlide = {
  id: string;
  assetId: OnboardingAssetId;
  caption: string;
  variant?: "intro" | "phone";
};

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: "slide-0-intro",
    assetId: "landingExtended",
    caption: "Meet the crew and\nown the whole block",
    variant: "intro",
  },
  {
    id: "slide-1-landing",
    assetId: "landing",
    caption: "Track your stash and\nflex on the whole block",
  },
  {
    id: "slide-2-turtle",
    assetId: "turtle",
    caption: "Keep your shell cool\nwhile the streets heat up",
  },
  {
    id: "slide-3-lizard",
    assetId: "lizard",
    caption: "Stack shiny cardboard\nlike it's pure street gold",
  },
  {
    id: "slide-4-ghost",
    assetId: "ghost",
    caption: "Tag every rare pull\nbefore the crew wakes up",
  },
  {
    id: "slide-5-puff",
    assetId: "puff",
    caption: "Stay on top of hood\ntrends and late-night drops",
  },
];
