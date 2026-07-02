"use client";

import { useEffect } from "react";

type Key = string;
type Modifier = "meta" | "ctrl" | "alt" | "shift";

interface Options {
  modifiers?: Modifier[];
  onKeydown?: (e: KeyboardEvent) => void;
  preventDefault?: boolean;
  enabled?: boolean;
}

export function useKeyboardShortcut(
  key: Key,
  callback: () => void,
  options: Options = {}
) {
  const {
    modifiers = [],
    preventDefault = true,
    enabled = true,
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      const modMatch = modifiers.every((mod) => {
        if (mod === "meta") return e.metaKey;
        if (mod === "ctrl") return e.ctrlKey;
        if (mod === "alt") return e.altKey;
        if (mod === "shift") return e.shiftKey;
        return false;
      });

      if (modMatch && e.key.toLowerCase() === key.toLowerCase()) {
        if (preventDefault) e.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, callback, modifiers, preventDefault, enabled]);
}
