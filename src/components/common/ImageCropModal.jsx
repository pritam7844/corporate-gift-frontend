'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import { X, ZoomIn, ZoomOut, RotateCw, Check, ChevronLeft, ChevronRight, AspectRatio, Image as ImageIcon } from 'lucide-react';

const ImageCropModal = ({ isOpen, images = [], onComplete, onClose, fixedAspect = null }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [aspect, setAspect] = useState(fixedAspect || 1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(0);
            setResults([]);
            setZoom(1);
            setRotation(0);
            setAspect(fixedAspect || 1);
        }
    }, [isOpen, fixedAspect, images.length]);

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const createImage = (url) =>
        new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener('load', () => resolve(image));
            image.addEventListener('error', (error) => reject(error));
            image.setAttribute('crossOrigin', 'anonymous');
            image.src = url;
        });

    const getCroppedImg = async (imageSrc, pixelCrop, rotation = 0) => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) return null;

        const rotRad = (rotation * Math.PI) / 180;
        const { width: bBoxWidth, height: bBoxHeight } = {
            width: Math.abs(Math.cos(rotRad) * image.width) + Math.abs(Math.sin(rotRad) * image.height),
            height: Math.abs(Math.sin(rotRad) * image.width) + Math.abs(Math.cos(rotRad) * image.height),
        };

        canvas.width = bBoxWidth;
        canvas.height = bBoxHeight;

        ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
        ctx.rotate(rotRad);
        ctx.translate(-image.width / 2, -image.height / 2);

        ctx.drawImage(image, 0, 0);

        const data = ctx.getImageData(pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height);

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.putImageData(data, 0, 0);

        return new Promise((resolve) => {
            canvas.toBlob((file) => {
                resolve({
                    blob: file,
                    url: URL.createObjectURL(file)
                });
            }, 'image/jpeg');
        });
    };

    const handleNext = async () => {
        const croppedImage = await getCroppedImg(images[currentIndex].url, croppedAreaPixels, rotation);
        const newResults = [...results, croppedImage];

        if (currentIndex < images.length - 1) {
            setResults(newResults);
            setCurrentIndex(currentIndex + 1);
            setZoom(1);
            setRotation(0);
            if (!fixedAspect) setAspect(1);
        } else {
            onComplete(newResults);
        }
    };

    if (!isOpen || !images.length) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-[var(--color-surface)] w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[80vh] border border-[var(--color-border)]">

                {/* Left: Cropper Stage */}
                <div className="relative bg-[#000] flex items-center justify-center group h-[45vh] md:h-auto md:flex-grow">
                    <Cropper
                        image={images[currentIndex]?.url || ''}
                        crop={crop}
                        zoom={zoom}
                        rotation={rotation}
                        aspect={aspect}
                        onCropChange={setCrop}
                        onRotationChange={setRotation}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                        classes={{
                            containerClassName: "cursor-move",
                            mediaClassName: "max-w-none"
                        }}
                    />

                    {/* Progress Indicator */}
                    <div className="absolute top-6 left-6 z-10 px-4 py-2 bg-black/50 backdrop-blur-md rounded-xl text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border border-white/10">
                        <ImageIcon size={14} className="text-indigo-400" />
                        <span>Image {currentIndex + 1} of {images.length}</span>
                    </div>

                    {/* Aspect Ratio Shortcuts removed from overlay to improve visibility */}
                </div>

                {/* Right: Controls Panel */}
                <div className="w-full md:w-80 bg-[var(--color-surface)] border-l border-[var(--color-border)] flex flex-col h-[55vh] md:h-auto">
                    <div className="p-4 md:p-6 border-b border-[var(--color-border)] flex justify-between items-center bg-[var(--color-surface)] z-10">
                        <div>
                            <h2 className="text-base md:text-lg font-black tracking-tight" style={{ color: 'var(--color-text)' }}>Adjust Asset</h2>
                            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest mt-0.5 md:mt-1" style={{ color: 'var(--color-text-muted)' }}>Precision Cropping</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-[var(--color-bg)] rounded-xl transition-all" style={{ color: 'var(--color-text-muted)' }}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-grow p-4 md:p-6 space-y-6 md:space-y-10 overflow-y-auto custom-scrollbar">
                        {/* Aspect Ratio Section */}
                        {!fixedAspect && (
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Aspect Ratio</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setAspect(1)}
                                        className={`flex flex-col items-center justify-center p-4 rounded-[2px] border transition-all duration-300 ${aspect === 1 ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
                                    >
                                        <div className="w-6 h-6 border-2 border-current rounded-sm mb-2 opacity-80"></div>
                                        <span className="text-[10px] font-black uppercase tracking-tighter">1:1 Square</span>
                                    </button>
                                    <button
                                        onClick={() => setAspect(3 / 4)}
                                        className={`flex flex-col items-center justify-center p-4 rounded-[2px] border transition-all duration-300 ${aspect === 3 / 4 ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-400'}`}
                                    >
                                        <div className="w-5 h-7 border-2 border-current rounded-sm mb-2 opacity-80"></div>
                                        <span className="text-[10px] font-black uppercase tracking-tighter">3:4 Portrait</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Zoom Control */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Scale Adjustment</label>
                                <span className="text-[10px] font-black" style={{ color: 'var(--color-text)' }}>{Math.round(zoom * 100)}%</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <ZoomOut size={16} style={{ color: 'var(--color-text-muted)' }} />
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full h-1.5 bg-slate-400 rounded-lg appearance-none cursor-pointer accent-slate-900 transition-all"
                                />
                                <ZoomIn size={16} style={{ color: 'var(--color-text-muted)' }} />
                            </div>
                        </div>

                        {/* Rotation Control */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>Orientation</label>
                                <span className="text-[10px] font-black" style={{ color: 'var(--color-text)' }}>{rotation}°</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    value={rotation}
                                    min={0}
                                    max={360}
                                    step={1}
                                    aria-labelledby="Rotation"
                                    onChange={(e) => setRotation(Number(e.target.value))}
                                    className="w-full h-1.5 bg-slate-400 rounded-lg appearance-none cursor-pointer accent-slate-900 transition-all"
                                />
                                <button
                                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                                    className="p-2 rounded-lg bg-[var(--color-bg)] hover:bg-[var(--color-border)] transition-all"
                                    style={{ color: 'var(--color-text)' }}
                                >
                                    <RotateCw size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Guidelines / Tips */}
                        {/* <div className="p-4 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg)]/50">
                            <p className="text-[10px] leading-relaxed font-bold" style={{ color: 'var(--color-text-muted)' }}>
                                {fixedAspect 
                                    ? "This asset requires a strict 1:1 ratio. Drag to position the key subject within the frame."
                                    : "Choose between 1:1 or 3:4 for this asset. High-resolution crops ensure premium display quality."
                                }
                            </p>
                        </div> */}
                    </div>

                    <div className="p-4 md:p-6 bg-[var(--color-bg)]/30 border-t border-[var(--color-border)]">
                        <button
                            onClick={handleNext}
                            className="w-full py-3.5 md:py-4 rounded-xl bg-[var(--color-text)] text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:opacity-90 active:scale-95 transition-all shadow-xl"
                        >
                            {currentIndex < images.length - 1 ? (
                                <>
                                    Next Image <ChevronRight size={16} />
                                </>
                            ) : (
                                <>
                                    Apply All Crops <Check size={16} />
                                </>
                            )}
                        </button>
                        <p className="text-[9px] text-center mt-4 font-bold uppercase tracking-tighter opacity-50">
                            {currentIndex + 1} of {images.length} processed
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageCropModal;
