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
        <div className="min-h-screen bg-white pb-32 selection:bg-blue-100 selection:text-blue-900">
            {/* Minimalist Professional Hero */}
            <div className="bg-[#F9FAFB] border-b border-gray-100">
                <div className="max-w-5xl mx-auto px-6 py-20 md:py-32 text-center">
                    {/* <div className="inline-flex items-center space-x-2 bg-white text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 border border-gray-200 shadow-sm">
                        <Sparkles size={12} />
                        <span>Future Collection</span>
                    </div> */}

                    <h1 className="text-4xl md:text-6xl font-black tracking-tight text-gray-900 mb-8 leading-[1.1]">
                        The Next Generation of <br />
                        <span className="text-blue-600">Corporate Gifting.</span>
                    </h1>

                    <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed font-medium">
                        Explore an exclusive preview of our upcoming premium rewards.
                        Hand-selected pieces designed to elevate your professional experience.
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 mt-20">
                {loading && arrivals.length === 0 ? (
                    <div className="bg-gray-50 rounded-[2rem] p-24 text-center border border-gray-100">
                        <div className="w-12 h-12 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Loading Preview...</p>
                    </div>
                ) : arrivals.length === 0 ? (
                    <div className="bg-gray-50 rounded-[2rem] p-24 text-center border border-gray-100 flex flex-col items-center">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-8 shadow-sm">
                            <Gift size={32} className="text-gray-200" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">No new arrivals listed</h3>
                        <p className="text-gray-500 max-w-sm font-medium">Our collection is currently being updated. Please check back soon for our latest curated items.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        {arrivals.map((arrival) => (
                            <div
                                key={arrival._id}
                                className="group flex flex-col bg-[#F9FAFB] rounded-[2rem] border border-gray-100 transition-all duration-300 hover:border-blue-100 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden"
                            >
                                {/* Image Stage - Clean White */}
                                <div className="aspect-[1/1] bg-white m-3 rounded-[1.5rem] relative overflow-hidden border border-gray-50">
                                    <ProductImageSlider
                                        images={arrival.images}
                                        onOpenModal={(idx) => setSliderModal({ isOpen: true, images: arrival.images, index: idx })}
                                    />

                                    {/* Precise Badges */}
                                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                                        {arrival.isComingSoon && (
                                            <div className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20">
                                                Coming Soon
                                            </div>
                                        )}
                                        {arrival.comingSoonDate && (
                                            <div className="bg-white/90 backdrop-blur-sm border border-gray-100 px-3 py-1.5 rounded-lg text-[9px] font-bold text-gray-600 shadow-sm flex items-center gap-2">
                                                <Calendar size={10} />
                                                <FormattedDate date={arrival.comingSoonDate} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Content - Sophisticated Layout */}
                                <div className="px-8 pb-8 pt-4 flex-1 flex flex-col">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">
                                            {arrival.productName}
                                        </h3>
                                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 font-medium">
                                            {arrival.description || 'Pre-ordering soon. This exclusive addition to our collection is currently undergoing quality curation.'}
                                        </p>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center space-x-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                                            <span>Limited Preview</span>
                                        </div>
                                        {/* <button className="flex items-center space-x-1 text-blue-600 font-bold text-sm hover:translate-x-1 transition-transform">
                                            <span>Notify Me</span>
                                            <ChevronRight size={16} />
                                        </button> */}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Stable Support Section */}
            <section className="max-w-7xl mx-auto px-6 mt-32">
                <div className="bg-gray-50 rounded-[2.5rem] p-12 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12 border border-gray-100 shadow-sm">
                    <div className="max-w-lg">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Looking for something specific?</h2>
                        <p className="text-gray-500 text-lg leading-relaxed font-medium">
                            Our curation team works around the clock to bring you the finest corporate gifts.
                            If you have a specific brand or item in mind, let us know.
                        </p>
                    </div>
                    <button className="flex-shrink-0 bg-gray-900 hover:bg-black text-white px-10 py-5 rounded-2xl font-bold transition-all shadow-xl shadow-gray-900/10 active:scale-95 flex items-center space-x-3">
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
