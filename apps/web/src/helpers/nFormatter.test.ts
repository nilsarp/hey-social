import { describe, expect, it } from "vitest";
import nFormatter from "./nFormatter";

describe("nFormatter", () => {
  it("returns empty string for invalid number", () => {
    expect(nFormatter(Number.POSITIVE_INFINITY)).toBe("");
  });

  it("formats small numbers", () => {
    expect(nFormatter(999)).toBe("999");
  });

  it("formats large numbers", () => {
    expect(nFormatter(1500)).toBe("1.5k");
  });

  it("handles negative numbers", () => {
    expect(nFormatter(-1500)).toBe("-1,500");
  });

  it("formats extremely large numbers", () => {
    expect(nFormatter(1e12)).toBe("1T");
  });
});
