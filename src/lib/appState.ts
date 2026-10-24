import { rgb255ToMhvc } from "munsell";
import { calcDeltaE00 } from "./ciede2000";
import { MunsellColor, isOutOfGamut, munsellHvcToMunsellColor } from "./color";
import { calcScore } from "./score";

export type Submission = {
  inputColor: MunsellColor;
  alternativeColor: MunsellColor;
  delta: number;
  score: number;
};

export type AppState =
  | {
      type: "freeMode";
      userInputColor: MunsellColor;
      userAlternativeColor: MunsellColor; // alternative color for the case of out-of-gamut
    }
  | {
      type: "question";
      index: number;
      userInputColor: MunsellColor;
      userAlternativeColor: MunsellColor;
      colorInQuestion: MunsellColor;
      totalScore: number; // sum of the scores of the problems submitted so far
    }
  | {
      type: "answer";
      index: number;
      userInputColor: MunsellColor;
      userAlternativeColor: MunsellColor;
      colorInQuestion: MunsellColor;
      totalScore: number;
      submission: Submission; // fixed on submit; later input does not change it
    };

export const reduceAppState = (
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

export const N_PROBLEMS = 10;

const randomMunsellColor = (): MunsellColor => {
  const rand255 = () => Math.min(Math.floor(Math.random() * 256), 255);
  const [hue100, value, chroma] = rgb255ToMhvc(rand255(), rand255(), rand255());
  return munsellHvcToMunsellColor({ hue100, value, chroma });
};

export const isProblemLastState = (appState: AppState): boolean => {
  return appState.type === "answer" && appState.index + 1 >= N_PROBLEMS;
};

const getNextState = (appState: AppState): AppState => {
  const nextProblemState = (index: number, totalScore: number): AppState => {
    return {
      type: "question",
      index,
      userInputColor: appState.userInputColor,
      userAlternativeColor: appState.userAlternativeColor,
      colorInQuestion: randomMunsellColor(),
      totalScore,
    };
  };
  switch (appState.type) {
    case "question": {
      const delta = calcDeltaE00(
        appState.userInputColor,
        appState.colorInQuestion
      );
      const score = calcScore(delta);
      return {
        ...appState,
        type: "answer",
        totalScore: appState.totalScore + score,
        submission: {
          inputColor: appState.userInputColor,
          alternativeColor: appState.userAlternativeColor,
          delta,
          score,
        },
      };
    }
    case "answer":
      if (isProblemLastState(appState)) {
        return {
          type: "freeMode",
          userInputColor: appState.userInputColor,
          userAlternativeColor: appState.userAlternativeColor,
        };
      } else {
        return nextProblemState(appState.index + 1, appState.totalScore);
      }
    case "freeMode":
      return nextProblemState(0, 0);
    default:
      throw new Error("Invalid appState");
  }
};
