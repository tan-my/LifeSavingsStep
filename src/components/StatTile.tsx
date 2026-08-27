interface StatTileProps {
  label: string;
  value: string;
  sublabel?: string;
  tone?: "default" | "success" | "danger";
  onClick?: () => void;
}

const toneClass: Record<NonNullable<StatTileProps["tone"]>, string> = {
  default: "text-card-foreground",
  success: "text-success",
  danger: "text-danger",
};

export default function StatTile({ label, value, sublabel, tone = "default", onClick }: StatTileProps) {
  const Element = onClick ? "button" : "div";
  return (
    <Element
      onClick={onClick}
      className={`rounded-lg border border-border bg-card px-3 py-2 text-left ${
        onClick ? "cursor-pointer transition-colors hover:bg-muted" : ""
      }`}
    >
      <p className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className={`mt-0.5 truncate text-lg font-semibold ${toneClass[tone]}`}>{value}</p>
      {sublabel && <p className="text-[11px] text-muted-foreground">{sublabel}</p>}
    </Element>
  );
}
