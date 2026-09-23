export function StatCard({ value, label }: { value: number | string; label: string }) {
  return <div className="card"><div className="stat-value">{value}</div><div className="stat-label">{label}</div></div>
}
