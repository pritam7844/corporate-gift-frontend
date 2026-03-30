'use client';

import { useState, useRef, useEffect } from 'react';
import { Maximize2, Fullscreen, Maximize } from 'lucide-react';

export default function ProductImageSlider({ images, onOpenModal, className = "" }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollRef = useRef(null);

    // Synchronize scroll position with currentIndex for buttons/dots
    useEffect(() => {
        if (scrollRef.current) {
            const itemWidth = scrollRef.current.offsetWidth;
            scrollRef.current.scrollTo({
                left: currentIndex * itemWidth,
                behavior: 'smooth'
            });
        }
    }, [currentIndex]);

    // Handle manual scroll to update dots
    const handleScroll = () => {
        if (scrollRef.current) {
            const scrollPosition = scrollRef.current.scrollLeft;
            const itemWidth = scrollRef.current.offsetWidth;
            const newIndex = Math.round(scrollPosition / itemWidth);
            if (newIndex !== currentIndex && newIndex >= 0 && newIndex < images.length) {
                setCurrentIndex(newIndex);
            }
        }
    };

    if (!images || images.length === 0) return null;

    const showControls = images.length > 1;

    return (
        <div className={`relative group/slider w-full h-full overflow-hidden ${className}`}>
            {/* Main Image Container */}
            <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {images.map((img, idx) => (
                    <div key={idx} className="flex-shrink-0 w-full h-full snap-center flex items-center justify-center p-4">
                        <img
                            src={img}
                            alt={`Product View ${idx + 1}`}
                            className="w-full h-full object-contain pointer-events-none select-none"
                        />
                    </div>
                ))}
            </div>

            {/* Logic for manual scroll to update dots is handled by handleScroll */}

            {/* Flipkart-Style Slidable Dots */}
            {showControls && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 px-3 py-1.5 bg-black/5 backdrop-blur-sm rounded-full max-w-[80%] overflow-x-auto no-scrollbar">
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                            className={`flex-shrink-0 transition-all duration-300 rounded-full ${currentIndex === idx ? 'w-5 h-1.5 bg-blue-600' : 'w-1.5 h-1.5 bg-gray-300'}`}
                        />
                    ))}
                </div>
            )}

            {/* Full Screen Action */}
            <button
                onClick={(e) => { e.stopPropagation(); onOpenModal && onOpenModal(currentIndex); }}
                className="absolute bottom-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm border border-gray-100 rounded-xl flex items-center justify-center text-gray-600 shadow-sm hover:text-blue-600 transition-colors opacity-0 group-hover/slider:opacity-100"
                title="View Full Screen"
            >
                <Maximize size={18} />
            </button>

            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
