'use client';

import { useState, useRef, useEffect } from 'react';

interface DropdownItem {
  label: string;
  icon?: string | React.ReactNode;
  onClick: () => void;
}

interface DropdownMenuProps {
  items: DropdownItem[];
  iconSize?: number;
  triggerIcon?: string | React.ReactNode;
}

export default function DropdownMenu({
  items,
  iconSize = 20,
  triggerIcon = '⋮',
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="bg-transparent border-none cursor-pointer text-[var(--color-text-primary)] p-1.5 rounded hover:bg-[var(--color-bg-surface)] transition-colors flex items-center justify-center"
        aria-label="منو"
        style={{ fontSize: iconSize }}
      >
        {triggerIcon}
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 bg-[var(--color-bg-card)] border border-[var(--color-border-color)] shadow-lg z-[1000] min-w-[180px] py-1">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick();
                setIsOpen(false);
              }}
              className="w-full text-right px-4 py-2.5 border-none bg-transparent cursor-pointer text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-colors flex items-center gap-2"
            >
              {item.icon && <span className="text-base">{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}