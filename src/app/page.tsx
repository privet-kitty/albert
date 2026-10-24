"use client";

import styles from "./page.module.css";
import MunsellColorSelector from "@/components/MunsellColorSelector";
import { ColorDisplayPanel } from "@/components/ColorDisplayPanel";
import { useReducer } from "react";
import {
  MunsellColor,
  isOutOfGamut,
  munsellColorToMunsellHvc,
} from "@/lib/color";
import ProgressBar from "@/components/ProgressBar";
import { calcRank } from "@/lib/score";
import {
  AppState,
  N_PROBLEMS,
  isProblemLastState,
  reduceAppState,
} from "@/lib/appState";

const getButtonText = (appState: AppState): string => {
  switch (appState.type) {
    case "question":
      return "Submit";
    case "answer":
      if (appState.index + 1 >= N_PROBLEMS) {
        return "Finish";
      }
      return `Go to next (${appState.index + 2}/${N_PROBLEMS})`; // 1-based
    case "freeMode":
      return "Start problem set";
    default:
      throw new Error("Invalid appState");
  }
};

const getColorDisplayPanelProps = (appState: AppState) => {
  switch (appState.type) {
    case "question":
      return {
        describedColor1: munsellColorToMunsellHvc(appState.userInputColor),
        paintedColor1: munsellColorToMunsellHvc(appState.colorInQuestion),
      };
    case "answer":
      const { submission } = appState;
      return {
        describedColor1: munsellColorToMunsellHvc(submission.inputColor),
        paintedColor1: munsellColorToMunsellHvc(submission.alternativeColor),
        color2: munsellColorToMunsellHvc(appState.colorInQuestion),
        scoreInfo: {
          delta: submission.delta,
          score: submission.score,
        },
      };
    case "freeMode":
      return {
        describedColor1: munsellColorToMunsellHvc(appState.userInputColor),
        paintedColor1: munsellColorToMunsellHvc(appState.userAlternativeColor),
      };
    default:
      throw new Error("Invalid appState");
  }
};

const initColor: MunsellColor = {
  hueName: "PB",
  huePrefix: 5,
  value: 3,
  chroma: 5,
};

export default function Home() {
  const [appState, dispatch] = useReducer(reduceAppState, {
    type: "freeMode",
    userInputColor: initColor,
    userAlternativeColor: initColor,
  });
  return (
    <main>
      <div className={styles["top-half"]}>
        <div className={styles["header-container"]}>
          <h1 className={styles["title"]}>Guess Munsell Code</h1>
        </div>
        <div className={styles["right-header"]}>
          <a href="https://github.com/privet-kitty/albert/blob/master/README.md">
            README
          </a>
        </div>
        <div>
          <ColorDisplayPanel {...getColorDisplayPanelProps(appState)} />
        </div>
      </div>
      <div className={styles["bottom-half"]}>
        <div className={styles["relative-container"]}>
          <div
            className={
              isOutOfGamut(appState.userInputColor)
                ? styles["out-of-gamut-overlay"]
                : ""
            }
          />
          <MunsellColorSelector
            initColor={initColor}
            onChange={(newColor) =>
              dispatch({ type: "selectColor", color: newColor })
            }
          />
          <div className={styles["centering-container"]}>
            <button
              type="button"
              onClick={() => dispatch({ type: "forward" })}
              className={styles["transition-button"]}
            >
              {getButtonText(appState)}
            </button>
          </div>
        </div>
      </div>
      <div className={styles["footer"]}>
        <ProgressBar
          value={
            appState.type === "freeMode"
              ? 0
              : appState.index + (appState.type === "answer" ? 1 : 0)
          }
          maxVal={N_PROBLEMS}
        />
        {appState.type === "answer" && isProblemLastState(appState) && (
          <div className={styles["evaluation"]}>
            {`Total Score: ${appState.totalScore.toFixed(1)} ${calcRank(
              appState.totalScore
            )}`}
          </div>
        )}
      </div>
    </main>
  );
}
