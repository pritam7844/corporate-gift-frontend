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
        <div className="min-h-screen bg-slate-50 pb-32">
            {/* Minimalist Professional Hero */}
            <div className="bg-white border-b border-slate-100 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-[100px] -z-10 -translate-y-1/2 translate-x-1/2 opacity-30"></div>

                <div className="max-w-5xl mx-auto px-6 py-20 md:py-28 text-center relative z-10">
                    <div className="inline-flex items-center space-x-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] mb-8 border border-indigo-100/50">
                        <Sparkles size={12} />
                        <span>Exclusive Preview</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-8 leading-tight">
                        Next Generation <br />
                        <span className="text-indigo-600">Corporate Rewards</span>
                    </h1>

                    <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
                        Explore an exclusive preview of our upcoming premium collection.
                        Hand-selected pieces designed to elevate your professional reward experience.
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 mt-20">
                {loading && arrivals.length === 0 ? (
                    <div className="bg-white rounded-2xl p-24 text-center border border-slate-100 shadow-sm">
                        <div className="w-12 h-12 border-2 border-slate-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Syncing Collection...</p>
                    </div>
                ) : arrivals.length === 0 ? (
                    <div className="bg-white rounded-2xl p-24 text-center border border-slate-100 shadow-sm flex flex-col items-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 border border-slate-100">
                            <Gift size={32} className="text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Curation in Progress</h3>
                        <p className="text-slate-500 max-w-sm font-medium">Our collection is currently being updated. Please check back soon for our latest professional items.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {arrivals.map((arrival) => (
                            <div
                                key={arrival._id}
                                className="group flex flex-col bg-white rounded-2xl border border-slate-100 transition-all duration-300 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-900/5 overflow-hidden"
                            >
                                {/* Image Stage */}
                                <div className="h-80 bg-slate-50 m-4 rounded-xl relative overflow-hidden border border-slate-100">
                                    <ProductImageSlider
                                        images={arrival.images}
                                        onOpenModal={(idx) => setSliderModal({ isOpen: true, images: arrival.images, index: idx })}
                                        showFullscreen={false}
                                    />
                                    {/* Precise Badges */}
                                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                                        {arrival.isComingSoon && (
                                            <div className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-600/20">
                                                Coming Soon
                                            </div>
                                        )}
                                        {arrival.comingSoonDate && (
                                            <div className="bg-white/90 backdrop-blur-sm border border-slate-100 px-3 py-1.5 rounded-lg text-[9px] font-bold text-slate-600 shadow-sm flex items-center gap-2">
                                                <Calendar size={10} />
                                                <FormattedDate date={arrival.comingSoonDate} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="px-8 pb-8 pt-4 flex-1 flex flex-col">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-indigo-600 transition-colors">
                                            {arrival.productName}
                                        </h3>
                                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 font-medium">
                                            {arrival.description || 'Exclusive upcoming addition to our collection currently undergoing quality curation.'}
                                        </p>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
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
                <div className="bg-slate-900 rounded-3xl p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[120px] -z-0 translate-x-1/2 -translate-y-1/2 opacity-20"></div>

                    <div className="max-w-lg relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">Looking for something specific?</h2>
                        <p className="text-slate-400 text-lg leading-relaxed font-medium">
                            Our curation team works around the clock to bring you the finest corporate gifts.
                            If you have a specific brand or item in mind, let us know directly.
                        </p>
                    </div>
                    <button className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-2xl font-bold transition-all shadow-xl shadow-indigo-900/20 active:scale-95 flex items-center space-x-4 relative z-10 uppercase tracking-widest text-sm">
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
