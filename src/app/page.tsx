"use client";

import styles from "./page.module.css";
import MunsellColorSelector from "@/components/MunsellColorSelector";
import { ColorDisplayPanel } from "@/components/ColorDisplayPanel";
import { useReducer, useRef } from "react";
import {
  MunsellColor,
  isOutOfGamut,
  munsellColorToMunsellHvc,
  munsellHvcToMunsellColor,
} from "@/lib/color";
import { rgb255ToMhvc } from "munsell";
import { calcDeltaE00 } from "@/lib/ciede2000";
import ProgressBar from "@/components/ProgressBar";
import { calcRank, calcScore } from "@/lib/score";

type AppState =
  | {
      type: "freeMode";
      userInputColor: MunsellColor;
      userAlternativeColor: MunsellColor; // alternative color for the case of out-of-gamut
    }
  | {
      type: "question" | "answer";
      index: number;
      userInputColor: MunsellColor;
      userAlternativeColor: MunsellColor;
      colorInQuestion: MunsellColor;
    };

const reduceAppState = (
  appState: AppState,
  action: { type: "forward" } | { type: "selectColor"; color: MunsellColor }
): AppState => {
  if (action.type === "forward") {
    return getNextState(appState);
  } else {
    return {
      ...appState,
      userInputColor: action.color,
      userAlternativeColor: isOutOfGamut(action.color)
        ? appState.userAlternativeColor
        : action.color,
    };
  }
};

const N_PROBLEMS = 10;

const randomMunsellColor = (): MunsellColor => {
  const rand255 = () => Math.min(Math.floor(Math.random() * 256), 255);
  const [hue100, value, chroma] = rgb255ToMhvc(rand255(), rand255(), rand255());
  return munsellHvcToMunsellColor({ hue100, value, chroma });
};

const isProblemLastState = (appState: AppState): boolean => {
  return appState.type === "answer" && appState.index + 1 >= N_PROBLEMS;
};

const getNextState = (appState: AppState): AppState => {
  const nextProblemState = (): AppState => {
    return {
      ...appState,
      type: "question",
      index: appState.type === "freeMode" ? 0 : appState.index + 1,
      colorInQuestion: randomMunsellColor(),
    };
  };
  switch (appState.type) {
    case "question":
      return {
        ...appState,
        type: "answer",
        index: appState.index,
      };
    case "answer":
      if (isProblemLastState(appState)) {
        return {
          ...appState,
          type: "freeMode",
        };
      } else {
        return nextProblemState();
      }
    case "freeMode":
      return nextProblemState();
    default:
      throw new Error("Invalid appState");
  }
};

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
      const delta = calcDeltaE00(
        appState.userInputColor,
        appState.colorInQuestion
      );
      return {
        describedColor1: munsellColorToMunsellHvc(appState.userInputColor),
        paintedColor1: munsellColorToMunsellHvc(appState.userAlternativeColor),
        color2: munsellColorToMunsellHvc(appState.colorInQuestion),
        scoreInfo: {
          delta,
          score: calcScore(delta),
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
  const totalScore = useRef(0);

  const updateTotalScore = () => {
    if (appState.type === "answer") {
      totalScore.current += calcScore(
        calcDeltaE00(appState.userInputColor, appState.colorInQuestion)
      );
    }
    if (isProblemLastState(appState)) {
      totalScore.current = 0;
    }
  };

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
              onClick={() => {
                dispatch({ type: "forward" });
                updateTotalScore();
              }}
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
        {isProblemLastState(appState) && (
          <div className={styles["evaluation"]}>
            {`Total Score: ${totalScore.current.toFixed(1)} ${calcRank(
              totalScore.current
            )}`}
          </div>
        )}
      </div>
    </main>
  );
}
