import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <textarea
          className={cn(
            "flex min-h-[120px] w-full rounded-xl border border-border bg-card px-4 py-3",
            "text-sm text-text-primary placeholder:text-text-muted",
            "transition-all duration-200 resize-none",
            "focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-error focus:ring-error/50",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-error">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
