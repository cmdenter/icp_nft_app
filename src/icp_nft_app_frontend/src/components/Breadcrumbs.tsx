import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from './icons';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

export const Breadcrumbs: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => (
  <nav className="flex items-center gap-1.5 text-sm py-3 px-1 overflow-x-auto hide-scrollbar">
    {items.map((item, i) => (
      <React.Fragment key={i}>
        {i > 0 && <ChevronRight size={12} className="text-os-text-secondary/40 shrink-0" />}
        {item.to ? (
          <Link
            to={item.to}
            className="text-os-text-secondary hover:text-white transition-colors whitespace-nowrap"
          >
            {item.label}
          </Link>
        ) : (
          <span className="text-os-text-secondary/60 whitespace-nowrap truncate max-w-[200px]">
            {item.label}
          </span>
        )}
      </React.Fragment>
    ))}
  </nav>
);
