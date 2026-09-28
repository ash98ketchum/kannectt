import { cn } from "@/lib/utils";

describe("cn (classname utility)", () => {
  it("merges class strings", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("deduplicates conflicting tailwind classes (last wins)", () => {
    // tailwind-merge: bg-red-500 overrides bg-blue-500
    expect(cn("bg-blue-500", "bg-red-500")).toBe("bg-red-500");
  });

  it("handles undefined and null gracefully", () => {
    expect(cn("base", undefined, null as unknown as string)).toBe("base");
  });

  it("returns empty string for no args", () => {
    expect(cn()).toBe("");
  });
});
