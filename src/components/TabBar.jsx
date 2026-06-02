export default function TabBar({ tabs, active, onChange }) {
  return (
    <div className="tab-bar" role="tablist" aria-label="Calculator modes">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={active === tab.id}
          className={`tab-item${active === tab.id ? " tab-item--active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
