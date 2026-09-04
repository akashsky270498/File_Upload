import React from 'react';
import { Search, Image as ImageIcon, Video, Music, FileText, Grid, Sparkles, Eye, Calendar, HardDrive } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { setSearchQuery, setFileTypeFilter, setSortBy } from '../../store/slices/filesSlice';

export const FileFilterBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector((state) => state.files);

  const categories = [
    { id: 'all', label: 'All Media', icon: Grid },
    { id: 'image', label: 'Images', icon: ImageIcon },
    { id: 'video', label: 'Videos', icon: Video },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'pdf', label: 'PDF Documents', icon: FileText },
  ];

  return (
    <div className="filter-bar">
      {/* Search Input */}
      <div className="search-box">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          placeholder="Search media by title, description, or tags..."
          value={filters.query}
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
        />
        {filters.query && (
          <button className="clear-search" onClick={() => dispatch(setSearchQuery(''))}>
            ×
          </button>
        )}
      </div>

      {/* Filter Category Pills & Sort Controls */}
      <div className="filter-controls">
        <div className="category-pills">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = filters.fileType === cat.id;
            return (
              <button
                key={cat.id}
                className={`pill-btn ${isActive ? 'active' : ''}`}
                onClick={() => dispatch(setFileTypeFilter(cat.id))}
              >
                <Icon size={16} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sort By Selector */}
        <div className="sort-selector">
          <label>Sort By:</label>
          <div className="select-wrapper">
            <select
              value={filters.sortBy}
              onChange={(e) =>
                dispatch(setSortBy(e.target.value as 'relevance' | 'views' | 'date' | 'size'))
              }
            >
              <option value="relevance">✨ Best Relevance</option>
              <option value="views">👁️ Most Viewed</option>
              <option value="date">📅 Upload Date</option>
              <option value="size">💾 File Size</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
