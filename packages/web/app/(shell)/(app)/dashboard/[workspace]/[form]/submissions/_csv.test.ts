import { describe, expect, it } from "bun:test";
import { escapeCsvCell } from "./_csv";

describe("escapeCsvCell", () => {
  it.each([
    "=1+1",
    "+cmd",
    "-2+3",
    "@SUM(A1:A2)",
    '  =HYPERLINK("https://example.com")',
    '\t=HYPERLINK("https://example.com")',
    "\r=1+1",
    "\n=1+1",
  ])("neutralizes spreadsheet formulas in %s", (value) => {
    expect(escapeCsvCell(value)).toBe(`'${value}`);
  });

  it("quotes separators and doubles embedded quotes", () => {
    expect(escapeCsvCell('hello, "world"')).toBe('"hello, ""world"""');
  });
});
