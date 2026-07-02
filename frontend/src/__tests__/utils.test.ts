import {
  formatRelativeTime,
  formatDuration,
  truncate,
  confidenceToLabel,
  confidenceToColor,
  riskToColor,
  statusToColor,
} from "@/lib/utils";

describe("formatDuration", () => {
  it("formats seconds under a minute", () => {
    expect(formatDuration(45)).toBe("45s");
  });

  it("formats minutes and seconds", () => {
    expect(formatDuration(125)).toBe("2m 5s");
  });
});

describe("truncate", () => {
  it("returns string unchanged if within limit", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates with ellipsis", () => {
    expect(truncate("hello world", 5)).toBe("hello...");
  });
});

describe("confidenceToLabel", () => {
  it("returns Very High for >= 0.85", () => {
    expect(confidenceToLabel(0.9)).toBe("Very High");
  });

  it("returns Low for < 0.5", () => {
    expect(confidenceToLabel(0.4)).toBe("Low");
  });
});

describe("confidenceToColor", () => {
  it("returns success class for high confidence", () => {
    expect(confidenceToColor(0.9)).toBe("text-success");
  });

  it("returns error class for very low confidence", () => {
    expect(confidenceToColor(0.2)).toBe("text-error");
  });
});

describe("riskToColor", () => {
  it("maps low to success", () => {
    expect(riskToColor("low")).toContain("text-success");
  });

  it("maps critical to error", () => {
    expect(riskToColor("critical")).toContain("text-error");
  });
});

describe("statusToColor", () => {
  it("maps completed to success", () => {
    expect(statusToColor("completed")).toContain("text-success");
  });

  it("maps failed to error", () => {
    expect(statusToColor("failed")).toContain("text-error");
  });
});
