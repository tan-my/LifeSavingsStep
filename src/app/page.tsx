export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 text-center">
      <span className="mb-4 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Planning stage
      </span>
      <h1 className="max-w-lg text-3xl font-semibold text-foreground sm:text-4xl">
        LifeSavingsStep
      </h1>
      <p className="mt-4 max-w-md text-base text-muted-foreground">
        The yearly timeline, category breakdown, and life-event planner live
        here once they&apos;re built. See{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.9em]">
          PROJECT.md
        </code>{" "}
        for the plan.
      </p>
    </div>
  );
}
