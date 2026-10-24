import { describe, expect, it } from "vitest";
import {
  AppState,
  N_PROBLEMS,
  isProblemLastState,
  reduceAppState,
} from "./appState";
import { calcDeltaE00 } from "./ciede2000";
import { MunsellColor } from "./color";
import { calcScore } from "./score";

const initColor: MunsellColor = {
  hueName: "PB",
  huePrefix: 5,
  value: 3,
  chroma: 5,
};

const freeModeState: AppState = {
  type: "freeMode",
  userInputColor: initColor,
  userAlternativeColor: initColor,
};

const forward = (appState: AppState) =>
  reduceAppState(appState, { type: "forward" });

const selectColor = (appState: AppState, color: MunsellColor) =>
  reduceAppState(appState, { type: "selectColor", color });

const expectType = <T extends AppState["type"]>(appState: AppState, type: T) => {
  expect(appState.type).toBe(type);
  return appState as Extract<AppState, { type: T }>;
};

// Plays a whole problem set, answering every problem exactly, and returns the
// answer state of the last problem.
const playPerfectProblemSet = () => {
  let appState = forward(freeModeState);
  for (let i = 0; i < N_PROBLEMS; i++) {
    if (i > 0) appState = forward(appState);
    const question = expectType(appState, "question");
    appState = forward(selectColor(question, question.colorInQuestion));
  }
  return expectType(appState, "answer");
};

describe("reduceAppState", () => {
  it("should fix the score on submit", () => {
    const colorInQuestion: MunsellColor = {
      hueName: "R",
      huePrefix: 5,
      value: 5,
      chroma: 10,
    };
    const question: AppState = {
      type: "question",
      index: 0,
      userInputColor: initColor,
      userAlternativeColor: initColor,
      colorInQuestion,
      totalScore: 0,
    };
    const answer = expectType(forward(question), "answer");
    const delta = calcDeltaE00(initColor, colorInQuestion);
    expect(answer.submission).toEqual({
      inputColor: initColor,
      alternativeColor: initColor,
      delta,
      score: calcScore(delta),
    });
    expect(answer.totalScore).toBe(calcScore(delta));
    expect(answer.submission.score).toBeLessThan(10);

    // Matching the answer after it is revealed does not change the score.
    const changed = expectType(selectColor(answer, colorInQuestion), "answer");
    expect(changed.userInputColor).toEqual(colorInQuestion);
    expect(changed.submission).toEqual(answer.submission);
    expect(changed.totalScore).toBe(answer.totalScore);
  });

  it("should include the last problem in the total score", () => {
    const lastAnswer = playPerfectProblemSet();
    expect(isProblemLastState(lastAnswer)).toBe(true);
    expect(lastAnswer.totalScore).toBe(10 * N_PROBLEMS);
  });

  it("should reset the total score when a new problem set starts", () => {
    const lastAnswer = playPerfectProblemSet();
    expectType(forward(lastAnswer), "freeMode");
    const question = expectType(forward(forward(lastAnswer)), "question");
    expect(question.index).toBe(0);
    expect(question.totalScore).toBe(0);
  });
});
