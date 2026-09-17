import React, { useState, useRef, useEffect } from 'react';
import { Search, Image as ImageIcon, Video, Music, FileText, Grid, Sparkles, Eye, Calendar, HardDrive, Filter, X, ChevronDown } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { setSearchQuery, setFileTypeFilter, setSortBy } from '../../store/slices/filesSlice';

export const FileFilterBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector((state) => state.files);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Global Cmd+K / Ctrl+K shortcut to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K' || e.code === 'KeyK')) {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  // Click outside to close custom sort dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const categories = [
    { id: 'all', label: 'All Media', icon: Grid },
    { id: 'image', label: 'Images', icon: ImageIcon },
    { id: 'video', label: 'Videos', icon: Video },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'pdf', label: 'Documents', icon: FileText },
  ];

  const sortOptions = [
    { id: 'relevance', label: 'Relevance', icon: Sparkles },
    { id: 'views', label: 'Most Viewed', icon: Eye },
    { id: 'date', label: 'Upload Date', icon: Calendar },
    { id: 'size', label: 'File Size', icon: HardDrive },
  ];

  const activeSortObj = sortOptions.find((s) => s.id === filters.sortBy) || sortOptions[0];
  const ActiveSortIcon = activeSortObj.icon;

  const hasActiveFilters = filters.query || filters.fileType !== 'all' || filters.sortBy !== 'relevance';

  const handleResetFilters = () => {
    dispatch(setSearchQuery(''));
    dispatch(setFileTypeFilter('all'));
    dispatch(setSortBy('relevance'));
  };

  return (
    <div className="modern-filter-bar" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
      {/* Search Input Bar with Cmd+K Hint */}
      <div className="search-box-glass" style={{ display: 'flex', alignItems: 'center', background: 'rgba(30, 41, 59, 0.75)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '0.65rem 1rem', gap: '0.75rem', transition: 'border-color 0.2s, box-shadow 0.2s' }}>
        <Search size={18} style={{ color: '#6366f1', flexShrink: 0 }} />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search media by title, tags, or description..."
          value={filters.query}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          style={{ background: 'transparent', border: 'none', outline: 'none', color: '#f8fafc', fontSize: '0.95rem', width: '100%' }}
        />
        {filters.query ? (
          <button
            className="clear-search"
            onClick={() => dispatch(setSearchQuery(''))}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer', padding: 0 }}
          >
            <X size={16} />
          </button>
        ) : (
          <div className="kbd-shortcut" style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)' }}>
            Ctrl + K
          </div>
        )}
      </div>

      {/* Filter Category Pills & Custom Glass Dropdown */}
      <div className="filter-controls-row" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div className="category-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = filters.fileType === cat.id;
            return (
              <button
                key={cat.id}
                className={`pill-btn ${isActive ? 'active' : ''}`}
                onClick={() => dispatch(setFileTypeFilter(cat.id))}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.45rem 0.85rem',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  border: isActive ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
                  background: isActive ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%)' : 'rgba(15, 23, 42, 0.6)',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Icon size={15} style={{ color: isActive ? '#818cf8' : 'inherit' }} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Glassmorphism Dropdown */}
        <div className="filter-actions-right" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }} ref={dropdownRef}>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              style={{ background: 'transparent', border: 'none', color: '#ec4899', fontSize: '0.825rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <X size={14} /> Reset Filters
            </button>
          )}

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsSortOpen(!isSortOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                background: 'rgba(15, 23, 42, 0.8)',
                padding: '0.45rem 0.9rem',
                borderRadius: '10px',
                border: isSortOpen ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.12)',
                color: '#f8fafc',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                boxShadow: isSortOpen ? '0 0 16px rgba(99, 102, 241, 0.3)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <Filter size={14} style={{ color: '#6366f1' }} />
              <ActiveSortIcon size={14} style={{ color: '#818cf8' }} />
              <span>{activeSortObj.label}</span>
              <ChevronDown size={14} style={{ color: '#94a3b8', transform: isSortOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </button>

            {/* Floating Glassmorphism Options Menu */}
            {isSortOpen && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 6px)',
                  width: '180px',
                  background: 'rgba(15, 23, 42, 0.95)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  borderRadius: '12px',
                  boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255,255,255,0.05)',
                  padding: '6px',
                  zIndex: 100,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  animation: 'fadeIn 0.15s ease-out',
                }}
              >
                {sortOptions.map((opt) => {
                  const OptIcon = opt.icon;
                  const isSelected = filters.sortBy === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        dispatch(setSortBy(opt.id as 'relevance' | 'views' | 'date' | 'size'));
                        setIsSortOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '8px',
                        border: 'none',
                        background: isSelected ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)' : 'transparent',
                        color: isSelected ? '#ffffff' : '#cbd5e1',
                        fontSize: '0.85rem',
                        fontWeight: isSelected ? 600 : 500,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.15s ease, color 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <OptIcon size={15} style={{ color: isSelected ? '#818cf8' : '#94a3b8' }} />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
