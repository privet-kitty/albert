import { mhvcToHex, mhvcToRgb255 } from "munsell";

export type MunsellHVC = {
  hue100: number;
  value: number;
  chroma: number;
};

export const HueNames = [
  "R",
  "YR",
  "Y",
  "GY",
  "G",
  "BG",
  "B",
  "PB",
  "P",
  "RP",
] as const;
export type HueName = (typeof HueNames)[number];

export type MunsellColor = {
  hueName: HueName;
  huePrefix: number;
  value: number;
  chroma: number;
};

const calcHue100 = (hueName: HueName, huePrefix: number): number => {
  return HueNames.indexOf(hueName) * 10 + huePrefix;
};

export const munsellHvcToMunsellColor = (hvc: MunsellHVC): MunsellColor => {
  const hueName = HueNames[Math.floor(hvc.hue100 / 10)];
  const huePrefix = hvc.hue100 % 10;
  return { hueName, huePrefix, value: hvc.value, chroma: hvc.chroma };
};

export const munsellColorToMunsellHvc = (color: MunsellColor): MunsellHVC => {
  return {
    hue100: calcHue100(color.hueName, color.huePrefix),
    value: color.value,
    chroma: color.chroma,
  };
};

export const isOutOfGamut = (color: MunsellColor): boolean => {
  const hue100 = calcHue100(color.hueName, color.huePrefix);
  const [r, g, b] = mhvcToRgb255(hue100, color.value, color.chroma, false);
  return r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255;
};

export const munsellColorToHex = (color: MunsellColor): string => {
  const hue100 = calcHue100(color.hueName, color.huePrefix);
  return mhvcToHex(hue100, color.value, color.chroma);
};
