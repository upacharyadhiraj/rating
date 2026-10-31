import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export const SortableHeader = ({
  label,
  field,
  currentSortBy,
  currentSortOrder,
  onSort,
  className = '',
}) => {
  const isActive = currentSortBy === field;

  return (
    <th
      onClick={() => onSort(field)}
      className={`px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-600 cursor-pointer select-none hover:bg-slate-100 transition-colors ${className}`}
    >
      <div className="flex items-center gap-1.5 group">
        <span>{label}</span>
        <span className="text-slate-400 group-hover:text-slate-700 transition-colors">
          {isActive ? (
            currentSortOrder === 'ASC' ? (
              <ArrowUp size={14} className="text-indigo-600 stroke-[2.5]" />
            ) : (
              <ArrowDown size={14} className="text-indigo-600 stroke-[2.5]" />
            )
          ) : (
            <ArrowUpDown size={14} className="opacity-40 group-hover:opacity-100" />
          )}
        </span>
      </div>
    </th>
  );
};
