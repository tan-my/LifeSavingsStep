interface StatTileProps {
  label: string;
  value: string;
  sublabel?: string;
}

export default function StatTile({ label, value, sublabel }: StatTileProps) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-0.5 truncate text-lg font-semibold text-card-foreground">{value}</p>
      {sublabel && <p className="text-[11px] text-muted-foreground">{sublabel}</p>}
    </div>
  );
}
