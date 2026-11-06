import React from 'react';
import { Tool } from '../App';
import { PaintBrushIcon, SignatureIcon, TypographyIcon, ShieldCheckIcon, CubeIcon } from './Icons';
import { Briefcase, Video } from 'lucide-react';

interface TabSelectorProps {
  activeTool: Tool;
  onToolChange: (tool: Tool) => void;
}

const TabButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex-1 min-w-[90px] sm:min-w-0 flex items-center justify-center gap-2 px-1 sm:px-3 py-3 text-xs sm:text-sm font-semibold rounded-t-lg transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-800 focus-visible:ring-indigo-500 ${
        isActive
          ? 'bg-slate-800/80 text-indigo-400 border-t border-x border-slate-700/60 shadow-glass'
          : 'bg-transparent text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'
      }`}
      role="tab"
      aria-selected={isActive}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{label.split(' ')[0]}</span>
    </button>
  );
};

const TabSelector: React.FC<TabSelectorProps> = ({ activeTool, onToolChange }) => {
  return (
    <div className="border-b border-slate-800 overflow-x-auto scrollbar-none" role="tablist">
      <div className="flex -mb-px min-w-max sm:min-w-0">
        <TabButton
          label="Image Palette"
          icon={<PaintBrushIcon className="h-5 w-5" />}
          isActive={activeTool === 'palette'}
          onClick={() => onToolChange('palette')}
        />
        <TabButton
          label="Brand Pack"
          icon={<Briefcase className="h-4 w-4" />}
          isActive={activeTool === 'brand'}
          onClick={() => onToolChange('brand')}
        />
        <TabButton
          label="Signature"
          icon={<SignatureIcon className="h-5 w-5" />}
          isActive={activeTool === 'signature'}
          onClick={() => onToolChange('signature')}
        />
         <TabButton
          label="Logo Maker"
          icon={<CubeIcon className="h-5 w-5" />}
          isActive={activeTool === 'logo'}
          onClick={() => onToolChange('logo')}
        />
        <TabButton
          label="Monogram"
          icon={<ShieldCheckIcon className="h-5 w-5" />}
          isActive={activeTool === 'monogram'}
          onClick={() => onToolChange('monogram')}
        />
        <TabButton
          label="Typography"
          icon={<TypographyIcon className="h-5 w-5" />}
          isActive={activeTool === 'typography'}
          onClick={() => onToolChange('typography')}
        />
        <TabButton
          label="Media Studio"
          icon={<Video className="h-4.5 w-4.5" />}
          isActive={activeTool === 'video'}
          onClick={() => onToolChange('video')}
        />
      </div>
    </div>
  );
};

export default TabSelector;