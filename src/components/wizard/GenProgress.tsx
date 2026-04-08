"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { useWizardStore } from "@/hooks/useWizardState";

interface GenProgressProps {
  active: boolean;
  label?: string;
}

export function GenProgress({ active, label }: GenProgressProps) {
  const { genTimes } = useWizardStore();
  const [elapsed, setElapsed] = useState(0);

  // Calculate average from history, default 20s if no data
  const avgTime =
    genTimes.length > 0
      ? genTimes.reduce((a, b) => a + b, 0) / genTimes.length
      : 20000;

  useEffect(() => {
    if (!active) {
      setElapsed(0);
      return;
    }

    const start = Date.now();
    const interval = setInterval(() => {
      setElapsed(Date.now() - start);
    }, 200);

    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  // Progress caps at 95% until actual completion
  const rawPercent = (elapsed / avgTime) * 100;
  const percent = Math.min(rawPercent, 95);
  const elapsedSec = Math.floor(elapsed / 1000);
  const estTotal = Math.ceil(avgTime / 1000);
  const remaining = Math.max(0, estTotal - elapsedSec);

  return (
    <div className="space-y-2 w-full">
      <Progress value={percent} className="h-2" />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{label || "Generating..."}</span>
        <span>
          {elapsedSec}s{" "}
          {genTimes.length > 0
            ? `/ ~${remaining}s remaining`
            : `(estimating...)`}
        </span>
      </div>
    </div>
  );
}
