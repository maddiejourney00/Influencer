"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { UsageCounter } from "@/components/wizard/UsageCounter";

const STEPS = [
  { label: "Upload", path: "/wizard/step-1-upload" },
  { label: "Hero", path: "/wizard/step-2-hero" },
  { label: "Variations", path: "/wizard/step-3-variations" },
  { label: "Select", path: "/wizard/step-4-select" },
];

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentStepIndex = STEPS.findIndex((s) => pathname.startsWith(s.path));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-2xl font-bold">Content Generator</h1>
            <div className="flex items-center gap-6">
              <UsageCounter />
              <Link
                href="/gallery"
                className="text-base text-muted-foreground hover:text-foreground transition-colors"
              >
                Gallery
              </Link>
              <Link
                href="/settings"
                className="text-base text-muted-foreground hover:text-foreground transition-colors"
              >
                Settings
              </Link>
            </div>
          </div>
          <nav className="flex gap-2">
            {STEPS.map((step, i) => (
              <div key={step.path} className="flex items-center flex-1">
                <Link
                  href={step.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors w-full",
                    i === currentStepIndex
                      ? "bg-primary text-primary-foreground"
                      : i < currentStepIndex
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                      i === currentStepIndex
                        ? "bg-primary-foreground text-primary"
                        : i < currentStepIndex
                          ? "bg-foreground text-background"
                          : "bg-muted-foreground/30 text-muted-foreground"
                    )}
                  >
                    {i < currentStepIndex ? "\u2713" : i + 1}
                  </span>
                  {step.label}
                </Link>
              </div>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
