import { formatNumber } from "../formatters";

describe("formatNumber", () => {
  it("formats the number with commas", () => {
    expect(formatNumber(0)(12345)).toEqual("12,345");
    expect(formatNumber(2)(12345)).toEqual("12,345.00");
  });
});
