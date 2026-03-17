// frontend/src/components/LibraryGrid.jsx
import React from 'react';
import { Virtuoso, VirtuosoGrid } from 'react-virtuoso';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Sub-components (Make sure you created these from the previous step!)
import LibraryToolbar from './library-grid/LibraryToolbar';
import LibraryCard from './library-grid/LibraryCard';

export default function LibraryGrid({ 
    // These all come from the Controller now!
    searchQuery, setSearchQuery, sortBy, setSortBy, 
    filteredEntries, isSearching, scrollerRef, loadedCache, 
    scrollCarousel, onSelectSeries 
}) {
    return (
        <div className="library-wrapper">
            {/* The Toolbar handles the Search and Sort UI */}
            <LibraryToolbar 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery} 
                sortBy={sortBy} 
                setSortBy={setSortBy} 
            />

            <div className="library-content-area">
                {isSearching ? (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {/* SEARCH RESULTS VIEW */}
                        <h3 className="section-title" style={{ paddingLeft: '30px', marginTop: '10px' }}>
                            Search Results ({filteredEntries.length})
                        </h3>
                        
                        <VirtuosoGrid
                            style={{ height: '100%' }}
                            className="custom-scrollbar"
                            data={filteredEntries}
                            totalCount={filteredEntries.length}
                            components={{
                                List: React.forwardRef(({ style, children, ...props }, ref) => (
                                    <div ref={ref} {...props} className="virtuoso-grid-list" style={{ ...style }}>
                                        {children}
                                    </div>
                                ))
                            }}
                            itemContent={(index, entry) => (
                                <div style={{ height: '320px', width: '100%' }}>
                                    <LibraryCard entry={entry} onSelectSeries={onSelectSeries} loadedCache={loadedCache} />
                                </div>
                            )}
                        />
                    </div>
                ) : (
                    <div className="category-row">
                        {/* CAROUSEL VIEW */}
                        <h3 className="section-title">All Library Entries <span className="count-badge">{filteredEntries.length}</span></h3>
                        
                        <div className="carousel-wrapper" style={{ height: 380, position: 'relative' }}>
                            <button className="carousel-btn left" onClick={() => scrollCarousel('left')}>
                                <ChevronLeft size={32} />
                            </button>

                            <Virtuoso
                                horizontalDirection
                                data={filteredEntries}
                                style={{ height: '100%' }}
                                scrollerRef={(ref) => scrollerRef.current = ref}
                                itemContent={(_, entry) => (
                                    <div style={{ width: 240, height: '100%', padding: '10px' }}>
                                        <div style={{ height: 320 }}>
                                            <LibraryCard entry={entry} onSelectSeries={onSelectSeries} loadedCache={loadedCache} />
                                        </div>
                                    </div>
                                )}
                            />

                            <button className="carousel-btn right" onClick={() => scrollCarousel('right')}>
                                <ChevronRight size={32} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}