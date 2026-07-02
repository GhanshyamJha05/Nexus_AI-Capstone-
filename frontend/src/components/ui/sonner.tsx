"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "#111111",
          border: "1px solid #1f1f1f",
          color: "#f8fafc",
        },
        classNames: {
          success: "!text-green-400",
          error: "!text-red-400",
          info: "!text-cyan-400",
          warning: "!text-amber-400",
        },
      }}
      closeButton
    />
  );
}
