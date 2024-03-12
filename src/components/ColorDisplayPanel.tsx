import { calcDeltaE00 } from "@/lib/ciede2000";
import { MunsellHVC, isOutOfGamut } from "@/lib/color";
import { mhvcToHex, mhvcToLab, mhvcToMunsell } from "munsell";
import { useEffect, useRef } from "react";
import styles from "./ColorDisplayPanel.module.css";

export const Direction = ["top", "right", "bottom", "left"] as const;
export type Direction = (typeof Direction)[number];

export type ColorCanvasProps = {
  userHex: string;
  systemHex?: string;
  systemColorDirection: Direction;
};

export const ColorCanvas = ({
  userHex,
  systemHex,
  systemColorDirection,
}: ColorCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        if (systemHex) {
          ctx.fillStyle = systemHex;
          const rect = {
            top: [0, 0, canvas.width, canvas.height / 2],
            right: [canvas.width / 2, 0, canvas.width / 2, canvas.height],
            bottom: [0, canvas.height / 2, canvas.width, canvas.height / 2],
            left: [0, 0, canvas.width / 2, canvas.height],
          }[systemColorDirection] as [number, number, number, number];
          ctx.fillRect(...rect);
        } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
    }
  }, [systemHex, systemColorDirection]);
  return (
    <canvas
      ref={canvasRef}
      style={{ backgroundColor: userHex }}
      className={styles["color-canvas"]}
    />
  );
};

export type ScoreInfo = {
  score: number;
  delta: number;
};

export type ColorDisplayPanelProps = {
  describedColor1: MunsellHVC;
  paintedColor1: MunsellHVC;
  color2?: MunsellHVC;
  scoreInfo?: ScoreInfo;
};

/**
 * Note that the consequence is undefined when `userColor` is out of gamut.
 */
export const ColorDisplayPanel = ({
  describedColor1,
  paintedColor1,
  color2,
  scoreInfo,
}: ColorDisplayPanelProps) => {
  const toHex = (color: MunsellHVC) =>
    mhvcToHex(color.hue100, color.value, color.chroma);
  const toMunsell = (color: MunsellHVC) =>
    mhvcToMunsell(color.hue100, color.value, color.chroma, 1);
  const toLab = (color: MunsellHVC) => {
    const [l, a, b] = mhvcToLab(color.hue100, color.value, color.chroma);
    return { l, a, b };
  };

  return (
    <div className={styles["color-area-container"]}>
      <div className={styles["user-color-cell"]}>
        <div>Your input:</div>
        <div className={styles["color-label"]}>
          {toMunsell(describedColor1)}
        </div>
      </div>
      <div className={styles["canvas-cell"]}>
        <ColorCanvas
          userHex={toHex(paintedColor1)}
          systemHex={color2 && toHex(color2)}
          systemColorDirection="right"
        />
      </div>
      <div className={styles["system-color-cell"]}>
        {color2 && (
          <>
            <div>Answer:</div>
            <div className={styles["color-label"]}>
              {color2 && toMunsell(color2)}
            </div>
            {scoreInfo && (
              <>
                <div>Score:</div>
                <div>
                  {scoreInfo.score.toFixed(1)}{" "}
                  <span
                    className={styles["weak"]}
                  >{`(ΔE=${scoreInfo.delta.toFixed(1)})`}</span>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};
