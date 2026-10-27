import React, { useState } from 'react';
import { SearchInput } from '../ui/SearchInput';
import { DoctorProfile } from '../common/DoctorProfile';
import { Menu } from 'lucide-react';
import { Doctor } from '../../types';

interface TopHeaderProps {
  onMenuToggle?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  doctor?: Doctor;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onMenuToggle,
  searchQuery = '',
  onSearchChange,
  doctor,
}) => {
  const [internalSearch, setInternalSearch] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInternalSearch(val);
    if (onSearchChange) onSearchChange(val);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 px-4 sm:px-6 py-3 transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden text-navy-600 hover:text-navy-900 p-2 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Center: Search Field */}
        <div className="flex-1 max-w-xl">
          <SearchInput
            value={onSearchChange ? searchQuery : internalSearch}
            onChange={handleSearch}
            onClear={() => {
              setInternalSearch('');
              if (onSearchChange) onSearchChange('');
            }}
            placeholder="Search patients by name, ID or phone number..."
            className="w-full bg-slate-50 border-slate-200/80 focus:bg-white"
          />
        </div>

        {/* Right: Clean Doctor Profile (No bell, no AI badge, no forced DP) */}
        <div className="flex items-center space-x-3">
          <DoctorProfile doctor={doctor} />
        </div>
      </div>
    </header>
  );
};
