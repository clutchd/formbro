import { describe, expect, it } from "bun:test";
import { escapeCsvCell } from "./_csv";

describe("escapeCsvCell", () => {
  it.each([
    ["=1+1", "'=1+1"],
    ["+cmd", "'+cmd"],
    ["-2+3", "'-2+3"],
    ["@SUM(A1:A2)", "'@SUM(A1:A2)"],
    ["  =1+1", "'  =1+1"],
    ["\t=1+1", "'\t=1+1"],
    ["\r=1+1", '"\'\r=1+1"'],
    ["\n=1+1", '"\'\n=1+1"'],
  ])("neutralizes spreadsheet formulas in %s", (value, expected) => {
    expect(escapeCsvCell(value)).toBe(expected);
  });

  it("quotes separators and doubles embedded quotes", () => {
    expect(escapeCsvCell('hello, "world"')).toBe('"hello, ""world"""');
  });
});
