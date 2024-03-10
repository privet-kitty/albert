import { mhvcToLab } from "munsell";
import { MunsellColor, munsellColorToMunsellHvc } from "./color";

const TWO_PI = Math.PI * 2;

const mod = (dividend: number, divisor: number) => {
  const x = dividend % divisor;
  if (x >= 0) {
    return x;
  } else {
    return x + divisor;
  }
};

const degreeToRadian = (deg: number) => {
  return (deg * TWO_PI) / 360;
};

const DEGREE30 = degreeToRadian(30);
const DEGREE6 = degreeToRadian(6);
const DEGREE63 = degreeToRadian(63);
const DEGREE60 = degreeToRadian(60);
const DEGREE275 = degreeToRadian(275);
const DEGREE25_RECIPROCAL = 1 / degreeToRadian(25);

export type LabColor = [number, number, number]; // [L, a, b]

export const _calcDeltaE00 = (lab1: LabColor, lab2: LabColor): number => {
  const [l1, a1, b1] = lab1;
  const [l2, a2, b2] = lab2;
  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);
  const ΔLprime = l2 - l1;
  const Lmean = (l1 + l2) * 0.5;
  const Cmean = (C1 + C2) * 0.5;
  const Cmean7 = Math.pow(Cmean, 7);
  const G = (1 - Math.sqrt(Cmean7 / (Cmean7 + 6103515625))) * 0.5;
  const aprime1 = a1 + a1 * G;
  const aprime2 = a2 + a2 * G;
  const Cprime1 = Math.sqrt(aprime1 * aprime1 + b1 * b1);
  const Cprime2 = Math.sqrt(aprime2 * aprime2 + b2 * b2);
  const Cmeanprime = (Cprime1 + Cprime2) * 0.5;
  const Cmeanprime7 = Math.pow(Cmeanprime, 7);
  const ΔCprime = Cprime2 - Cprime1;
  const hprime1 = mod(Math.atan2(b1, aprime1), TWO_PI);
  const hprime2 = mod(Math.atan2(b2, aprime2), TWO_PI);
  let Δhprime = hprime2 - hprime1;
  let Hmeanprime = 0;
  if (Cprime1 === 0 || Cprime2 === 0) {
    Δhprime = 0;
    Hmeanprime = hprime1 + hprime2;
  } else if (Math.abs(Δhprime) <= Math.PI) {
    Hmeanprime = (hprime1 + hprime2) * 0.5;
  } else if (hprime2 <= hprime1) {
    Δhprime += TWO_PI;
    if (hprime1 + hprime2 < TWO_PI) {
      Hmeanprime = (hprime1 + hprime2 + TWO_PI) * 0.5;
    } else {
      Hmeanprime = (hprime1 + hprime2 - TWO_PI) * 0.5;
    }
  } else {
    Δhprime -= TWO_PI;
    if (hprime1 + hprime2 < TWO_PI) {
      Hmeanprime = (hprime1 + hprime2 + TWO_PI) * 0.5;
    } else {
      Hmeanprime = (hprime1 + hprime2 - TWO_PI) * 0.5;
    }
  }
  const ΔHprime = Math.sqrt(Cprime1 * Cprime2) * Math.sin(Δhprime * 0.5) * 2;
  const T =
    1 -
    0.17 * Math.cos(Hmeanprime - DEGREE30) +
    0.24 * Math.cos(2 * Hmeanprime) +
    0.32 * Math.cos(3 * Hmeanprime + DEGREE6) -
    0.2 * Math.cos(4 * Hmeanprime - DEGREE63);
  const Lmean_offsetted = Lmean - 50;
  const Lmean_offsetted_squared = Lmean_offsetted * Lmean_offsetted;
  const SL =
    1 +
    (0.015 * Lmean_offsetted_squared) / Math.sqrt(20 + Lmean_offsetted_squared);
  const SC = 1 + 0.045 * Cmeanprime;
  const SH = 1 + 0.015 * Cmeanprime * T;
  const Hmeanprime_corrected = (Hmeanprime - DEGREE275) * DEGREE25_RECIPROCAL;
  const RT =
    -2 *
    Math.sqrt(Cmeanprime7 / (Cmeanprime7 + 6103515625)) *
    Math.sin(DEGREE60 * Math.exp(-Hmeanprime_corrected * Hmeanprime_corrected));
  const factorL = ΔLprime / SL;
  const factorC = ΔCprime / SC;
  const factorH = ΔHprime / SH;
  return Math.sqrt(
    factorL * factorL +
      factorC * factorC +
      factorH * factorH +
      RT * factorC * factorH
  );
};

export const calcDeltaE00 = (
  color1: MunsellColor,
  color2: MunsellColor
): number => {
  const mhvc1 = munsellColorToMunsellHvc(color1);
  const mhvc2 = munsellColorToMunsellHvc(color2);
  const lab1 = mhvcToLab(mhvc1.hue100, mhvc1.value, mhvc1.chroma);
  const lab2 = mhvcToLab(mhvc2.hue100, mhvc2.value, mhvc2.chroma);
  return _calcDeltaE00(lab1, lab2);
};
