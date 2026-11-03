import React, { useState } from 'react';

export interface LineDataPoint {
  label: string;
  value: number;
}

interface SvgLineChartProps {
  data: LineDataPoint[];
  height?: number;
  lineColor?: string;
  fillColor?: string;
  unit?: string;
  emptyMessage?: string;
}

export const SvgLineChart: React.FC<SvgLineChartProps> = ({
  data,
  height = 180,
  lineColor = '#a3e635',
  fillColor = 'rgba(163, 230, 53, 0.15)',
  unit = '',
  emptyMessage = 'No trend data recorded yet'
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
  const chartHeight = height - 40;
  const paddingX = 20;
  const availableWidth = 320 - paddingX * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * availableWidth;
    const y = chartHeight - (d.value / maxValue) * (chartHeight - 25) - 10;
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

  return (
    <div className="w-full relative select-none">
      <svg viewBox={`0 0 320 ${height}`} className="w-full h-auto overflow-visible">
        <defs>
          <linearGradient id="lineFillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={fillColor || lineColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Baseline & Grid */}
        <line x1="10" y1={chartHeight} x2="310" y2={chartHeight} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        {[0.33, 0.66, 1].map((pct, i) => (
          <line
            key={i}
            x1="10"
            y1={chartHeight - pct * (chartHeight - 20)}
            x2="310"
            y2={chartHeight - pct * (chartHeight - 20)}
            stroke="rgba(255,255,255,0.04)"
            strokeDasharray="3 3"
          />
        ))}

        {/* Area fill */}
        <path d={areaD} fill="url(#lineFillGrad)" />

        {/* Line stroke */}
        <path d={pathD} fill="none" stroke={lineColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((pt, i) => {
          const isSelected = activeIdx === i;
          return (
            <g
              key={i}
              className="cursor-pointer"
              onMouseEnter={() => setActiveIdx(i)}
              onMouseLeave={() => setActiveIdx(null)}
              onClick={() => setActiveIdx(i)}
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isSelected ? 6 : 3.5}
                fill={isSelected ? '#ffffff' : lineColor}
                stroke="#12151b"
                strokeWidth="2"
                className="transition-all duration-200"
              />
              {/* X label */}
              {(data.length <= 10 || i % Math.ceil(data.length / 7) === 0 || i === data.length - 1) && (
                <text
                  x={pt.x}
                  y={chartHeight + 16}
                  fill="rgba(255,255,255,0.5)"
                  fontSize="9"
                  textAnchor="middle"
                >
                  {pt.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Tooltip */}
        {activeIdx !== null && points[activeIdx] && (
          <g transform={`translate(${Math.min(250, Math.max(70, points[activeIdx].x))}, ${Math.max(18, points[activeIdx].y - 20)})`}>
            <rect x="-45" y="-16" width="90" height="24" rx="5" fill="#1e242d" stroke={lineColor} strokeWidth="1" />
            <text x="0" y="0" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">
              {points[activeIdx].value} {unit}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
