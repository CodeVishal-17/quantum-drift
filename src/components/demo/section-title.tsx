export function SectionTitle({ index, title, description }: { index: string; title: string; description: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs text-cyan">{index}</span>
        <h2 className="text-lg font-semibold tracking-tight text-text">{title}</h2>
      </div>
      <p className="max-w-2xl text-sm text-text-3">{description}</p>
    </div>
  );
}
