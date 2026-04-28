'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Sparkles, Package, Gift, ArrowRight, Maximize2, Calendar, ChevronRight } from 'lucide-react';
import FormattedDate from '../../../components/common/FormattedDate';
import { useNewArrivals } from '../../../hooks/useNewArrivals';
import ImageSliderModal from '../../../components/common/ImageSliderModal';
import ProductImageSlider from '../../../components/common/ProductImageSlider';

export default function EmployeeNewArrivals() {
    const { subdomain } = useParams();
    const { arrivals, loading } = useNewArrivals();

    const [sliderModal, setSliderModal] = useState({
        isOpen: false,
        images: [],
        index: 0
    });

    return (
        <div className="min-h-screen bg-[var(--color-bg)] pb-32">
            {/* Minimalist Professional Hero */}
            <div className="bg-[var(--color-surface)] border-b border-[var(--color-border)] relative overflow-hidden">
                <div className="max-w-5xl mx-auto px-6 py-20 md:py-28 text-center relative z-10">
                    <div className="inline-flex items-center space-x-2 bg-[var(--color-accent)] text-[var(--color-text)] px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-[var(--color-border)]">
                        <Sparkles size={12} />
                        <span>Exclusive Preview</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[var(--color-text)] mb-8 leading-tight">
                        Next Generation <br />
                        Corporate Rewards
                    </h1>

                    <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed font-bold">
                        Explore an exclusive preview of our upcoming premium collection.
                        Hand-selected pieces designed to elevate your professional reward experience.
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 mt-20">
                {loading && arrivals.length === 0 ? (
                    <div className="bg-[var(--color-surface)] rounded-2xl p-24 text-center border border-[var(--color-border)] shadow-sm">
                        <div className="w-12 h-12 border-2 border-[var(--color-border)] border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
                        <p className="text-[var(--color-text-muted)] font-bold uppercase tracking-widest text-[10px]">Syncing Collection...</p>
                    </div>
                ) : arrivals.length === 0 ? (
                    <div className="bg-[var(--color-surface)] rounded-2xl p-24 text-center border border-[var(--color-border)] shadow-sm flex flex-col items-center">
                        <div className="w-20 h-20 bg-[var(--color-bg)] rounded-2xl flex items-center justify-center mb-8 border border-[var(--color-border)]">
                            <Gift size={32} className="text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-bold text-[var(--color-text)] mb-3 tracking-tight">Curation in Progress</h3>
                        <p className="text-[var(--color-text-muted)] max-w-sm font-medium">Our collection is currently being updated. Please check back soon for our latest professional items.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {arrivals.map((arrival) => (
                            <div
                                key={arrival._id}
                                className="group flex flex-col bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] transition-all duration-300 hover:border-[var(--color-border)] hover:shadow-xl hover:shadow-indigo-900/5 overflow-hidden"
                            >
                                {/* Image Stage */}
                                <div className="h-80 bg-[var(--color-bg)] m-4 rounded-xl relative overflow-hidden border border-[var(--color-border)]">
                                    <ProductImageSlider
                                        images={arrival.images}
                                        onOpenModal={(idx) => setSliderModal({ isOpen: true, images: arrival.images, index: idx })}
                                        showFullscreen={false}
                                    />
                                    {/* Precise Badges */}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                        {arrival.isComingSoon && (
                                            <div className="bg-[var(--color-text)] text-[var(--color-surface)] px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg">
                                                Coming Soon
                                            </div>
                                        )}
                                        {arrival.comingSoonDate && (
                                            <div className="bg-[var(--color-surface)]/90 backdrop-blur-sm border border-[var(--color-border)] px-3 py-1.5 rounded-lg text-[9px] font-bold text-[var(--color-text-muted)] shadow-sm flex items-center gap-2">
                                                <Calendar size={10} />
                                                <FormattedDate date={arrival.comingSoonDate} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="px-8 pb-8 pt-4 flex-1 flex flex-col">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-[var(--color-text)] mb-3 leading-tight group-hover:text-[var(--color-text)] transition-colors">
                                            {arrival.productName}
                                        </h3>
                                        <p className="text-[var(--color-text-muted)] text-sm leading-relaxed line-clamp-2 font-medium">
                                            {arrival.description || 'Exclusive upcoming addition to our collection currently undergoing quality curation.'}
                                        </p>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center space-x-2 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
                                            <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-pulse"></div>
                                            <span>Limited Preview</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Talk to Curation Team Section */}
            <section className="max-w-7xl mx-auto px-6 mt-32">
                <div className="bg-[var(--color-text)] rounded-[2.5rem] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-2xl">
                    <div className="max-w-lg relative z-10">
                        <h2 className="text-3xl md:text-4xl font-black text-[var(--color-surface)] mb-6 tracking-tight">Looking for something specific?</h2>
                        <p className="text-[var(--color-text-muted)] text-lg leading-relaxed font-bold opacity-80">
                            Our curation team works around the clock to bring you the finest corporate gifts.
                            If you have a specific brand or item in mind, let us know directly.
                        </p>
                    </div>
                    <button className="flex-shrink-0 bg-[var(--color-surface)] text-[var(--color-text)] px-10 py-5 rounded-2xl font-black transition-all active:scale-95 flex items-center space-x-4 relative z-10 uppercase tracking-[0.2em] text-xs">
                        <span>Talk to Curation Team</span>
                        <ArrowRight size={20} />
                    </button>
                </div>
            </section>

            <ImageSliderModal
                isOpen={sliderModal.isOpen}
                onClose={() => setSliderModal({ ...sliderModal, isOpen: false })}
                images={sliderModal.images}
                initialIndex={sliderModal.index}
            />
        </div>
    );
}
