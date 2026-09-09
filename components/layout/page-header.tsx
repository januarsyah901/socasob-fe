export function PageHeader({
  title,
  subtitle,
  description,
  eyebrow,
  action,
}: {
  title: string;
  subtitle?: string;
  description?: string;
  eyebrow?: string;
  action?: React.ReactNode;
}) {
  const sub = subtitle || description;
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
      <div>
        {eyebrow && (
          <span className="text-[10px] font-extrabold text-signal-blue uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-signal-blue/10 border border-signal-blue/20 mb-1.5 inline-block">
            {eyebrow}
          </span>
        )}
        <h1 className="text-2xl font-semibold text-text" style={{ fontFamily: 'var(--font-figtree)' }}>
          {title}
        </h1>
        {sub && <p className="text-sm text-text-muted mt-1 max-w-xl">{sub}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}
