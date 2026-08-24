import React from 'react';

interface PayMatrixGridProps {
  selectedLevel: string;
  selectedIndex: number;
}

const MATRIX_LEVEL_8: number[] = [
  35400, 36500, 37600, 38700, 39900,
  41100, 42300, 43600, 44900, 46200,
  47600, 49000, 50500, 52000, 53200,
  54800, 56400, 58100, 59800, 61600,
];

export const PayMatrixGrid: React.FC<PayMatrixGridProps> = ({ selectedLevel, selectedIndex }) => {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h4 className="font-bold text-slate-200">Tripura TSCS (RP) 2017 Pay Matrix Visualizer</h4>
        <span className="font-mono text-[10px] text-blue-400 font-bold px-2 py-0.5 bg-blue-950 border border-blue-800 rounded">
          {selectedLevel}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {MATRIX_LEVEL_8.map((val, idx) => {
          const cellIndex = idx + 1;
          const isSelected = cellIndex === selectedIndex;

          return (
            <div
              key={cellIndex}
              className={`p-2 rounded-lg border flex flex-col justify-between transition-all ${
                isSelected
                  ? 'bg-blue-600 border-blue-400 text-white shadow-lg ring-2 ring-blue-400/50'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] opacity-80 mb-0.5">
                <span>Index {cellIndex}</span>
                {isSelected && <span className="font-bold text-[9px] uppercase tracking-wider">MATCHED ✓</span>}
              </div>
              <p className="font-mono font-bold text-xs">₹{val.toLocaleString()}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
