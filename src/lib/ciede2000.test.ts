import { LabColor, _calcDeltaE00 } from "./ciede2000";
import fs from "fs";

describe("calcDeltaE00", () => {
  const testCases: Array<{ lab1: LabColor; lab2: LabColor; delta: number }> =
    [];

  beforeAll(() => {
    const lines = fs
      .readFileSync("fixture/ciede2000-test-data.csv", {
        encoding: "ascii",
      })
      .trim()
      .split("\n");
    for (let i = 0; i < lines.length; i += 2) {
      const row1 = lines[i].split(",").map(parseFloat);
      const row2 = lines[i + 1].split(",").map(parseFloat);
      testCases.push({
        lab1: row1.slice(0, 3) as LabColor,
        lab2: row2.slice(0, 3) as LabColor,
        delta: row1.slice(-1)[0],
      });
    }
  });

  it("should return 0 for the same color", () => {
    const lab1: LabColor = [50, 2.6772, 0.9909];
    const lab2: LabColor = [50, 2.6772, 0.9909];
    expect(_calcDeltaE00(lab1, lab2)).toBe(0);
  });

  test("Sharma-Wu-Dalal test cases", () => {
    for (const { lab1, lab2, delta } of testCases) {
      expect(_calcDeltaE00(lab1, lab2)).toBeCloseTo(delta, 4);
    }
  });
});
