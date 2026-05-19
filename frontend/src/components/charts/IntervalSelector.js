'use client';

/**
 * IntervalSelector — Timeframe button group for chart interval selection.
 *
 * Props:
 *   intervals     — Array of { label, value } objects
 *   activeInterval — Currently selected interval value
 *   onChange       — (intervalValue) => void
 */

const DEFAULT_INTERVALS = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1H', value: '1h' },
  { label: '4H', value: '4h' },
  { label: '1D', value: '1d' },
  { label: '1W', value: '1w' },
];

export default function IntervalSelector({ intervals = DEFAULT_INTERVALS, activeInterval = '1h', onChange }) {
  return (
    <div className="interval-selector" id="interval-selector">
      {intervals.map((tf) => (
        <button
          key={tf.value}
          className={`interval-btn ${activeInterval === tf.value ? 'active' : ''}`}
          onClick={() => onChange?.(tf.value)}
          id={`interval-${tf.value}`}
        >
          {tf.label}
        </button>
      ))}
    </div>
  );
}
