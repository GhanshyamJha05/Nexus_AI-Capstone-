import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton animate-pulse rounded-xl bg-card/60", className)}
      {...props}
    />
  );
}

export { Skeleton };
