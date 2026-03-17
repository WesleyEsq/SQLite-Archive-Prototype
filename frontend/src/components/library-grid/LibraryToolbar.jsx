import React from 'react';
import { Search } from 'lucide-react';

export default function LibraryToolbar({ searchQuery, setSearchQuery, sortBy, setSortBy }) {
    return (
        <div className="library-header-box">
            <div className="library-toolbar">
                <div className="search-input-wrapper">
                    <input 
                        type="text" 
                        placeholder="Search Library..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)} 
                    />
                    <button className="search-circle-btn"><Search size={18} /></button>
                </div>

                <div className="sort-controls">
                    <label>Sort by:</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="number">Default</option>
                        <option value="rank">Rank</option>
                        <option value="title">Title</option>
                    </select>
                </div>
            </div>
        </div>
    );
}