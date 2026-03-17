import React, { useRef } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LibraryCard from './LibraryCard';

export default function LibraryCategoryRow({ title, entries, onSelectSeries, loadedCache }) {
    const scrollerRef = useRef(null);

    const scrollCarousel = (direction) => {
        if (scrollerRef.current) {
            scrollerRef.current.scrollBy({ 
                left: direction === 'left' ? -800 : 800, 
                behavior: 'smooth' 
            });
        }
    };

    if (!entries || entries.length === 0) return null;

    return (
        <div className="category-row" style={{ marginBottom: '40px', width: '100%' }}>
            <h3 className="section-title" style={{ paddingLeft: '30px' }}>
                {title} <span className="count-badge">{entries.length}</span>
            </h3>
            
            {/* 1. INCREASED HEIGHT TO 480px to fit the hover animation and scrollbar */}
            <div className="carousel-wrapper" style={{ height: '480px', position: 'relative', width: '100%' }}>
                <button className="carousel-btn left" onClick={() => scrollCarousel('left')}>
                    <ChevronLeft size={32} />
                </button>

                <Virtuoso
                    horizontalDirection
                    data={entries}
                    /* 2. Added carousel-scroller class here */
                    className="carousel-scroller custom-scrollbar"
                    style={{ height: '100%', width: '100%' }}
                    scrollerRef={(ref) => scrollerRef.current = ref}
                    itemContent={(_, entry) => (
                        /* 3. Added top/bottom padding so the drop-shadow isn't clipped */
                        <div style={{ width: '280px', height: '100%', padding: '20px 10px 30px 10px' }}>
                            <div style={{ height: '420px' }}>
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
    );
}