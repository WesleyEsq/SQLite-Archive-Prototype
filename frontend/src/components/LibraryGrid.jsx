import React from 'react';
import { VirtuosoGrid } from 'react-virtuoso';
import { ChevronLeft, ChevronRight } from 'lucide-react'; 
import LibraryToolbar from './library-grid/LibraryToolbar';
import LibraryCard from './library-grid/LibraryCard';
import LibraryCategoryRow from './library-grid/LibraryCategoryRow';
import HistoryRow from './library-grid/HistoryRow';

export default function LibraryGrid({ 
    searchQuery, setSearchQuery, sortBy, setSortBy, 
    filteredEntries, paginatedEntries, categories, isSearching, 
    loadedCache, onSelectSeries,
    currentPage, totalPages, handlePageChange,
    loadMoreTagRows, hasMoreTags, isLoadingRows, recentHistory, onResume
}) {
    return (
        <div className="library-wrapper">
            <LibraryToolbar 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery} 
                sortBy={sortBy} 
                setSortBy={setSortBy} 
            />

            <div className="library-content-area" style={{ width: '100%', height: 'calc(100vh - 100px)' }}>
                {isSearching ? (
                    /* --- SEARCH MODE (Grid) --- */
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 30px' }}>
                            <h2 className="section-title" style={{ margin: 0 }}>
                                Search Results ({filteredEntries.length})
                            </h2>
                            
                            {totalPages > 1 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <button 
                                        className="action-rect-btn" 
                                        style={{ padding: '6px 12px', opacity: currentPage === 1 ? 0.5 : 1 }}
                                        disabled={currentPage === 1}
                                        onClick={() => handlePageChange('prev')}
                                    >
                                        <ChevronLeft size={18} /> Prev
                                    </button>
                                    <span style={{ fontWeight: 'bold', color: 'var(--ui-header)' }}>
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button 
                                        className="action-rect-btn" 
                                        style={{ padding: '6px 12px', opacity: currentPage === totalPages ? 0.5 : 1 }}
                                        disabled={currentPage === totalPages}
                                        onClick={() => handlePageChange('next')}
                                    >
                                        Next <ChevronRight size={18} />
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <VirtuosoGrid
                            style={{ height: '100%', width: '100%' }}
                            className="custom-scrollbar"
                            data={paginatedEntries} 
                            components={{
                                List: React.forwardRef(({ style, children, ...props }, ref) => (
                                    <div ref={ref} {...props} className="virtuoso-grid-list" style={{ ...style, display: 'flex', flexWrap: 'wrap', padding: '0 20px' }}>
                                        {children}
                                    </div>
                                ))
                            }}
                            itemContent={(index, entry) => (
                                <div style={{ height: '320px', width: '240px', padding: '10px' }}>
                                    <LibraryCard entry={entry} onSelectSeries={onSelectSeries} loadedCache={loadedCache} />
                                </div>
                            )}
                        />
                    </div>
                ) : (
                    /* --- NETFLIX MODE (Multiple Rows) --- */
                    <div className="custom-scrollbar" style={{ height: '100%', width: '100%', overflowY: 'auto' }}>
                        
                        {/* Map all currently loaded categories */}
                        {categories.length > 0 && (
                            <LibraryCategoryRow 
                                key={categories[0].id}
                                title={categories[0].title}
                                entries={categories[0].entries}
                                onSelectSeries={onSelectSeries}
                                loadedCache={loadedCache}
                            />
                        )}

                        {/* 2. Render the Slim History Row SECOND */}
                        <HistoryRow historyItems={recentHistory} onResume={onResume} />

                        {/* 3. Render the remaining Tag Categories THIRD */}
                        {categories.slice(1).map(category => (
                            <LibraryCategoryRow 
                                key={category.id}
                                title={category.title}
                                entries={category.entries}
                                onSelectSeries={onSelectSeries}
                                loadedCache={loadedCache}
                            />
                        ))}

                        {/* Pagination Trigger for Rows */}
                        {hasMoreTags && (
                            <div className="load-more-container" style={{ paddingBottom: '60px' }}>
                                <button 
                                    className="load-more-btn" 
                                    onClick={loadMoreTagRows}
                                    disabled={isLoadingRows}
                                >
                                    {isLoadingRows ? "Loading..." : "Load More Collections"}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}