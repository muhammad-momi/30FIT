import React, { useState } from 'react';

export interface BarDataPoint {
  label: string;
  value: number;
  highlight?: boolean;
  sublabel?: string;
}

interface SvgBarChartProps {
  data: BarDataPoint[];
  height?: number;
  barColor?: string;
  highlightColor?: string;
  valueFormatter?: (val: number) => string;
  unit?: string;
  emptyMessage?: string;
}

export const SvgBarChart: React.FC<SvgBarChartProps> = ({
  data,
  height = 180,
  barColor = '#334155',
  highlightColor = '#a3e635',
  valueFormatter = (val) => String(val),
  unit = '',
  emptyMessage = 'No workout activity recorded yet'
}) => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-sm text-white/40 border border-white/5 rounded-xl bg-white/[0.02]">
        {emptyMessage}
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const chartHeight = height - 40; // reserved for x-axis labels
  const barWidth = Math.min(28, Math.max(8, 280 / data.length - 6));

  return (
    <div className="w-full relative select-none">
      <svg viewBox={`0 0 320 ${height}`} className="w-full h-auto overflow-visible">
        {/* Horizontal baseline */}
        <line x1="0" y1={chartHeight} x2="320" y2={chartHeight} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((pct, i) => {
          const y = chartHeight - pct * (chartHeight - 15);
          return (
            <line
              key={i}
              x1="0"
              y1={y}
              x2="320"
              y2={y}
              stroke="rgba(255,255,255,0.04)"
              strokeDasharray="3 3"
              strokeWidth="1"
            />
          );
        })}

        {/* Bars */}
        {data.map((item, idx) => {
          const barHeight = Math.max(3, (item.value / maxValue) * (chartHeight - 20));
          const x = (idx / data.length) * 320 + (320 / data.length - barWidth) / 2;
          const y = chartHeight - barHeight;
          const isSelected = activeIdx === idx;
          const fill = item.highlight || isSelected ? highlightColor : item.value > 0 ? '#475569' : barColor;

          return (
            <g
              key={idx}
              className="cursor-pointer transition-all duration-300"
              onMouseEnter={() => setActiveIdx(idx)}
              onMouseLeave={() => setActiveIdx(null)}
              onClick={() => setActiveIdx(idx)}
            >
              {/* Bar Rect with rounded top */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={Math.min(4, barWidth / 2)}
                fill={fill}
                className="transition-all duration-300"
              />

              {/* X Axis Label */}
              <text
                x={x + barWidth / 2}
                y={chartHeight + 16}
                fill={isSelected ? '#a3e635' : 'rgba(255,255,255,0.5)'}
                fontSize="9"
                fontWeight={isSelected ? 'bold' : 'normal'}
                textAnchor="middle"
              >
                {item.label}
              </text>
            </g>
          );
        })}

        {/* Active Tooltip */}
        {activeIdx !== null && data[activeIdx] && (
          <g transform={`translate(${Math.min(250, Math.max(70, (activeIdx / data.length) * 320 + 10))}, 20)`}>
            <rect x="-55" y="-18" width="110" height="28" rx="6" fill="#1e242d" stroke="#a3e635" strokeWidth="1" filter="drop-shadow(0 4px 8px rgba(0,0,0,0.5))" />
            <text x="0" y="0" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
              {data[activeIdx].label}: {valueFormatter(data[activeIdx].value)} {unit}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
