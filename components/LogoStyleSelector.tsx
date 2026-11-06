import React from 'react';
import { LogoStyle, LogoStyleOption } from '../types';
import { ChevronDownIcon } from './Icons';

interface LogoStyleSelectorProps {
  selectedStyle: LogoStyle;
  onStyleChange: (style: LogoStyle) => void;
  options: LogoStyleOption[];
  disabled?: boolean;
}

const LogoStyleSelector: React.FC<LogoStyleSelectorProps> = ({ selectedStyle, onStyleChange, options, disabled }) => {
  return (
    <div className="space-y-2">
      <label htmlFor="logoStyle" className="block text-sm font-medium text-sky-300">
        Choose a logo style:
      </label>
      <div className="relative">
        <select
          id="logoStyle"
          value={selectedStyle}
          onChange={(e) => onStyleChange(e.target.value as LogoStyle)}
          disabled={disabled}
          className="w-full appearance-none p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-shadow disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-slate-700 text-slate-100">
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
          <ChevronDownIcon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

export default LogoStyleSelector;