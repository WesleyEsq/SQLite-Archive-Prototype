import React, { useState, useEffect, useMemo, useRef } from 'react';
import { backend } from '../services/controller';
import LibraryGrid from '../components/LibraryGrid';

const ITEMS_PER_PAGE = 30; 
const ROWS_PER_CHUNK = 3; // How many tag rows to load at a time

export default function LibraryGridController({ libraryId, onSelectSeries }) {
    const [allEntries, setAllEntries] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("number");
    
    // Pagination & Lazy Loading State
    const [currentPage, setCurrentPage] = useState(1);
    const [tags, setTags] = useState([]);
    const [tagCategories, setTagCategories] = useState([]);
    const [loadedTagsCount, setLoadedTagsCount] = useState(0);
    const [isLoadingRows, setIsLoadingRows] = useState(false);
    
    const loadedCache = useRef(new Set());

    // 1. Initial Mount: Fetch all entries (for search/top row) and all tags
    useEffect(() => {
        if (libraryId) {
            backend.entries.getAll(libraryId).then(res => setAllEntries(res || []));
            
            backend.tags.getAll().then(res => {
                // UPDATE: Only keep tags that have entries AND are marked as categories!
                const validTags = (res || [])
                    .filter(t => t.count > 0 && t.isCategory) 
                    .sort((a, b) => b.count - a.count);
                
                setTags(validTags);
            });
        }
    }, [libraryId]);

    // 2. Fetch a chunk of rows from the backend
    const loadMoreTagRows = async () => {
        if (isLoadingRows || loadedTagsCount >= tags.length) return;
        setIsLoadingRows(true);

        const nextTags = tags.slice(loadedTagsCount, loadedTagsCount + ROWS_PER_CHUNK);
        
        // Fetch all 3 tag rows in parallel for speed
        const newCategories = await Promise.all(nextTags.map(async (tag) => {
            const entries = await backend.entries.getByTag(libraryId, tag.id);
            return { id: tag.id, title: `${tag.name} Collection`, entries: entries || [] };
        }));

        setTagCategories(prev => [...prev, ...newCategories.filter(c => c.entries.length > 0)]);
        setLoadedTagsCount(prev => prev + ROWS_PER_CHUNK);
        setIsLoadingRows(false);
    };

    // 3. Auto-load the first chunk once tags are ready
    useEffect(() => {
        if (tags.length > 0 && loadedTagsCount === 0) {
            loadMoreTagRows();
        }
    }, [tags]);

    // --- Search & Pagination Logic (Unchanged) ---
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

    useEffect(() => setCurrentPage(1), [searchQuery, sortBy]);

    const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
    const paginatedEntries = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredEntries.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredEntries, currentPage]);

    const handlePageChange = (direction) => {
        if (direction === 'next' && currentPage < totalPages) setCurrentPage(p => p + 1);
        if (direction === 'prev' && currentPage > 1) setCurrentPage(p => p - 1);
    };

    // 4. Combine the "All" row with the Lazy-Loaded Tag rows
    const categories = useMemo(() => {
        let cats = [{ id: 'all', title: 'All Library Entries', entries: filteredEntries }];
        return [...cats, ...tagCategories];
    }, [filteredEntries, tagCategories]);

    return (
        <LibraryGrid
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortBy={sortBy}
            setSortBy={setSortBy}
            filteredEntries={filteredEntries}       
            paginatedEntries={paginatedEntries}     
            categories={categories}
            isSearching={searchQuery.length > 0}
            loadedCache={loadedCache}
            onSelectSeries={onSelectSeries}
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
            
            // New Lazy Loading Props
            loadMoreTagRows={loadMoreTagRows}
            hasMoreTags={loadedTagsCount < tags.length}
            isLoadingRows={isLoadingRows}
        />
    );
}