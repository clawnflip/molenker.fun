"use client";

interface FilterBarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const filters = [
  { id: "movers", label: "Movers", emoji: "📈" },
  { id: "live", label: "Live", emoji: "🔴" },
  { id: "new", label: "New", emoji: "✨" },
  { id: "marketcap", label: "Market cap", emoji: "💰" },
  { id: "mayhem", label: "Mayhem", emoji: "🦞" },
  { id: "oldest", label: "Oldest", emoji: "⏰" },
  { id: "lastreply", label: "Last reply", emoji: "💬" },
  { id: "lasttrade", label: "Last trade", emoji: "📊" },
];

export default function FilterBar({ activeFilter, onFilterChange }: FilterBarProps) {
  return (
    <div className="filter-bar">
      <div className="filter-pills">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`filter-pill ${activeFilter === filter.id ? "active" : ""}`}
          >
            <span>{filter.emoji}</span>
            <span>{filter.label}</span>
          </button>
        ))}
      </div>

      <div className="filter-controls">
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Filter</span>
        <button className="filter-pill">🔽</button>
        <button className="filter-pill">⊞</button>
        <button className="filter-pill">☰</button>
      </div>
    </div>
  );
}
