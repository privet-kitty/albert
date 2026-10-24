import { rgb255ToMhvc } from "munsell";
import { MunsellColor, isOutOfGamut, munsellHvcToMunsellColor } from "./color";

export type AppState =
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
