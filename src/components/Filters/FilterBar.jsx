import React from 'react';
import './FilterBar.css';

export default function FilterBar({
  filters,
  onFilterChange,
  uniqueModels,
  showSource = false,
  showStatus = true,
  showWheelLine = true,
  showLifecycleStatus = true,
  showSearch = true,
}) {
  const handleChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="filter-bar no-print">
      {showSearch && (
        <div className="filter-group filter-search">
          <label className="filter-label">Search</label>
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search Model or Part No..."
              value={filters.search || ''}
              onChange={(e) => handleChange('search', e.target.value)}
              className="filter-input search-input"
            />
            {filters.search && (
              <button 
                type="button" 
                className="search-clear" 
                onClick={() => handleChange('search', '')}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {showSource && (
        <div className="filter-group">
          <label className="filter-label">Source</label>
          <div className="segmented-control">
            <button
              type="button"
              className={`segment-btn ${filters.source === 'all' ? 'active' : ''}`}
              onClick={() => handleChange('source', 'all')}
            >
              All
            </button>
            <button
              type="button"
              className={`segment-btn ${filters.source === 'default' ? 'active' : ''}`}
              onClick={() => handleChange('source', 'default')}
            >
              Default
            </button>
            <button
              type="button"
              className={`segment-btn ${filters.source === 'custom' ? 'active' : ''}`}
              onClick={() => handleChange('source', 'custom')}
            >
              Custom
            </button>
          </div>
        </div>
      )}

      <div className="filter-group">
        <label className="filter-label">Model</label>
        <select
          value={filters.model || 'all'}
          onChange={(e) => handleChange('model', e.target.value)}
          className="filter-select"
        >
          <option value="all">All Models</option>
          {uniqueModels.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {showWheelLine && (
        <div className="filter-group">
          <label className="filter-label">Part Name</label>
          <select
            value={filters.wheelLine || 'all'}
            onChange={(e) => handleChange('wheelLine', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Lines</option>
            <option value="Front wheel Assy">Front Wheel</option>
            <option value="Rear wheel Assy">Rear Wheel</option>
          </select>
        </div>
      )}

      {showStatus && (
        <div className="filter-group">
          <label className="filter-label">Gap Status</label>
          <select
            value={filters.gapStatus || 'all'}
            onChange={(e) => handleChange('gapStatus', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Gaps</option>
            <option value="surplus">Surplus</option>
            <option value="shortage">Shortage</option>
            <option value="unallocated">Unallocated</option>
          </select>
        </div>
      )}

      {showLifecycleStatus && (
        <div className="filter-group">
          <label className="filter-label">Model Status</label>
          <select
            value={filters.lifecycleStatus || 'all'}
            onChange={(e) => handleChange('lifecycleStatus', e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Approved">Approved</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Discontinued">Discontinued</option>
          </select>
        </div>
      )}

      <button
        type="button"
        className="btn-reset-filters"
        onClick={() => onFilterChange({
          source: 'all',
          model: 'all',
          wheelLine: 'all',
          gapStatus: 'all',
          lifecycleStatus: 'all',
          search: '',
        })}
        title="Clear Filters"
      >
        🧹 Clear Filters
      </button>
    </div>
  );
}
