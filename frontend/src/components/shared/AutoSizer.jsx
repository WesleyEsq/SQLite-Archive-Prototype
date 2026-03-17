import React, { useState, useEffect, useRef } from 'react';

export default function AutoSizer({ children, className = "", style = {} }) {
    const wrapperRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (!wrapperRef.current) return;

        // Create an observer to watch for size changes
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                // Get the exact size of the container
                const { width, height } = entry.contentRect;
                setDimensions({ width, height });
            }
        });

        resizeObserver.observe(wrapperRef.current);

        // Cleanup
        return () => resizeObserver.disconnect();
    }, []);

    return (
        <div 
            ref={wrapperRef} 
            className={className}
            style={{ 
                width: '100%', 
                height: '100%', 
                overflow: 'hidden', 
                ...style 
            }}
        >
            {/* Only render children once we have a valid size */}
            {dimensions.width > 0 && dimensions.height > 0 && children({
                width: dimensions.width,
                height: dimensions.height
            })}
        </div>
    );
}