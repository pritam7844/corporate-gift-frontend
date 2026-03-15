'use client';

import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function ImageSliderModal({ isOpen, onClose, images, initialIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, initialIndex]);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
        const itemWidth = scrollRef.current.offsetWidth;
        scrollRef.current.scrollTo({
            left: currentIndex * itemWidth,
            behavior: 'smooth'
        });
    }
  }, [currentIndex, isOpen]);

  if (!isOpen || !images || images.length === 0) return null;

  const handleNext = (e) => {
    e.stopPropagation();
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 md:p-8"
      onClick={onClose}
    >
      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-[110]"
      >
        <X size={24} />
      </button>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button 
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-[110] disabled:opacity-20 disabled:cursor-not-allowed ${currentIndex === 0 ? 'hidden md:flex' : 'flex'}`}
          >
            <ChevronLeft size={32} />
          </button>
          <button 
            onClick={handleNext}
            disabled={currentIndex === images.length - 1}
            className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all z-[110] disabled:opacity-20 disabled:cursor-not-allowed ${currentIndex === images.length - 1 ? 'hidden md:flex' : 'flex'}`}
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      {/* Main Slider Content */}
      <div 
        className="relative w-full max-w-5xl aspect-video md:aspect-auto md:h-[80vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div 
            ref={scrollRef}
            className="w-full h-full flex overflow-x-hidden snap-x snap-mandatory no-scrollbar"
        >
          {images.map((img, idx) => (
            <div key={idx} className="flex-shrink-0 w-full h-full flex items-center justify-center snap-center">
              <img 
                src={img} 
                alt={`Product Image ${idx + 1}`}
                className="max-w-full max-h-full object-contain shadow-2xl rounded-2xl"
              />
            </div>
          ))}
        </div>

        {/* Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 flex items-center space-x-2">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all ${currentIndex === idx ? 'bg-white w-6' : 'bg-white/30'}`}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
