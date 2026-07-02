import { renderHook, act } from "@testing-library/react";
import { useLocalStorage } from "@/hooks/use-local-storage";

describe("useLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns initial value when nothing is stored", () => {
    const { result } = renderHook(() => useLocalStorage("test-key", "default"));
    expect(result.current[0]).toBe("default");
  });

  it("stores and retrieves value", () => {
    const { result } = renderHook(() => useLocalStorage("test-key2", 0));
    act(() => {
      result.current[1](42);
    });
    expect(result.current[0]).toBe(42);
    expect(localStorage.getItem("test-key2")).toBe("42");
  });

  it("removes value", () => {
    const { result } = renderHook(() => useLocalStorage("test-key3", "hello"));
    act(() => {
      result.current[1]("world");
    });
    act(() => {
      result.current[2]();
    });
    expect(result.current[0]).toBe("hello");
  });
});
