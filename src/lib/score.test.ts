import { calcScore } from "./score";

describe("calcScore", () => {
  it("should return 10 when delta <= 2", () => {
    expect(calcScore(0)).toBe(10);
    expect(calcScore(2)).toBe(10);
  });

  it("should return 0 when delta >= 16", () => {
    expect(calcScore(16)).toBe(0);
    expect(calcScore(17)).toBe(0);
  });

  it("should return a value between 0 and 10 when 2 < delta < 16", () => {
    expect(calcScore(3)).toBeGreaterThan(0);
    expect(calcScore(3)).toBeLessThan(10);
    expect(calcScore(15)).toBeGreaterThan(0);
    expect(calcScore(15)).toBeLessThan(10);
  });
});
