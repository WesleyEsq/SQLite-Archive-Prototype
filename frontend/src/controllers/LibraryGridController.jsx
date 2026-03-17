// src/controllers/LibraryGridController.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { GetEntries } from '../../wailsjs/go/backend/App';
import LibraryGrid from '../components/LibraryGrid';

export default function LibraryGridController({ libraryId, onSelectSeries }) {
    // 1. State Management
    const [allEntries, setAllEntries] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("number");
    
    // 2. Refs (Passed down to UI for DOM manipulation/caching)
    const scrollerRef = useRef(null);
    const loadedCache = useRef(new Set());

    // 3. Wails Backend Fetch
    useEffect(() => {
        if (libraryId) {
            GetEntries(libraryId)
                .then(res => setAllEntries(res || []))
                .catch(err => console.error("Error fetching entries:", err));
        }
    }, [libraryId]);

    // 4. Sorting & Filtering Logic
    const filteredEntries = useMemo(() => {
        let result = allEntries;
        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase();
            result = result.filter(e => 
                (e.title && e.title.toLowerCase().includes(lowerQ)) || 
                (e.comment && e.comment.toLowerCase().includes(lowerQ))
            );
        }
        switch (sortBy) {
            case 'rank': result = [...result].sort((a, b) => (a.rank || "").localeCompare(b.rank || "")); break;
            case 'title': result = [...result].sort((a, b) => (a.title || "").localeCompare(b.title || "")); break;
            default: result = [...result].sort((a, b) => Number(a.number) - Number(b.number));
        }
        return result;
    }, [allEntries, searchQuery, sortBy]);

    // 5. Actions
    const scrollCarousel = (direction) => {
        if (scrollerRef.current) {
            scrollerRef.current.scrollBy({ 
                left: direction === 'left' ? -800 : 800, 
                behavior: 'smooth' 
            });
        }
    };

    const isSearching = searchQuery.length > 0;

    // 6. Render the "Dumb" Component
    return (
        <LibraryGrid
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortBy={sortBy}
            setSortBy={setSortBy}
            filteredEntries={filteredEntries}
            isSearching={isSearching}
            scrollerRef={scrollerRef}
            loadedCache={loadedCache}
            scrollCarousel={scrollCarousel}
            onSelectSeries={onSelectSeries}
        />
    );
}