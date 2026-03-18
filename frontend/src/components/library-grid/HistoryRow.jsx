import React, { useRef } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { ChevronLeft, ChevronRight, PlaySquare } from 'lucide-react';
import HistoryCard from './HistoryCard';

export default function HistoryRow({ historyItems, onResume }) {
    const scrollerRef = useRef(null);

    const scrollCarousel = (direction) => {
        if (scrollerRef.current) {
            scrollerRef.current.scrollBy({ left: direction === 'left' ? -800 : 800, behavior: 'smooth' });
        }
    };

    if (!historyItems || historyItems.length === 0) return null;

    return (
        <div className="category-row" style={{ marginBottom: '40px', width: '100%' }}>
            <h2 className="section-title" style={{ paddingLeft: '30px', color: 'var(--ui-header)', fontWeight: 800, fontSize: '1.2rem' }}>
                <PlaySquare size={20} style={{ marginRight: '10px' }} /> Continue Watching
            </h2>
            
            {/* 1. WRAPPER HEIGHT SHRUNK FROM 480px TO 160px */}
            <div className="carousel-wrapper" style={{ height: '160px', position: 'relative', width: '100%' }}>
                <button className="carousel-btn left" onClick={() => scrollCarousel('left')}>
                    <ChevronLeft size={24} />
                </button>

                <Virtuoso
                    horizontalDirection
                    data={historyItems}
                    className="carousel-scroller custom-scrollbar"
                    style={{ height: '100%', width: '100%' }}
                    scrollerRef={(ref) => scrollerRef.current = ref}
                    itemContent={(_, item) => (
                        /* 2. ITEM CONTENT HEIGHT SHRUNK TO 130px */
                        <div style={{ width: '260px', height: '100%', padding: '10px 10px 20px 10px' }}>
                            <div style={{ height: '130px' }}>
                                <HistoryCard historyItem={item} onResume={onResume} />
                            </div>
                        </div>
                    )}
                />

                <button className="carousel-btn right" onClick={() => scrollCarousel('right')}>
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
    );
}