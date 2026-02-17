import React, { useState } from 'react';
import { ChevronDown } from './icons';

interface Props {
  title: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export const Accordion: React.FC<Props> = ({ title, icon, defaultOpen = false, children }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-os-border/70 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 bg-os-surface hover:bg-os-card transition-colors text-left active:scale-[0.99]"
      >
        {icon && <span className="text-os-text-secondary">{icon}</span>}
        <span className="flex-1 font-bold text-sm text-white">{title}</span>
        <ChevronDown
          size={16}
          className={`text-os-text-secondary hover:text-os-primary transition-all duration-250 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-5 py-4 bg-os-surface border-t border-os-border/70">
          {children}
        </div>
      )}
    </div>
  );
};
