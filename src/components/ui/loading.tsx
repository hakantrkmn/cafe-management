"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "spinner" | "dots" | "pulse";
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

export function Loading({
  size = "md",
  variant = "default",
  text,
  className,
  fullScreen = false,
}: LoadingProps) {
  const spinner = (
    <Loader2 className={cn("animate-spin", sizeClasses[size], className)} />
  );

  const dots = (
    <div className={cn("flex space-x-1", className)}>
      <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
    </div>
  );

  const pulse = (
    <div className={cn("flex space-x-1", className)}>
      <div className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.3s]"></div>
      <div className="h-2 w-2 bg-primary rounded-full animate-pulse [animation-delay:-0.15s]"></div>
      <div className="h-2 w-2 bg-primary rounded-full animate-pulse"></div>
    </div>
  );

  const getVariant = () => {
    switch (variant) {
      case "spinner":
        return spinner;
      case "dots":
        return dots;
      case "pulse":
        return pulse;
      default:
        return spinner;
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-2">
      {getVariant()}
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}

// Preset loading components for common use cases
export function PageLoading({ text = "Yükleniyor..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loading size="lg" text={text} />
    </div>
  );
}

export function CardLoading({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <Loading size="md" text={text} />
    </div>
  );
}

export function ButtonLoading({ size = "sm" }: { size?: "sm" | "md" }) {
  return <Loading size={size} variant="spinner" />;
}

export function TableLoading({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <div className="h-4 bg-muted rounded animate-pulse flex-1"></div>
          <div className="h-4 bg-muted rounded animate-pulse w-20"></div>
          <div className="h-4 bg-muted rounded animate-pulse w-16"></div>
        </div>
      ))}
    </div>
  );
}

export function ChartLoading() {
  return (
    <div className="flex items-center justify-center h-80">
      <Loading size="lg" text="Grafik yükleniyor..." />
    </div>
  );
}

export function FullScreenLoading({
  text = "Yükleniyor...",
}: {
  text?: string;
}) {
  return <Loading fullScreen text={text} size="lg" />;
}
