'use client';

import { useState, useRef, useEffect } from 'react';
import { INDICATOR_DEFS } from '@/lib/indicators';

/**
 * IndicatorPanel — TradingView-style indicator selector & active indicator pills.
 *
 * Props:
 *   activeIndicators — Array of active indicator objects [{ id, ...params }]
 *   onToggle         — (indicatorConfig) => void  — toggles an indicator on/off
 *   onUpdateParams   — (id, newParams) => void    — updates indicator parameters
 */
export default function IndicatorPanel({ activeIndicators = [], onToggle, onUpdateParams }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const activeIds = new Set(activeIndicators.map((i) => i.id));
  const filtered = INDICATOR_DEFS.filter(
    (d) => d.name.toLowerCase().includes(search.toLowerCase()) || d.fullName.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(INDICATOR_DEFS.map((d) => d.category))];

  return (
    <div className="indicator-panel">
      {/* ─── Active indicator pills ──────────────────────────── */}
      <div className="indicator-pills">
        {activeIndicators.map((ind) => {
          const def = INDICATOR_DEFS.find((d) => d.id === ind.id);
          return (
            <div key={ind.id} className="indicator-pill">
              <span className="pill-dot" style={{ background: def?.color || '#6b7280' }} />
              <span className="pill-name">{def?.name || ind.id}</span>
              {ind.period && <span className="pill-param">({ind.period})</span>}

              {/* Inline edit for period-based indicators */}
              {editingId === ind.id && ind.period !== undefined ? (
                <input
                  type="number"
                  className="pill-input"
                  defaultValue={ind.period}
                  min={2}
                  max={200}
                  autoFocus
                  onBlur={(e) => {
                    const val = parseInt(e.target.value);
                    if (val >= 2 && val <= 200) onUpdateParams?.(ind.id, { period: val });
                    setEditingId(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.target.blur();
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                />
              ) : (
                <button className="pill-edit" onClick={() => ind.period !== undefined && setEditingId(ind.id)} title="Edit period">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </button>
              )}

              <button className="pill-remove" onClick={() => onToggle?.(ind)} title="Remove">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          );
        })}

        {/* Add indicator button */}
        <div className="indicator-add-wrapper" ref={dropdownRef}>
          <button className="indicator-add-btn" onClick={() => setIsOpen(!isOpen)} id="add-indicator-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            <span>Indicators</span>
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div className="indicator-dropdown">
              <input
                className="indicator-search"
                placeholder="Search indicators..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
              <div className="indicator-list">
                {categories.map((cat) => {
                  const items = filtered.filter((d) => d.category === cat);
                  if (!items.length) return null;
                  return (
                    <div key={cat}>
                      <div className="indicator-category">{cat}</div>
                      {items.map((def) => (
                        <button
                          key={def.id}
                          className={`indicator-item ${activeIds.has(def.id) ? 'active' : ''}`}
                          onClick={() => {
                            onToggle?.({ id: def.id, ...def.defaults, color: def.color });
                            if (activeIds.has(def.id)) setIsOpen(false);
                          }}
                        >
                          <span className="item-dot" style={{ background: def.color }} />
                          <span className="item-name">{def.name}</span>
                          <span className="item-full">{def.fullName}</span>
                          {activeIds.has(def.id) && (
                            <svg className="item-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                          )}
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
